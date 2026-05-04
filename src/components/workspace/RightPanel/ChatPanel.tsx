'use client';
import { useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { ChatBubble } from '../ui/ChatBubble';

interface ChatPanelProps {
  messages: any[];
  chatInput: string;
  setChatInput: (v: string) => void;
  sendMessage: () => void;
  chatLoading: boolean;
}

export function ChatPanel({ messages, chatInput, setChatInput, sendMessage, chatLoading }: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
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