'use client';
<<<<<<< HEAD
import { useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { ChatBubble } from '../ui/ChatBubble';

=======
import { useRef, useEffect, useState } from 'react';
import { Send, Bot, X } from 'lucide-react';
import { ChatBubble } from '../ui/ChatBubble';

type HitlStatus = 'idle' | 'pending_review' | 'error';

>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
interface ChatPanelProps {
  messages: any[];
  chatInput: string;
  setChatInput: (v: string) => void;
  sendMessage: () => void;
  chatLoading: boolean;
<<<<<<< HEAD
}

export function ChatPanel({ messages, chatInput, setChatInput, sendMessage, chatLoading }: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);
=======
  // --- HITL props ---
  hitlStatus: HitlStatus;
  hitlAgentOutput: string | null;
  hitlIntents: string[];
  onHitlApprove: () => void;
  onHitlEdit: (editedText: string) => void;
  onHitlRegenerate: (feedback: string) => void;
}

export function ChatPanel({
  messages,
  chatInput,
  setChatInput,
  sendMessage,
  chatLoading,
  hitlStatus,
  hitlAgentOutput,
  hitlIntents,
  onHitlApprove,
  onHitlEdit,
  onHitlRegenerate,
}: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const autoApprovedRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading, hitlStatus]);

  // Auto-approve when HITL output arrives
  useEffect(() => {
    if (hitlStatus === 'pending_review' && hitlAgentOutput && !autoApprovedRef.current) {
      autoApprovedRef.current = true;
      // Auto-approve after a short delay so the user can see the output
      setTimeout(() => {
        onHitlApprove();
        autoApprovedRef.current = false;
      }, 500);
    }
  }, [hitlStatus, hitlAgentOutput, onHitlApprove]);

  // Reset auto-approve flag when status changes
  useEffect(() => {
    if (hitlStatus === 'idle') {
      autoApprovedRef.current = false;
    }
  }, [hitlStatus]);
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
<<<<<<< HEAD
=======

        {/* Show auto-approving indicator */}
        {hitlStatus === 'pending_review' && hitlAgentOutput && (
          <div className="mb-4 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 p-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-500 animate-pulse" />
              <span className="text-xs text-brand-600 dark:text-brand-400">
                Processing & auto-saving...
              </span>
            </div>
          </div>
        )}

        {/* HITL Error State */}
        {hitlStatus === 'error' && (
          <div className="mb-4 rounded-xl border-2 border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                AI Workflow Error
              </span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Something went wrong. Please try again or contact support.
            </p>
          </div>
        )}

>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
        {chatLoading && (
          <div className="flex gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="px-3 pb-3 pt-2 border-t border-surface-border dark:border-dark-border">
        <div className="flex items-end gap-2 bg-surface-secondary dark:bg-dark-card rounded-xl border border-surface-border dark:border-dark-border px-3 py-2 focus-within:border-brand-400 dark:focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 dark:focus-within:ring-brand-900/40 transition-all">
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message..."
            rows={2}
            className="flex-1 bg-transparent text-xs text-text-primary dark:text-white placeholder-text-tertiary resize-none focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!chatInput.trim() || chatLoading}
            className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}