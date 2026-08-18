import React, { useState } from 'react';
import {
  Mail,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Send,
  Sparkles,
  Archive,
  Search,
  Clock,
  User,
  Loader2,
} from 'lucide-react';
import { Message } from '../../types';
import { api } from '../../lib/api';

interface AdminMessagesInboxProps {
  messages: Message[];
  onRefresh: () => void;
}

export const AdminMessagesInbox: React.FC<AdminMessagesInboxProps> = ({
  messages,
  onRefresh,
}) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(
    messages.length > 0 ? messages[0] : null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [draftReply, setDraftReply] = useState<string>('');
  const [generatingReply, setGeneratingReply] = useState(false);

  const filteredMessages = messages.filter(m => {
    if (filterStatus === 'all') return true;
    return m.status === filterStatus;
  });

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    setDraftReply('');
    if (msg.status === 'unread') {
      try {
        await api.updateMessageStatus(msg.id, 'read');
        onRefresh();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: Message['status']) => {
    try {
      await api.updateMessageStatus(id, status);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
      onRefresh();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.deleteMessage(id);
      setSelectedMessage(null);
      onRefresh();
    } catch (e) {
      alert('Failed to delete message');
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAiReply = async () => {
    if (!selectedMessage) return;
    setGeneratingReply(true);
    try {
      const response = await api.aiChat(
        `Draft a concise, professional, and friendly email reply from Kirlous Wael (Full-Stack & Android Developer) to ${selectedMessage.name} regarding their inquiry about "${selectedMessage.subject}" and message: "${selectedMessage.message}". Mention that Kirlous is interested in discussing technical requirements and suggest scheduling a brief technical sync call.`,
        []
      );
      setDraftReply(response.reply);
    } catch (e) {
      alert('Failed to generate AI reply draft');
    } finally {
      setGeneratingReply(false);
    }
  };

  return (
    <div id="admin-messages-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact & Inquiries Inbox</h2>
          <p className="text-xs text-slate-400">
            Manage incoming engineering inquiries and senior role opportunities ({messages.length} total)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['all', 'unread', 'read', 'replied', 'archived'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'border border-[#202738] bg-[#10141e] text-slate-300 hover:bg-[#161c2b]'
              }`}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Messages List Column */}
        <div className="lg:col-span-5 rounded-2xl border border-[#202738] bg-[#0c1017] p-3 overflow-hidden">
          <div className="divide-y divide-[#182030] max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No messages found in this category.
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`cursor-pointer rounded-xl p-3.5 transition-all ${
                    selectedMessage?.id === msg.id
                      ? 'bg-[#151c2a] border border-amber-500/30'
                      : 'hover:bg-[#10141e]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{msg.name}</span>
                      {msg.status === 'unread' && (
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-slate-300 text-xs truncate">{msg.subject}</p>
                  <p className="mt-1 text-slate-500 text-[11px] line-clamp-1">{msg.message}</p>

                  <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-amber-400/90">{msg.projectType}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 ${
                        msg.status === 'unread'
                          ? 'bg-amber-500/20 text-amber-300'
                          : msg.status === 'replied'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {msg.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail Column */}
        <div className="lg:col-span-7 rounded-2xl border border-[#202738] bg-[#0c1017] p-6">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Message Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#182030] pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedMessage.name}</h3>
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                      {selectedMessage.projectType}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>{selectedMessage.email}</span>
                    <button
                      onClick={() => handleCopyEmail(selectedMessage.email)}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? 'Copied' : 'Copy Email'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                    className="rounded-lg border border-[#222c3d] bg-[#121723] px-2.5 py-1 text-xs text-emerald-400 hover:bg-[#182030]"
                  >
                    Mark Replied
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                    className="rounded-lg border border-[#222c3d] bg-[#121723] px-2.5 py-1 text-xs text-slate-400 hover:bg-[#182030]"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-1.5 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Subject & Date */}
              <div className="space-y-1">
                <span className="font-mono text-xs text-slate-500">Subject</span>
                <h4 className="text-base font-semibold text-white">{selectedMessage.subject}</h4>
                <p className="font-mono text-[11px] text-slate-500">
                  Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Body */}
              <div className="rounded-xl border border-[#1b2230] bg-[#10141e] p-4 text-xs leading-relaxed text-slate-200">
                {selectedMessage.message}
              </div>

              {/* AI Reply Generator */}
              <div className="rounded-xl border border-amber-500/20 bg-[#0f1422] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>AI Reply Assistant</span>
                  </div>
                  <button
                    onClick={handleGenerateAiReply}
                    disabled={generatingReply}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                  >
                    {generatingReply ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Drafting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Generate Response Draft</span>
                      </>
                    )}
                  </button>
                </div>

                {draftReply && (
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={draftReply}
                      onChange={e => setDraftReply(e.target.value)}
                      className="w-full rounded-lg border border-[#232f42] bg-[#0c1017] p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(draftReply);
                          alert('Reply draft copied to clipboard!');
                        }}
                        className="flex items-center gap-1 rounded bg-[#161e2e] border border-[#27354a] px-3 py-1.5 text-xs text-slate-200 hover:text-white"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Draft to Send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-slate-500">
              Select a message from the list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
