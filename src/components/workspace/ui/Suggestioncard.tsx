'use client';
import { Wand2, X, Check } from 'lucide-react';

interface SuggestionCardProps {
  suggestion: {
    id: string;
    instruction?: string;
    original_text?: string;
    suggested_text: string;
    status: 'pending' | 'accepted' | 'rejected';
  };
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function SuggestionCard({ suggestion, onAccept, onReject }: SuggestionCardProps) {

  const statusStyle =
    suggestion.status === 'accepted'
      ? 'border-green-400 bg-green-100/30 dark:border-green-600 dark:bg-green-900/20'
      : suggestion.status === 'rejected'
      ? 'border-red-400 bg-red-100/40 dark:border-red-600 dark:bg-red-900/30'
      : 'border-surface-border bg-white dark:border-dark-border dark:bg-dark-card';

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors ${statusStyle}`}
    >

      {suggestion.original_text && (
        <div className="px-3 pt-3">
          <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-wide mb-1">
            Original
          </p>

          <div className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed bg-surface-secondary dark:bg-dark-bg rounded-lg p-2">
            {suggestion.original_text}
          </div>
        </div>
      )}

      <div className="p-3">
        <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-wide mb-1">
          Suggestion
        </p>

        <div className="text-xs text-text-primary dark:text-white leading-relaxed bg-brand-50 dark:bg-brand-900/20 rounded-lg p-2 border border-brand-200 dark:border-brand-800">
          {suggestion.suggested_text}
        </div>
      </div>

      {suggestion.status === 'pending' && (
        <div className="flex border-t border-surface-border dark:border-dark-border">
          <button
            onClick={() => onReject(suggestion.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>

          <div className="w-px bg-surface-border dark:bg-dark-border" />

          <button
            onClick={() => onAccept(suggestion.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Accept
          </button>
        </div>
      )}
    </div>
  );
}