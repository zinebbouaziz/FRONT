'use client';

import { useState } from 'react';
import { Edit3, Clock, PlusCircle, Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Version {
  id: string;
  version_number: number;
  author_type: 'ai' | 'human';
  is_current: boolean;
  content: string;
  created_at: string;
}

interface VersionsPanelProps {
  sectionId?: string | null;
  versions?: Version[];
  versionsLoading?: boolean;
  onRestoreVersion?: (versionId: string) => void | Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE = 4;

function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getIcon(authorType: 'ai' | 'human') {
  if (authorType === 'human') return Edit3;
  return Clock;
}

function getAction(authorType: 'ai' | 'human', versionNumber: number) {
  if (authorType === 'human') return 'Edited by you';
  return `AI draft v${versionNumber}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VersionsPanel({
  sectionId,
  versions = [],
  versionsLoading = false,
  onRestoreVersion,
}: VersionsPanelProps) {
  const [visible, setVisible]         = useState(PAGE);
  const [restoring, setRestoring]     = useState<string | null>(null); // id being restored
  const [error, setError]             = useState<string | null>(null);

  // ── Restore ────────────────────────────────────────────────────────────────
  const handleRestore = async (version: Version) => {
    if (!sectionId || version.is_current) return;
    setRestoring(version.id);
    setError(null);
    try {
      if (onRestoreVersion) {
        await onRestoreVersion(version.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRestoring(null);
    }
  };

  const handleLoadMore = () => setVisible((v) => v + PAGE);

  const displayedVersions = versions.slice(0, visible);
  const hasMore = visible < versions.length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="px-3 py-4 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary dark:text-white">
            History
          </h3>
          <p className="text-[10px] text-text-tertiary">
            Track changes across your document
          </p>
        </div>

        <span className="text-[10px] text-text-tertiary">
          {versions.length} versions
        </span>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-[10px] text-red-500 px-1">{error}</p>
      )}

      {/* LOADING */}
      {versionsLoading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
        </div>
      )}

      {/* EMPTY — no section selected */}
      {!versionsLoading && !sectionId && (
        <p className="text-[10px] text-text-tertiary pl-6 py-4">
          Select a section to see its history.
        </p>
      )}

      {/* TIMELINE */}
      {!versionsLoading && sectionId && (
        <div className="relative pl-6 space-y-5">

          {/* vertical line */}
          <div className="absolute left-2 top-1 bottom-0 w-px bg-gradient-to-b from-brand-300/60 via-surface-border to-transparent dark:via-dark-border" />

          {displayedVersions.length === 0 ? (
            <div className="text-[10px] text-text-tertiary ml-1 py-6">
              No history available
            </div>
          ) : (
            displayedVersions.map((v) => {
              const Icon      = getIcon(v.author_type);
              const isRestoring = restoring === v.id;

              return (
                <div key={v.id} className="relative group">

                  {/* DOT */}
                  <div className="absolute -left-[7px] top-2 w-3.5 h-3.5 rounded-full bg-white dark:bg-dark-surface border-2 border-brand-500 flex items-center justify-center">
                    <Icon className="w-2 h-2 text-brand-500" />
                  </div>

                  {/* TIME */}
                  <div className="text-[10px] text-text-tertiary mb-1 ml-1">
                    {formatDate(v.created_at)} · {formatTime(v.created_at)}
                  </div>

                  {/* CARD */}
                  <div className="ml-1 p-3 rounded-xl border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-200">

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-text-primary dark:text-white flex items-center gap-1">
                        <Icon className="w-3 h-3 text-brand-500" />
                        {getAction(v.author_type, v.version_number)}
                      </span>

                      {v.is_current && (
                        <span className="text-[9px] bg-brand-500 text-white px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] leading-relaxed text-text-secondary line-clamp-2">
                      {v.content}
                    </p>

                    {/* hover actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-3 mt-2">
                      <button
                        onClick={() => {
                          // Open a read-only preview in a native dialog
                          const w = window.open('', '_blank', 'width=700,height=500');
                          w?.document.write(`<pre style="font-family:sans-serif;padding:1rem;white-space:pre-wrap">${v.content}</pre>`);
                        }}
                        className="text-[10px] text-brand-500 hover:text-brand-600"
                      >
                        View
                      </button>

                      {!v.is_current && (
                        <button
                          onClick={() => handleRestore(v)}
                          disabled={!!restoring}
                          className="text-[10px] text-text-tertiary hover:text-text-primary disabled:opacity-50 flex items-center gap-1"
                        >
                          {isRestoring && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="pt-2 border-t border-surface-border dark:border-dark-border">
        <button
          onClick={handleLoadMore}
          disabled={!hasMore || versionsLoading}
          className="w-full flex items-center justify-center gap-2 text-[10px] text-text-secondary hover:text-brand-500 transition disabled:opacity-40"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {hasMore ? 'Load more history' : 'No more history'}
        </button>
      </div>

    </div>
  );
}