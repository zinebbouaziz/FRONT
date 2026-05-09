'use client';

import { Quote, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { LiteratureCitation } from '@/types';

interface CitationsListProps {
  citations: LiteratureCitation[];
}

function CitationItem({ citation }: { citation: LiteratureCitation }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(citation.formatted_citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-start gap-3 p-4 bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-150">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
        <span className="text-[11px] font-bold text-brand-500 dark:text-brand-400">{citation.position}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-text-primary dark:text-white leading-relaxed break-words">
          {citation.formatted_citation}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-secondary dark:bg-dark-card text-text-tertiary dark:text-text-tertiary font-medium">
            {citation.citation_style}
          </span>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary hover:text-brand-500 transition-all"
        title="Copy citation"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export function CitationsList({ citations }: CitationsListProps) {
  if (citations.length === 0) {
    return (
      <div className="text-center py-12 text-text-tertiary dark:text-text-tertiary text-sm">
        No citations generated yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Quote className="w-4 h-4 text-brand-500 dark:text-brand-400" />
        <span className="text-sm font-semibold text-text-primary dark:text-white">
          {citations.length} Citation{citations.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-text-tertiary dark:text-text-tertiary">· IEEE format</span>
      </div>
      {citations.map((citation) => (
        <CitationItem key={citation.id} citation={citation} />
      ))}
    </div>
  );
}
