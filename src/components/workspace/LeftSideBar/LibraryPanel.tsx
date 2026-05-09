'use client';

<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
=======
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Loader2, BookOpen, ChevronDown, FileText } from 'lucide-react';
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
import { supabase } from '@/lib/supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Source {
  id: string;
  title: string;
  authors: string;
<<<<<<< HEAD
  created_at: string;
  project_id?: string;
  relevance_score?: number;
  /** Distinguishes a PDF upload from a search-sourced paper. */
  source_type?: 'upload' | 'search';
=======
  year: number;
  citations: number;
  relevance_score?: number;
  source_type?: 'search' | 'upload';
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
}

interface LibraryPanelProps {
  projectId?: string;
  onSearchOpen: () => void;
  onInsertCitation: (paper: any) => void;
  onFileUpload: () => void;
<<<<<<< HEAD
  /** Increment this value from the parent to force a sources re-fetch (e.g. after PDF upload). */
=======
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
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
  
<<<<<<< HEAD
  // Handle 204 No Content and empty responses
=======
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
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
<<<<<<< HEAD

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
=======
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevRefreshKey = useRef(refreshKey);

  const fetchSources = useCallback(async () => {
    if (!projectId) return;
    
    console.log('[LibraryPanel] Fetching sources, refreshKey:', refreshKey);
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both sources and uploaded PDFs
      const [sourcesData, pdfsData] = await Promise.all([
        apiFetch(`/projects/${projectId}/sources`).catch(() => []),
        apiFetch(`/projects/${projectId}/upload/pdf`).catch(() => []),
      ]);
      
      console.log('[LibraryPanel] Raw sources:', sourcesData);
      console.log('[LibraryPanel] Raw PDFs:', pdfsData);
      
      // Map search sources
      const searchSources: Source[] = (Array.isArray(sourcesData) ? sourcesData : []).map((s: any) => ({
        id: s.id,
        title: s.title || 'Untitled',
        authors: Array.isArray(s.authors) ? s.authors.join(', ') : (s.authors || 'Unknown'),
        year: s.year || (s.created_at ? new Date(s.created_at).getFullYear() : new Date().getFullYear()),
        citations: s.citations || s.citations_count || 0,
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
        relevance_score: s.relevance_score,
        source_type: 'search' as const,
      }));

<<<<<<< HEAD
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
=======
      // Map uploaded PDFs - handle different response formats
      const pdfSources: Source[] = (Array.isArray(pdfsData) ? pdfsData : []).map((f: any) => {
        // The backend might return different field names
        const filename = f.filename || f.name || f.path || f.title || 'Uploaded PDF';
        const id = f.id || f.filename || f.path || `pdf-${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          id: id,
          title: filename.replace(/\.pdf$/i, ''), // Remove .pdf extension for display
          authors: 'Uploaded PDF',
          year: f.created_at ? new Date(f.created_at).getFullYear() : new Date().getFullYear(),
          citations: 0,
          relevance_score: 0,
          source_type: 'upload' as const,
        };
      });

      // Merge and de-duplicate
      const searchIds = new Set(searchSources.map(s => s.id));
      const uniquePdfs = pdfSources.filter(p => !searchIds.has(p.id));
      const allSources = [...searchSources, ...uniquePdfs];

      // Sort
      const sorted = allSources.sort((a, b) => {
        if (b.relevance_score !== undefined && a.relevance_score !== undefined && b.relevance_score !== a.relevance_score) {
          return b.relevance_score - a.relevance_score;
        }
        return b.year - a.year;
      });

      console.log('[LibraryPanel] Total sources:', sorted.length, sorted);
      setSources(sorted);
      
    } catch (err: any) {
      console.error('[LibraryPanel] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, refreshKey]);

  // Fetch on mount and when refreshKey changes
  useEffect(() => {
    if (prevRefreshKey.current !== refreshKey) {
      console.log('[LibraryPanel] refreshKey changed from', prevRefreshKey.current, 'to', refreshKey);
      prevRefreshKey.current = refreshKey;
    }
    fetchSources();
  }, [fetchSources, refreshKey]);

  const displayedSources = isExpanded ? sources : sources.slice(0, 4);
  const hasMore = sources.length > 4;

  return (
    <div className="border-t border-surface-border dark:border-dark-border flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
          Reference Library
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={onSearchOpen}
            className="p-1 rounded hover:bg-surface-tertiary dark:hover:bg-dark-border text-text-tertiary hover:text-text-primary transition-colors"
<<<<<<< HEAD
            title="Advanced search"
=======
            title="Search papers"
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFileUpload}
            className="p-1 rounded hover:bg-surface-tertiary dark:hover:bg-dark-border text-text-tertiary hover:text-text-primary transition-colors"
<<<<<<< HEAD
            title="Add reference"
=======
            title="Upload PDF"
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

<<<<<<< HEAD
      <div className="px-3 pb-3 max-h-36 overflow-y-auto space-y-2">
=======
      {/* Content */}
      <div 
        ref={scrollContainerRef}
        className={`px-3 pb-2 overflow-y-auto transition-all duration-300 ${
          isExpanded ? 'max-h-80' : 'max-h-44'
        }`}
      >
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
          </div>
        )}

        {!loading && error && (
<<<<<<< HEAD
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
=======
          <div className="py-3 text-center">
            <p className="text-[10px] text-red-500 mb-1">{error}</p>
            <button 
              onClick={fetchSources}
              className="text-[10px] text-brand-500 hover:text-brand-600 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && sources.length === 0 && (
          <div className="py-4 text-center">
            <BookOpen className="w-5 h-5 text-text-tertiary mx-auto mb-1 opacity-40" />
            <p className="text-[10px] text-text-tertiary">No references yet</p>
            <p className="text-[9px] text-text-tertiary mt-0.5">Upload a PDF or search papers</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-1.5">
            {displayedSources.map((src) => {
              const isUpload = src.source_type === 'upload';
              const firstAuthor = src.authors?.split(',')[0]?.trim() || 'Unknown';
              const lastNames = firstAuthor.split(' ');
              const shortName = lastNames.length > 1 ? lastNames[lastNames.length - 1] : firstAuthor;

              return (
                <div
                  key={src.id}
                  onClick={() => onInsertCitation(src)}
                  className="group p-2 rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    {isUpload ? (
                      <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {isUpload ? (
                        <p className="text-[10px] font-medium text-text-primary dark:text-white line-clamp-1">
                          📄 {src.title}
                        </p>
                      ) : (
                        <>
                          <p className="text-[10px] font-medium text-text-primary dark:text-white line-clamp-1">
                            {shortName} ({src.year})
                          </p>
                          <p className="text-[9px] text-text-tertiary line-clamp-1 mt-0.5">
                            {src.title}
                          </p>
                        </>
                      )}
                    </div>
                    {!isUpload && src.relevance_score !== undefined && src.relevance_score > 0 && (
                      <span className="text-[9px] text-brand-500 dark:text-brand-400 font-medium flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(src.relevance_score * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      {!loading && !error && hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 pb-2 pt-1 text-[10px] text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 font-medium flex items-center justify-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>Show less <ChevronDown className="w-3 h-3 rotate-180" /></>
          ) : (
            <>View all {sources.length} papers <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}

      {/* Source count */}
      {!loading && !error && sources.length > 0 && (
        <div className="px-3 pb-2">
          <span className="text-[9px] text-text-tertiary bg-surface dark:bg-dark-hover px-1.5 py-0.5 rounded">
            {sources.length} source{sources.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
    </div>
  );
}