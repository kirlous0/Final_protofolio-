import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Lightbulb,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../../lib/api';

interface AdminAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AdminAiAssistantModal: React.FC<AdminAiAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello Kirlous! I am your AI Portfolio Engineering Assistant. I have live context on your projects, skills, and contact inquiries. How can I help you refine case studies, draft architectural highlights, or optimize your portfolio presentation?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'Draft an Android Compose case study outline with Room DB',
    'Suggest high-impact engineering highlights for a real-time platform',
    'Critique my portfolio balance between Android & Web',
    'Generate an executive summary for a Full-Stack senior role',
  ];

  const handleSend = async (textToSend?: string) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim()) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: messageContent },
    ];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newMessages.slice(1, -1);
      const res = await api.aiChat(messageContent, historyPayload);

      setMessages([
        ...newMessages,
        { role: 'assistant', content: res.reply },
      ]);
    } catch (e: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the AI model. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[#242e42] bg-[#0c1017] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a2130] bg-[#10141e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Portfolio AI Assistant
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Gemini Model • Live Portfolio State Context
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#182030] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`relative group max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : 'border border-[#1f2738] bg-[#101522] text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded bg-[#161e2e] p-1 text-slate-400 hover:text-white transition-opacity"
                    title="Copy text"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#263348] bg-[#141b27] text-slate-300 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <span className="font-mono text-[11px]">Thinking & generating response...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="border-t border-[#182030] bg-[#0a0d14] px-6 py-2.5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400/90 mb-1.5">
              <Lightbulb className="h-3 w-3" />
              <span>Suggested prompts:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSend(prompt)}
                  className="rounded border border-[#1e2637] bg-[#111622] px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-500/40 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-[#1a2130] bg-[#10141e] p-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about your projects, architecture, or content..."
              className="flex-1 rounded-lg border border-[#222a3a] bg-[#0c1017] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
