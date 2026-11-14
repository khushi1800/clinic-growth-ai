// ============================================================
// Clinic Growth AI — Conversations API
// src/api/conversations.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult, ApiListResult } from '../types/api';
import type {
  Conversation, ConversationInsert, ConversationUpdate,
  Message, MessageInsert,
} from '../types/database';

// ---- Conversations -----------------------------------------

export async function getConversations(
  clinicId: string,
  options: { leadId?: string; status?: string; limit?: number } = {}
): Promise<ApiListResult<Conversation>> {
  try {
    let query = supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId);

    if (options.leadId) query = query.eq('lead_id', options.leadId);
    if (options.status) query = query.eq('status', options.status);

    query = query
      .order('started_at', { ascending: false })
      .limit(options.limit ?? 50);

    const { data, error, count } = await query;
    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null, count: count ?? 0 };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function getConversation(conversationId: string): Promise<ApiResult<Conversation>> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function createConversation(input: ConversationInsert): Promise<ApiResult<Conversation>> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function updateConversation(
  conversationId: string,
  input: ConversationUpdate
): Promise<ApiResult<Conversation>> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update(input)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

export async function closeConversation(conversationId: string): Promise<ApiResult<Conversation>> {
  return updateConversation(conversationId, {
    status: 'closed',
    ended_at: new Date().toISOString(),
  });
}

export async function escalateConversation(conversationId: string): Promise<ApiResult<Conversation>> {
  return updateConversation(conversationId, { status: 'escalated' });
}

// ---- Messages ----------------------------------------------

export async function getMessages(
  conversationId: string,
  limit = 100
): Promise<ApiListResult<Message>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) return { data: [], error: { message: error.message, code: error.code } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: [], error: { message: String(err) } };
  }
}

export async function addMessage(input: MessageInsert): Promise<ApiResult<Message>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: { message: error.message, code: error.code } };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Returns the full message history for a conversation as a flat array,
 * suitable for passing to AI model context.
 */
export async function getConversationHistory(
  conversationId: string
): Promise<ApiResult<Array<{ role: string; content: string }>>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) return { data: null, error: { message: error.message } };
    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Subscribe to real-time new messages in a conversation.
 * Returns the subscription channel — call channel.unsubscribe() to clean up.
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();
}
