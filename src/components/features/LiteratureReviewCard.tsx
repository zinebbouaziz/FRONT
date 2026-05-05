'use client';

import { AlertTriangle, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import type { LiteratureAnalysis } from '@/types';

interface LiteratureReviewCardProps {
  analysis: LiteratureAnalysis;
}

function renderMarkdown(text: string) {
  // Simple markdown-like rendering
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('# ')) {
        return <h2 key={i} className="text-base font-bold text-text-primary dark:text-white mt-4 mb-2 first:mt-0">{line.slice(2)}</h2>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-sm font-semibold text-text-primary dark:text-white mt-3 mb-1.5">{line.slice(3)}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-sm font-medium text-brand-500 dark:text-brand-400 mt-2 mb-1">{line.slice(4)}</h4>;
      }
      if (/^\d+\./.test(line)) {
        return (
          <div key={i} className="flex gap-2 mb-1">
            <span className="text-brand-500 dark:text-brand-400 text-xs font-semibold flex-shrink-0 mt-0.5">{line.match(/^\d+/)?.[0]}.</span>
            <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</p>
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-1" />;
      return <p key={i} className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed mb-1">{line}</p>;
    });
}

const statusConfig: Record<string, { label: string; className: string }> = {
  reviewed: { label: 'Reviewed', className: 'bg-status-active-bg text-status-active dark:bg-green-900/30 dark:text-green-400' },
  completed: { label: 'Completed', className: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  pending: { label: 'Pending', className: 'bg-status-pending-bg text-status-pending dark:bg-amber-900/30 dark:text-amber-400' },
};

export function LiteratureReviewCard({ analysis }: LiteratureReviewCardProps) {
  const statusInfo = statusConfig[analysis.status] ?? statusConfig.pending;

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500 dark:text-brand-400" />
          <span className="text-sm font-semibold text-text-primary dark:text-white">Literature Review</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
          <CheckCircle className="w-3 h-3" />
          {statusInfo.label}
        </span>
      </div>

      {/* Review Content */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border p-5">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-surface-border dark:border-dark-border">
          <div className="w-6 h-6 rounded-md bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
          </div>
          <span className="text-xs font-semibold text-text-primary dark:text-white uppercase tracking-wide">State of the Art Review</span>
        </div>
        <div className="space-y-0.5">
          {renderMarkdown(analysis.review_content)}
        </div>
      </div>

      {/* Research Gaps */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border p-5">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-surface-border dark:border-dark-border">
          <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-text-primary dark:text-white uppercase tracking-wide">Research Gaps</span>
        </div>
        <div className="space-y-0.5">
          {renderMarkdown(analysis.gaps_content)}
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Verification Warnings</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">{analysis.warnings}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
