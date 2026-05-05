'use client';

import { ExternalLink, FileText, Star } from 'lucide-react';
import type { Source } from '@/types';

interface SourcesTableProps {
  sources: Source[];
}

function RelevanceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 90 ? 'from-green-400 to-emerald-500'
    : pct >= 75 ? 'from-brand-400 to-brand-500'
    : 'from-amber-400 to-orange-400';

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-surface-tertiary dark:bg-dark-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-text-secondary dark:text-text-secondary w-8">{pct}%</span>
    </div>
  );
}

function CitationCount({ count }: { count: number }) {
  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary dark:text-text-secondary">
      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
      {formatted}
    </span>
  );
}

export function SourcesTable({ sources }: SourcesTableProps) {
  if (sources.length === 0) {
    return (
      <div className="text-center py-12 text-text-tertiary dark:text-text-tertiary text-sm">
        No sources added yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <div
          key={source.id}
          className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border p-4 hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-150 group"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-brand-500 dark:text-brand-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h4 className="text-sm font-semibold text-text-primary dark:text-white leading-snug group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                  {source.title}
                </h4>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary hover:text-brand-500 transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-text-secondary dark:text-text-secondary mb-2 italic">
                {source.authors}
              </p>

              <p className="text-xs text-text-tertiary dark:text-text-tertiary leading-relaxed line-clamp-2 mb-3">
                {source.abstract}
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-tertiary dark:text-text-tertiary">Relevance</span>
                  <RelevanceBar score={source.relevance_score} />
                </div>
                <CitationCount count={source.citation_count} />
                {source.doi && (
                  <span className="text-xs text-text-tertiary dark:text-text-tertiary font-mono">
                    DOI: {source.doi}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
