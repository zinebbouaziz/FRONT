'use client';

import { Bot, User as UserIcon, FileText } from 'lucide-react';
import { chatMessages, sections } from '@/lib/mockData';

interface ChatBubbleProps {
  msg: typeof chatMessages[0];
}

export function ChatBubble({ msg }: ChatBubbleProps) {
  const isAI = msg.role === 'ai';

  return (
    <div className={`flex gap-2.5 mb-4 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isAI ? 'bg-gradient-to-br from-brand-400 to-accent-purple' : 'bg-surface-tertiary dark:bg-dark-border'
        }`}
      >
        {isAI ? (
          <Bot className="w-3 h-3 text-white" />
        ) : (
          <UserIcon className="w-3 h-3 text-text-secondary dark:text-text-secondary" />
        )}
      </div>
      <div
        className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed ${
          isAI
            ? 'bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border text-text-primary dark:text-white rounded-tl-sm'
            : 'bg-brand-500 text-white rounded-tr-sm'
        }`}
      >
        {msg.content}
        {msg.section_id && (
          <div
            className={`mt-1.5 text-[10px] flex items-center gap-1 ${
              isAI ? 'text-text-tertiary dark:text-text-tertiary' : 'text-brand-200'
            }`}
          >
            <FileText className="w-2.5 h-2.5" />
            {sections.find((s) => s.id === msg.section_id)?.title}
          </div>
        )}
      </div>
    </div>
  );
}