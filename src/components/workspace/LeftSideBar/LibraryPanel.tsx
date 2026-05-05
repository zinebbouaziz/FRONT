'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Source {
  id: string;
  title: string;
  authors: string;
  created_at: string;
  project_id?: string;
  relevance_score?: number;
  /** Distinguishes a PDF upload from a search-sourced paper. */
  source_type?: 'upload' | 'search';
}

interface LibraryPanelProps {
  projectId?: string;
  onSearchOpen: () => void;
  onInsertCitation: (paper: any) => void;
  onFileUpload: () => void;
  /** Increment this value from the parent to force a sources re-fetch (e.g. after PDF upload). */
  refreshKey?: number;
}

async function apiFetch(endpoint: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No auth session');

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
  
  // Handle 204 No Content and empty responses
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null;
  }
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function LibraryPanel({
  projectId,
  onSearchOpen,
  onInsertCitation,
  onFileUpload,
  refreshKey = 0,
}: LibraryPanelProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch search-sourced papers and uploaded PDFs in parallel
      const [sourcesData, uploadsData] = await Promise.all([
        apiFetch(`/projects/${projectId}/sources`).catch(() => [] as any[]),
        apiFetch(`/projects/${projectId}/upload/pdf`).catch(() => [] as any[]),
      ]);

      // Normalise sources (search results)
      const sources: Source[] = (sourcesData ?? []).map((s: any) => ({
        id: s.id,
        title: s.title || 'Untitled',
        authors: Array.isArray(s.authors) ? s.authors.join(', ') : (s.authors || 'Unknown'),
        created_at: s.created_at || new Date().toISOString(),
        project_id: s.project_id,
        relevance_score: s.relevance_score,
        source_type: 'search' as const,
      }));

      // Normalise uploaded PDFs — backend returns filename/path shape
      const uploads: Source[] = (uploadsData ?? []).map((f: any) => ({
        id: f.id || f.filename || f.path,
        title: f.filename || f.path || 'Uploaded PDF',
        authors: 'Uploaded PDF',
        created_at: f.created_at || f.uploaded_at || new Date().toISOString(),
        project_id: f.project_id ?? projectId,
        source_type: 'upload' as const,
      }));

      // Merge, de-duplicate by id (sources take precedence if same id)
      const sourceIds = new Set(sources.map((s) => s.id));
      const uniqueUploads = uploads.filter((u) => !sourceIds.has(u.id));
      const merged = [...sources, ...uniqueUploads];

      const sorted = merged.sort((a, b) => {
        if (b.relevance_score !== undefined && a.relevance_score !== undefined) {
          return b.relevance_score - a.relevance_score;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setSources(sorted);
    } catch (err: any) {
      setError(err.message);
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources, refreshKey]);

  return (
    <div className="border-t border-surface-border dark:border-dark-border flex-shrink-0">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
          Reference library
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={onSearchOpen}
            className="p-1 rounded hover:bg-surface-tertiary dark:hover:bg-dark-border text-text-tertiary hover:text-text-primary transition-colors"
            title="Advanced search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFileUpload}
            className="p-1 rounded hover:bg-surface-tertiary dark:hover:bg-dark-border text-text-tertiary hover:text-text-primary transition-colors"
            title="Add reference"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-3 max-h-36 overflow-y-auto space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
          </div>
        )}

        {!loading && error && (
          <p className="text-[10px] text-red-500 py-2">{error}</p>
        )}

        {!loading && !error && sources.length === 0 && (
          <p className="text-[10px] text-text-tertiary py-2 text-center">
            No references yet.
            <br />
            Upload a PDF or search papers.
          </p>
        )}

        {!loading && sources.slice(0, 4).map((src) => {
          const year = src.created_at
            ? new Date(src.created_at).getFullYear()
            : '2025';
          const firstAuthor = src.authors?.split(',')[0]?.trim() || 'Unknown';

          return (
            <div
              key={src.id}
              onClick={() => onInsertCitation(src)}
              className="p-2.5 rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer transition-all"
            >
              <p className="text-[11px] font-medium text-text-primary dark:text-white line-clamp-1">
                {src.source_type === 'upload' ? '📎 ' : ''}{firstAuthor} ({year})
              </p>
              <p className="text-[10px] text-text-tertiary line-clamp-1 mt-0.5">
                {src.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}