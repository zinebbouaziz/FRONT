'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Edit3, Clock, PlusCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// ─── API helper ───────────────────────────────────────────────────────────────

async function apiFetch(endpoint: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No auth session');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${err}`);
  }

  const ct = res.headers.get('content-type');
  if (!ct?.includes('application/json')) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

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
  /** The currently active section — versions are per-section. */
  sectionId?: string | null;
  /** Called after a restore so the editor can reload the new current content. */
  onRestore?: (content: string) => void;
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

export function VersionsPanel({ sectionId, onRestore }: VersionsPanelProps) {
  const [allVersions, setAllVersions] = useState<Version[]>([]);
  const [visible, setVisible]         = useState(PAGE);
  const [loading, setLoading]         = useState(false);
  const [restoring, setRestoring]     = useState<string | null>(null); // id being restored
  const [error, setError]             = useState<string | null>(null);

  // ── Fetch on sectionId change ──────────────────────────────────────────────
  const fetchVersions = useCallback(async () => {
    if (!sectionId) { setAllVersions([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data: Version[] = await apiFetch(`/sections/${sectionId}/versions`);
      // Backend returns newest-first per spec; sort defensively
      const sorted = (data ?? []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllVersions(sorted);
      setVisible(PAGE); // reset pagination on section change
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => { fetchVersions(); }, [fetchVersions]);

  // ── Restore ────────────────────────────────────────────────────────────────
  const handleRestore = async (version: Version) => {
    if (!sectionId || version.is_current) return;
    setRestoring(version.id);
    setError(null);
    try {
      await apiFetch(`/sections/${sectionId}/versions/restore`, {
        method: 'POST',
        body: JSON.stringify({ version_id: version.id }),
      });
      // Refresh list so is_current badge moves to the restored version
      await fetchVersions();
      // Notify parent editor to reload content
      onRestore?.(version.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRestoring(null);
    }
  };

  const handleClear    = () => setAllVersions([]);
  const handleLoadMore = () => setVisible((v) => v + PAGE);

  const displayedVersions = allVersions.slice(0, visible);
  const hasMore = visible < allVersions.length;

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

        <button
          onClick={handleClear}
          className="text-[10px] px-2 py-1 rounded-md border border-surface-border dark:border-dark-border hover:border-brand-300 hover:text-brand-500 transition"
        >
          Clear
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-[10px] text-red-500 px-1">{error}</p>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
        </div>
      )}

      {/* EMPTY — no section selected */}
      {!loading && !sectionId && (
        <p className="text-[10px] text-text-tertiary pl-6 py-4">
          Select a section to see its history.
        </p>
      )}

      {/* TIMELINE */}
      {!loading && sectionId && (
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
          disabled={!hasMore || loading}
          className="w-full flex items-center justify-center gap-2 text-[10px] text-text-secondary hover:text-brand-500 transition disabled:opacity-40"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {hasMore ? 'Load more history' : 'No more history'}
        </button>
      </div>

    </div>
  );
}