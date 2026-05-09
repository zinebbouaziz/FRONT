'use client';

import { Check, X, Clock, Wand2 } from 'lucide-react';
import type { AiSuggestion } from '@/types';

interface AiSuggestionsListProps {
  suggestions: AiSuggestion[];
}

const statusConfig = {
  accepted: {
    label: 'Accepted',
    className: 'bg-status-accepted-bg text-status-accepted dark:bg-green-900/30 dark:text-green-400',
    icon: Check,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-status-rejected-bg text-status-rejected dark:bg-red-900/30 dark:text-red-400',
    icon: X,
  },
  pending: {
    label: 'Pending',
    className: 'bg-status-pending-bg text-status-pending dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock,
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function AiSuggestionsList({ suggestions }: AiSuggestionsListProps) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12 text-text-tertiary dark:text-text-tertiary text-sm">
        No AI suggestions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-4 h-4 text-brand-500 dark:text-brand-400" />
        <span className="text-sm font-semibold text-text-primary dark:text-white">
          {suggestions.length} AI Suggestion{suggestions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {suggestions.map((suggestion) => {
        const sConfig = statusConfig[suggestion.status as keyof typeof statusConfig] ?? statusConfig.pending;
        const StatusIcon = sConfig.icon;

        return (
          <div
            key={suggestion.id}
            className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                  <Wand2 className="w-3 h-3 text-brand-500 dark:text-brand-400" />
                </div>
                <p className="text-xs font-medium text-text-secondary dark:text-text-secondary italic line-clamp-1">
                  &ldquo;{suggestion.instruction}&rdquo;
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${sConfig.className}`}>
                <StatusIcon className="w-2.5 h-2.5" />
                {sConfig.label}
              </span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {suggestion.original_text && (
                <div>
                  <p className="text-[10px] font-semibold text-text-tertiary dark:text-text-tertiary uppercase tracking-wide mb-1.5">Original</p>
                  <div className="text-xs text-text-secondary dark:text-text-secondary bg-surface-secondary dark:bg-dark-card rounded-lg p-3 border border-surface-border dark:border-dark-border leading-relaxed line-clamp-3">
                    {suggestion.original_text}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold text-text-tertiary dark:text-text-tertiary uppercase tracking-wide mb-1.5">AI Suggestion</p>
                <div className="text-xs text-text-primary dark:text-white bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3 border border-brand-100 dark:border-brand-800 leading-relaxed line-clamp-4">
                  {suggestion.suggested_text}
                </div>
              </div>

              {suggestion.feedback && (
                <div className="text-[11px] text-text-secondary dark:text-text-secondary italic bg-surface-secondary dark:bg-dark-card rounded-lg px-3 py-2">
                  Feedback: &ldquo;{suggestion.feedback}&rdquo;
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-3 flex items-center justify-between">
              <span className="text-[10px] text-text-tertiary dark:text-text-tertiary">
                {formatDate(suggestion.created_at)}
              </span>
              {suggestion.resolved_at && (
                <span className="text-[10px] text-text-tertiary dark:text-text-tertiary">
                  Resolved {formatDate(suggestion.resolved_at)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
