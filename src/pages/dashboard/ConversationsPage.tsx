import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  AlertTriangle,
  Bot,
  Send,
  User,
  Clock,
  Sparkles,
  Phone,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useMockData } from '@/hooks/useMockData';
import type { Message } from '@/types/database';

export const ConversationsPage: React.FC = () => {
  const { conversations } = useMockData();
  const [selectedConvId, setSelectedConvId] = useState(conversations[0]?.id || '');
  const [replyText, setReplyText] = useState('');

  const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Add message to local conversation
    selectedConv.messages.push({
      id: `msg-${Date.now()}`,
      conversation_id: selectedConv.id,
      role: 'assistant',
      content: replyText,
      metadata: { human_override: true },
      created_at: new Date().toISOString(),
    });
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              AI Conversations & Transcripts
            </h1>
            <Badge variant="primary" size="sm">LIVE WHATSAPP STREAM</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chat interactions handled by the autonomous receptionist
          </p>
        </div>
      </div>

      {/* Two-pane chat UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Pane: Conversation Threads */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              All Conversations ({conversations.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {conversations.map(conv => {
              const isSelected = conv.id === selectedConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <Avatar name={conv.lead_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {conv.lead_name}
                      </p>
                      {conv.is_escalated && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> Escalated
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lead_phone}</p>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-1 italic">
                      "{conv.last_message}"
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Message Viewer & Live Responses */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-3">
              <Avatar name={selectedConv.lead_name} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{selectedConv.lead_name}</h3>
                  <Badge variant="primary" size="sm">
                    {selectedConv.channel.toUpperCase()}
                  </Badge>
                  {selectedConv.is_escalated && (
                    <Badge variant="danger" size="sm" dot>
                      TRIAGE ESCALATION
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedConv.lead_phone}</p>
              </div>
            </div>

            <a
              href={`https://wa.me/${(selectedConv.lead_phone || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="sm" className="text-xs" leftIcon={<Phone className="w-3.5 h-3.5" />}>
                Open WhatsApp
              </Button>
            </a>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
            {selectedConv.messages.map((msg: Message) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      isAssistant
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-blue-600 text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] mb-1 font-semibold opacity-70">
                      <span>{isAssistant ? 'AI Receptionist Maya' : selectedConv.lead_name}</span>
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.metadata && Object.keys(msg.metadata).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        {Boolean(msg.metadata.triage_check) && (
                          <span className="text-emerald-600 font-semibold">✓ Triage Safety Screened</span>
                        )}
                        {Boolean(msg.metadata.slot_reserved) && (
                          <span className="text-blue-600 font-semibold"> • Slot Reserved</span>
                        )}
                        {Boolean(msg.metadata.human_override) && (
                          <span className="text-purple-600 font-semibold"> • Staff Manual Reply</span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Staff Takeover / Reply */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                placeholder="Take over or reply as clinic staff (sends to WhatsApp)..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button type="submit" variant="primary" size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
