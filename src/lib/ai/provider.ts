import type { ChatMessage, AIOptions, AIResponse, ClinicContext } from './types';
import { MockAIProvider, DEFAULT_MOCK_CLINIC_CONTEXT } from './mock-provider';

/**
 * Common AI Provider Interface
 */
export interface AIProvider {
  generateResponse(messages: ChatMessage[], systemPrompt: string, options?: AIOptions): Promise<AIResponse>;
  generateStream(messages: ChatMessage[], systemPrompt: string, options?: AIOptions): AsyncGenerator<string>;
}

/**
 * Google Gemini REST API Provider (Fetch-based, Zero SDK dependencies)
 */
export class GoogleAIProvider implements AIProvider {
  private apiKey: string;
  private defaultModel: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey?: string, defaultModel = 'gemini-1.5-flash') {
    // Read from constructor argument or Vite client environment variable safely
    const envKey =
      typeof import.meta !== 'undefined' && import.meta.env
        ? (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
        : undefined;

    this.apiKey = apiKey || envKey || '';
    this.defaultModel = defaultModel;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Formats chat messages into Gemini API format
   */
  private formatContents(messages: ChatMessage[]) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
  }

  public async generateResponse(
    messages: ChatMessage[],
    systemPrompt: string,
    options?: AIOptions
  ): Promise<AIResponse> {
    const key = options?.apiKey || this.apiKey;
    if (!key) {
      throw new Error(
        'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in .env or pass apiKey in options.'
      );
    }

    const model = options?.model || this.defaultModel;
    const url = `${this.baseUrl}/${model}:generateContent?key=${encodeURIComponent(key)}`;

    const contents = this.formatContents(messages);

    const generationConfig: {
      temperature: number;
      maxOutputTokens: number;
      stopSequences?: string[];
    } = {
      temperature: options?.temperature ?? 0.3,
      maxOutputTokens: options?.maxTokens ?? 1024,
    };

    if (options?.stopSequences && options.stopSequences.length > 0) {
      generationConfig.stopSequences = options.stopSequences;
    }

    const payload: {
      contents: ReturnType<GoogleAIProvider['formatContents']>;
      generationConfig: typeof generationConfig;
      system_instruction?: { parts: Array<{ text: string }> };
    } = {
      contents,
      generationConfig,
    };

    if (systemPrompt && systemPrompt.trim().length > 0) {
      payload.system_instruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown network error');
      throw new Error(`Google Gemini API request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    const finishReason = candidate?.finishReason;

    return {
      content: text,
      raw: data,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined,
      finishReason,
    };
  }

  public async *generateStream(
    messages: ChatMessage[],
    systemPrompt: string,
    options?: AIOptions
  ): AsyncGenerator<string> {
    const key = options?.apiKey || this.apiKey;
    if (!key) {
      throw new Error(
        'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in .env or pass apiKey in options.'
      );
    }

    const model = options?.model || this.defaultModel;
    const url = `${this.baseUrl}/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`;

    const contents = this.formatContents(messages);

    const payload: {
      contents: ReturnType<GoogleAIProvider['formatContents']>;
      generationConfig: { temperature: number; maxOutputTokens: number };
      system_instruction?: { parts: Array<{ text: string }> };
    } = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.3,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    };

    if (systemPrompt && systemPrompt.trim().length > 0) {
      payload.system_instruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Google Gemini Streaming request failed (${response.status}): ${errText}`);
    }

    if (!response.body) {
      throw new Error('Streaming response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk) {
                yield textChunk;
              }
            } catch {
              // Ignore partial or unparseable chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export { MockAIProvider };

export interface ProviderFactoryOptions {
  type?: 'google' | 'mock' | 'auto';
  apiKey?: string;
  clinicContext?: ClinicContext;
  simulatedDelayMs?: number;
}

/**
 * Factory that returns the appropriate AIProvider.
 * Defaults to MockAIProvider when no API key is available, ensuring rock-solid demo functionality.
 */
export function getAIProvider(options?: ProviderFactoryOptions): AIProvider {
  const preferredType = options?.type ?? 'auto';
  const apiKey =
    options?.apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
      : undefined);

  if (preferredType === 'google' || (preferredType === 'auto' && apiKey && apiKey.trim().length > 0)) {
    return new GoogleAIProvider(apiKey);
  }

  return new MockAIProvider({
    simulatedDelayMs: options?.simulatedDelayMs ?? 150,
    clinicContext: options?.clinicContext ?? DEFAULT_MOCK_CLINIC_CONTEXT,
  });
}
