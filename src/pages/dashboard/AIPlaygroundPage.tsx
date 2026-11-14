import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Zap,
  CheckCircle2,
  Calendar,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { handleMessage } from '@/lib/ai/receptionist';
import type { ChatMessage, ClinicContext, ReceptionistResult } from '@/lib/ai/types';

const PLAYGROUND_CLINIC_CONTEXT: ClinicContext = {
  clinicId: 'clinic-demo-01',
  name: 'Smile Dental Clinic [DEMO]',
  tagline: 'Your Trusted Family Dental Care & Aesthetics',
  doctors: [
    {
      id: 'doc-1',
      name: 'Dr. Rohan Sharma',
      qualification: 'MDS (Endodontics)',
      specialization: 'Endodontist',
      experienceYears: 14,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['10:00 AM - 01:00 PM', '04:00 PM - 08:00 PM'],
    },
    {
      id: 'doc-2',
      name: 'Dr. Pooja Iyer',
      qualification: 'BDS',
      specialization: 'Cosmetic',
      experienceYears: 7,
      availableDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      timeSlots: ['11:00 AM - 03:00 PM', '05:00 PM - 07:30 PM'],
    },
  ],
  services: [
    {
      id: 'srv-1',
      name: 'Root Canal Treatment (RCT)',
      category: 'Endodontics',
      description: 'Single sitting or standard rotary endodontics',
      startingPrice: 4500,
      priceRange: '₹4,500 – ₹8,500 (plus crown)',
      durationMinutes: 60,
    },
    {
      id: 'srv-2',
      name: 'Dental Implant Consultation',
      category: 'Surgery',
      description: 'Titanium unit with digital 3D CBCT guided placement',
      startingPrice: 25000,
      priceRange: '₹25,000 – ₹45,000 per tooth',
      durationMinutes: 45,
    },
    {
      id: 'srv-3',
      name: 'Laser Teeth Whitening',
      category: 'Cosmetic',
      description: 'In-office 1 hour laser LED whitening',
      startingPrice: 8500,
      priceRange: '₹8,500 – ₹14,000',
      durationMinutes: 45,
    },
    {
      id: 'srv-4',
      name: 'Routine Scaling & Cleaning',
      category: 'Preventive',
      description: 'Ultrasonic scaling and polishing',
      startingPrice: 1200,
      priceRange: '₹1,200 – ₹2,000',
      durationMinutes: 30,
    },
  ],
  policies: {
    consultationFee: 600,
    cancellationPolicy: 'Please notify us at least 4 hours in advance to reschedule your slot.',
  },
  address: '#42, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru',
  city: 'Bengaluru',
  phone: '+91 98450 12345',
  emergencyContact: '+91 98450 99999',
  branches: [
    {
      id: 'branch-01',
      name: 'Indiranagar Main Clinic',
      address: '#42, 12th Main Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      phone: '+91 98450 12345',
      isMain: true,
    },
    {
      id: 'branch-02',
      name: 'Koramangala Center',
      address: '80 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      phone: '+91 98450 12346',
      isMain: false,
    },
  ],
};

export const AIPlaygroundPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Namaste! I am Maya, the 24/7 AI Receptionist for Smile Dental Clinic. We have branches in Indiranagar and Koramangala. How may I assist you with your dental care, appointments, or pricing today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastResult, setLastResult] = useState<ReceptionistResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await handleMessage({
        clinicId: 'clinic-demo-01',
        conversationId: 'playground-conv',
        userMessage: text,
        clinicContext: PLAYGROUND_CLINIC_CONTEXT,
        conversationHistory: [...messages, userMsg],
      });

      setLastResult(result);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I am momentarily experiencing high load. Please retry or contact front desk directly.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Namaste! I am Maya, the 24/7 AI Receptionist for Smile Dental Clinic. We have branches in Indiranagar and Koramangala. How may I assist you with your dental care, appointments, or pricing today?',
        timestamp: new Date().toISOString(),
      },
    ]);
    setLastResult(null);
  };

  const quickPrompts = [
    'How much does a Root Canal Treatment (RCT) cost?',
    'Where are your clinics located?',
    'I want to book an appointment with Dr. Rohan',
    'Book an appointment at Koramangala branch tomorrow at 11 AM',
    'Hi, my name is Rahul Sharma, phone 9845012345. Need RCT at Indiranagar',
    'Are you open this Sunday morning?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              AI Receptionist Live Playground
            </h1>
            <Badge variant="primary" size="sm" dot>GEMINI 1.5 FLASH + DENTAL TRIAGE</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test the live receptionist reasoning engine with Indian dental pricing, symptoms, and appointment requests
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-4 h-4" />}
          onClick={handleReset}
        >
          Reset Session
        </Button>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left: Chat Simulation (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Maya (AI Dental Receptionist)</h3>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Context-Aware Dental Engine Active
                </p>
              </div>
            </div>

            <Badge variant="gray" size="sm">SIMULATED PATIENT SESSION</Badge>
          </div>

          {/* Quick Test Prompt Pills */}
          <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Quick Test:
            </span>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                disabled={isTyping}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 text-[11px] font-medium transition-colors shadow-2xs"
              >
                {prompt.length > 32 ? prompt.slice(0, 32) + '...' : prompt}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[460px] bg-slate-50/20">
            {messages.map(m => {
              const isAi = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      isAi
                        ? 'bg-white border border-slate-200 text-slate-900'
                        : 'bg-blue-600 text-white font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        isAi ? 'text-slate-400' : 'text-blue-200'
                      }`}
                    >
                      {new Date(m.timestamp || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {!isAi && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <Bot className="w-4 h-4 animate-bounce text-blue-600" />
                <span>Maya is analyzing clinical inquiry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask pricing, symptom questions, or request an appointment..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!input.trim() || isTyping}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Right: AI Telemetry & Reasoning Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Live AI Telemetry Inspector
                  </h3>
                </div>
                {lastResult?.intent && (
                  <Badge variant="primary" size="sm">
                    {lastResult.intent.toUpperCase()}
                  </Badge>
                )}
              </div>

              {lastResult ? (
                <div className="space-y-3 text-xs">
                  {lastResult.shouldEscalate && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Emergency Medical Escalation Triggered</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Reason: {lastResult.escalationReason || 'Severe symptoms detected'}
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                    <p className="text-slate-500 font-semibold uppercase text-[10px]">
                      Extracted Patient Entities:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Patient Name:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          {lastResult.leadData?.name || 'Not detected'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          {lastResult.leadData?.phone || 'Not detected'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Branch:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          {lastResult.leadData?.preferredBranch || 'Not selected'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Treatment:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          {lastResult.leadData?.serviceRequested || lastResult.leadData?.concern || 'General'}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-400">Extraction Confidence:</span>{' '}
                        <span className="font-semibold text-emerald-600">
                          {Math.round((lastResult.confidenceScore || 0.95) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {lastResult.actions && lastResult.actions.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                      <p className="text-slate-500 font-semibold uppercase text-[10px]">
                        Structured Backend Actions:
                      </p>
                      {lastResult.actions.map((act, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-mono text-blue-700 bg-blue-50/70 p-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                          <span>{act.type.toUpperCase()}: {JSON.stringify(act.payload)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {lastResult.suggestedQuickReplies && lastResult.suggestedQuickReplies.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-slate-500 font-semibold uppercase text-[10px]">
                        Suggested WhatsApp Fast Replies:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {lastResult.suggestedQuickReplies.map((r, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">
                  <Bot className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>Send a message in the chat to view real-time AI triage and structured JSON extraction telemetry.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Context Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">Simulated Clinic Parameters:</h4>
            <p className="text-slate-600 text-[11px]">
              • <strong>Clinic:</strong> Smile Dental Clinic (2 Bengaluru Branches)
            </p>
            <p className="text-slate-600 text-[11px]">
              • <strong>Branch 1:</strong> Indiranagar Main Clinic (#42, 12th Main Road)
            </p>
            <p className="text-slate-600 text-[11px]">
              • <strong>Branch 2:</strong> Koramangala Center (80 Feet Road, 4th Block)
            </p>
            <p className="text-slate-600 text-[11px]">
              • <strong>Doctors:</strong> Dr. Rohan Sharma (Endodontist) & Dr. Pooja Iyer (Aligners)
            </p>
            <p className="text-slate-600 text-[11px]">
              • <strong>Emergency Escalation:</strong> Automated 24/7 Red-Flag Screening
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
