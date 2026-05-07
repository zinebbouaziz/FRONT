'use client';

import { useState } from 'react';
import {
  Search, X, ExternalLink, Filter, ChevronDown,
  Loader2, PlusCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  citations: number;
  abstract: string;
  url?: string;
  pdf_url?: string;
  relevance_score?: number;
}

interface LiteratureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (paper: Paper) => void;
  projectId: string;
  token: string;
}

// ─── API helper ───────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function getToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = await getToken();
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
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${errText}`);
  }

  const ct = res.headers.get('content-type');
  if (!ct?.includes('application/json')) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LiteratureModal({
  isOpen,
  onClose,
  onInsert,
  projectId,
}: LiteratureModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [minYear, setMinYear] = useState<number | ''>('');
  const [minCitations, setMinCitations] = useState<number | ''>('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── SEARCH ───────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!inputValue.trim() || !projectId) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    setSearchResults([]);
    setSelected(new Set());
    setPendingThreadId(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('No auth session');

      // Step 1: Trigger search (we don't care about the response since it will 500)
      console.log('[Search] Triggering search...');
      
      try {
        const res = await fetch(`${BASE_URL}/projects/${projectId}/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_message: `Find me the latest papers on ${inputValue.trim()}`,
            section_id: null,
          }),
        });
        
        // Try to get thread_id from response if available
        const responseText = await res.text();
        try {
          const data = JSON.parse(responseText);
          if (data?.thread_id) {
            setPendingThreadId(data.thread_id);
          }
        } catch {}
        
        console.log('[Search] Search triggered, status:', res.status);
      } catch (fetchErr: any) {
        console.log('[Search] Fetch error (expected):', fetchErr.message);
      }

      // Step 2: Wait for backend to save results (the search completes before the 500)
      console.log('[Search] Waiting for results to be saved...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Fetch results directly from sources table
      console.log('[Search] Fetching saved sources...');
      const sources = await apiFetch(`/projects/${projectId}/sources`);
      console.log('[Search] Sources:', sources);

      if (sources && Array.isArray(sources) && sources.length > 0) {
        // Map to Paper format
        const papers: Paper[] = sources.map((s: any) => ({
          id: s.id,
          title: s.title || 'Untitled',
          authors: Array.isArray(s.authors) ? s.authors.join(', ') : (s.authors || 'Unknown'),
          year: s.year || (s.created_at ? new Date(s.created_at).getFullYear() : new Date().getFullYear()),
          citations: s.citations || s.citations_count || 0,
          abstract: s.abstract || s.summary || '',
          url: s.url,
          pdf_url: s.pdf_url,
          relevance_score: s.relevance_score,
        }));

        // Sort by relevance
        papers.sort((a, b) => {
          if (b.relevance_score && a.relevance_score) return b.relevance_score - a.relevance_score;
          return b.year - a.year;
        });

        setSearchResults(papers);
        setSelected(new Set(papers.map(p => p.id)));
        console.log('[Search] Displaying', papers.length, 'papers');
      } else {
        // Try once more after another delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retrySources = await apiFetch(`/projects/${projectId}/sources`);
        
        if (retrySources && Array.isArray(retrySources) && retrySources.length > 0) {
          const papers: Paper[] = retrySources.map((s: any) => ({
            id: s.id,
            title: s.title || 'Untitled',
            authors: Array.isArray(s.authors) ? s.authors.join(', ') : (s.authors || 'Unknown'),
            year: s.year || (s.created_at ? new Date(s.created_at).getFullYear() : new Date().getFullYear()),
            citations: s.citations || s.citations_count || 0,
            abstract: s.abstract || s.summary || '',
            url: s.url,
            pdf_url: s.pdf_url,
            relevance_score: s.relevance_score,
          }));
          
          papers.sort((a, b) => {
            if (b.relevance_score && a.relevance_score) return b.relevance_score - a.relevance_score;
            return b.year - a.year;
          });
          
          setSearchResults(papers);
          setSelected(new Set(papers.map(p => p.id)));
        } else {
          setError('No papers found. Try a different query or wait a moment and try again.');
        }
      }
    } catch (err: any) {
      console.error('[Search] Error:', err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── SAVE SELECTED PAPERS ────────────────────────────────────────────────
const saveSelectedPapers = async () => {
  if (selected.size === 0) {
    setError('Select at least one paper first.');
    return;
  }

  setIsSaving(true);
  setError(null);
  setSuccessMsg(null);

  try {
    // Simply insert the selected papers into the editor
    const selectedPapers = searchResults.filter((p) => selected.has(p.id));
    selectedPapers.forEach((p) => onInsert(p));

    setSuccessMsg(`${selectedPapers.length} paper(s) inserted into editor!`);
    
    setTimeout(() => {
      setSearchResults([]);
      setSelected(new Set());
      setPendingThreadId(null);
      setInputValue('');
      onClose();
    }, 1000);

  } catch (err: any) {
    console.error('[Save] Error:', err);
    setError(err.message || 'Could not insert papers.');
  } finally {
    setIsSaving(false);
  }
};

  // ── Helpers ─────────────────────────────────────────────────────────────
  const clearSearch = () => {
    setInputValue('');
    setSearchResults([]);
    setSelected(new Set());
    setPendingThreadId(null);
    setError(null);
    setSuccessMsg(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => { setMinYear(''); setMinCitations(''); };
  const hasActiveFilters = minYear !== '' || minCitations !== '';

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredPapers.length && filteredPapers.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredPapers.map(p => p.id)));
    }
  };

  const applyFilters = (list: Paper[]) =>
    list.filter((p) => {
      const matchesYear = minYear === '' || p.year >= minYear;
      const matchesCitations = minCitations === '' || p.citations >= minCitations;
      return matchesYear && matchesCitations;
    });

  const filteredPapers = applyFilters(searchResults);

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 p-4">
      <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-2xl border border-surface-border dark:border-dark-border shadow-modal overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-white">Search Papers</h2>
              <p className="text-sm text-text-secondary mt-1">
                AI-powered search — select papers to keep in your library
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search + Filter Bar */}
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI to find papers: 'latest RAG for academic writing'"
                className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white placeholder-text-tertiary focus:outline-none focus:border-brand-400"
              />
              {inputValue && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                showFilters || hasActiveFilters
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-secondary hover:text-brand-500'
              }`}
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand-500" />}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 p-4 rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filters</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-brand-500 hover:text-brand-600 font-medium">Clear all</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1">Minimum Year</label>
                  <input
                    type="number"
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 2020"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-surface text-text-primary dark:text-white placeholder-text-tertiary focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1">Min Citations</label>
                  <input
                    type="number"
                    value={minCitations}
                    onChange={(e) => setMinCitations(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 50"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-surface text-text-primary dark:text-white placeholder-text-tertiary focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Success Message ── */}
        {successMsg && (
          <div className="mx-6 mb-4 shrink-0 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300">
            ✅ {successMsg}
          </div>
        )}

        {/* ── Error Display ── */}
        {error && (
          <div className="mx-6 mb-4 shrink-0 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
            {error}
          </div>
        )}

        {/* ── Results toolbar ── */}
        {searchResults.length > 0 && (
          <div className="px-6 pb-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-xs text-brand-500 hover:text-brand-600 font-medium"
              >
                {selected.size === filteredPapers.length && filteredPapers.length > 0 ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-xs text-text-tertiary">
                {selected.size} of {filteredPapers.length} selected
              </span>
            </div>
            <button
              onClick={saveSelectedPapers}
              disabled={selected.size === 0 || isSaving}
              className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5" />
              )}
              Save & Insert ({selected.size})
            </button>
          </div>
        )}

        {/* ── Results list ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 min-h-0">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-text-tertiary">
              <Loader2 className="w-8 h-8 animate-spin opacity-40" />
              <p className="text-sm">Searching for papers…</p>
              <p className="text-xs opacity-50">Results will appear automatically</p>
            </div>
          ) : searchResults.length === 0 && !error ? (
            <div className="py-16 text-center text-text-tertiary">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Search for papers</p>
              <p className="text-xs mt-1">Use AI to find relevant academic papers</p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="py-12 text-center text-text-tertiary">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No papers match your filters.</p>
            </div>
          ) : (
            filteredPapers.map((paper) => {
              const isSelected = selected.has(paper.id);
              return (
                <div
                  key={paper.id}
                  onClick={() => toggleSelect(paper.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-sm'
                      : 'border-surface-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-600 bg-white dark:bg-dark-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(paper.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 rounded border-surface-border dark:border-dark-border text-brand-500 focus:ring-brand-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-text-primary dark:text-white leading-snug">
                          {paper.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary flex-shrink-0">
                          <span>{paper.year || '—'}</span>
                          <span>·</span>
                          <span>{paper.citations} citations</span>
                          {paper.relevance_score !== undefined && (
                            <>
                              <span>·</span>
                              <span className="text-brand-500 font-medium">
                                {Math.round(paper.relevance_score * 100)}% match
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary italic mt-0.5">{paper.authors}</p>
                      {paper.abstract && (
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mt-1.5">
                          {paper.abstract}
                        </p>
                      )}
                      {(paper.url || paper.pdf_url) && (
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const target = paper.url || paper.pdf_url;
                              if (target) window.open(target, '_blank', 'noopener,noreferrer');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-border dark:border-dark-border text-xs font-medium text-text-secondary hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                          >
                            View Paper
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}