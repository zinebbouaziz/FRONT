'use client';

import { useState, useEffect } from 'react';
import {
  Search, X, ExternalLink, Filter, ChevronDown,
  Check, Loader2, PlusCircle,
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
  token: string; // kept for prop compat — internally we always get a fresh session token
}

// ─── API helper — always fetches a fresh Supabase token ───────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function apiFetch(endpoint: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const freshToken = session?.access_token;
  if (!freshToken) throw new Error('No auth session — please sign in again.');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${freshToken}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    // Expose the full backend body so 500 errors are actually debuggable
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${errText}`);
  }

  const ct = res.headers.get('content-type');
  if (!ct?.includes('application/json')) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── agent_output parser ─────────────────────────────────────────────────────
// The backend returns results in this heading format (confirmed from live response):
//
//   ### 1. Title Here
//   **Authors:** Name | **Year:** 2022 | **Source:** Semantic Scholar | **Citations:** 570 | **Relevance:** 0.4138
//   **Links:** [PDF](https://url.com)
//
// A markdown-table fallback handles any future format change.

/** Extract the first URL from a [label](url) markdown link or bare https://. */
function extractUrl(text: string): string | undefined {
  if (!text) return undefined;
  const mdLink = text.match(/\[.*?\]\((https?:\/\/[^)\s]+)\)/);
  if (mdLink) return mdLink[1];
  const bare = text.match(/https?:\/\/[^\s),>"]+/);
  return bare ? bare[0] : undefined;
}

/** Read the value of **Field:** from a bold-field line, trying multiple key aliases. */
function getBoldField(text: string, ...keys: string[]): string {
  for (const key of keys) {
    const re = new RegExp(`\\*\\*${key}:\\*\\*\\s*([^|*\n]+)`, 'i');
    const m = text.match(re);
    if (m) return m[1].trim();
  }
  return '';
}

/** Parse the ### N. heading format the backend actually returns. */
function parseHeadingFormat(output: string): Paper[] {
  const papers: Paper[] = [];
  // Each paper starts with "### <number>." or "### <number>)"
  const sections = output.split(/(?=###\s+\d+[.)]\s)/);
  for (const section of sections) {
    const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const titleMatch = lines[0].match(/^###\s+\d+[.)]\s+(.+)$/);
    if (!titleMatch) continue;
    const title = titleMatch[1].replace(/\*+/g, '').trim();

    // Flatten remaining lines into one searchable string
    const body = lines.slice(1).join(' | ');

    const authors         = getBoldField(body, 'Authors', 'Author') || 'Unknown';
    const yearStr         = getBoldField(body, 'Year', 'Published', 'Date');
    const year            = parseInt(yearStr.replace(/\D/g, '')) || 0;
    const citStr          = getBoldField(body, 'Citations', 'Cited by', 'Cites');
    const citations       = parseInt(citStr.replace(/\D/g, '')) || 0;
    const relStr          = getBoldField(body, 'Relevance', 'Relevance Score', 'Score', 'Similarity');
    const relevance_score = relStr ? (parseFloat(relStr) || undefined) : undefined;
    const abstract        = getBoldField(body, 'Abstract', 'Summary', 'Description');

    // **Links:** [PDF](url)  or  **Links:** [Paper](url)
    const linksMatch = body.match(/\*\*Links?:\*\*\s*(.+?)(?=\s*\*\*|$)/i);
    const linksText  = linksMatch ? linksMatch[1] : body;
    const pdfMatch   = linksText.match(/\[PDF\]\((https?:\/\/[^)\s]+)\)/i);
    const pdf_url    = pdfMatch ? pdfMatch[1] : extractUrl(linksText);
    const anyLinkMatch = linksText.match(/\[(?:Paper|Link|URL|Source|DOI)\]\((https?:\/\/[^)\s]+)\)/i);
    const url        = anyLinkMatch ? anyLinkMatch[1] : pdf_url;

    if (!title) continue;
    papers.push({
      id: `temp-${Date.now()}-${papers.length}`,
      title, authors, year, citations, abstract, url, pdf_url, relevance_score,
    });
  }
  return papers;
}

/** Parse a markdown table (fallback if the agent format changes). */
function parseMarkdownTable(markdown: string): Paper[] {
  const lines = markdown.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 3) return [];
  const headers = lines[0].split('|').map((h) => h.trim().toLowerCase()).filter(Boolean);
  const papers: Paper[] = [];
  lines.slice(2).forEach((line, idx) => {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    const title     = row['title'] || row['paper title'] || 'Untitled';
    const authors   = row['authors'] || row['author'] || 'Unknown';
    const year      = parseInt((row['year'] || '0').replace(/\D/g, '')) || 0;
    const citations = parseInt((row['citations'] || '0').replace(/\D/g, '')) || 0;
    const abstract  = row['abstract'] || row['summary'] || '';
    const pdf_url   = extractUrl(row['pdf_url'] || row['pdf'] || '');
    const url       = extractUrl(row['url'] || row['link'] || '') || pdf_url;
    const relRaw    = row['relevance'] || row['relevance_score'] || '';
    const relevance_score = relRaw ? (parseFloat(relRaw) || undefined) : undefined;
    if (title === 'Untitled' && authors === 'Unknown') return;
    papers.push({ id: `temp-${Date.now()}-${idx}`, title, authors, year, citations, abstract, url, pdf_url, relevance_score });
  });
  return papers;
}

/**
 * Master parser: tries ### heading format first (actual backend output),
 * then markdown table as fallback.
 */
function parseAgentOutput(output: string): Paper[] {
  if (!output) return [];
  if (/###\s+\d+[.)]\s/.test(output)) {
    const r = parseHeadingFormat(output);
    if (r.length > 0) return r;
  }
  if (output.includes('|')) {
    const r = parseMarkdownTable(output);
    if (r.length > 0) return r;
  }
  return [];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LiteratureModal({
  isOpen,
  onClose,
  onInsert,
  projectId,
}: LiteratureModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // papers        = already saved in DB  (from GET /sources)
  // searchResults = temporary, parsed from the last agent_output — not yet saved
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Thread ID of the pending search run (needed to call /resume)
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [minYear, setMinYear] = useState<number | ''>('');
  const [minCitations, setMinCitations] = useState<number | ''>('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load saved sources when modal opens ──────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen && projectId) loadSavedSources();
  }, [isOpen, projectId]);

  const loadSavedSources = async () => {
    try {
      const data = await apiFetch(`/projects/${projectId}/sources`);
      const mapped: Paper[] = (data ?? []).map((s: any) => ({
        id: s.id,
        title: s.title || 'Untitled',
        authors: Array.isArray(s.authors) ? s.authors.join(', ') : (s.authors || 'Unknown'),
        year: s.year || (s.created_at ? new Date(s.created_at).getFullYear() : 0),
        citations: s.citations || 0,
        abstract: s.abstract || s.summary || '',
        url: s.url,
        pdf_url: s.pdf_url,
        relevance_score: s.relevance_score,
      }));
      setPapers(mapped);
    } catch (err) {
      console.error('loadSavedSources:', err);
    }
  };

  // ── SEARCH ───────────────────────────────────────────────────────────────
  // Exact phrasing from ThunderClient Step 15:
  //   "Find me the latest papers on X"
  // Returns pending_review + markdown table in agent_output.
  // Papers are NOT saved yet — user must click "Add to Library" to approve.
  const handleSearch = async () => {
    if (!inputValue.trim() || !projectId) return;

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setPendingThreadId(null);

    try {
      const data = await apiFetch(`/projects/${projectId}/run`, {
        method: 'POST',
        body: JSON.stringify({
          user_message: `Find me the latest papers on ${inputValue.trim()}`,
          section_id: null,
        }),
      });

      if (data?.thread_id) setPendingThreadId(data.thread_id);
      setSearchQuery(inputValue.trim());

      const parsed = parseAgentOutput(data?.agent_output ?? '');

      if (parsed.length > 0) {
        setSearchResults(parsed);
      } else if (data?.agent_output) {
        // Couldn't parse as table — show raw output so it's not a silent failure
        setError(
          'Results returned but could not be shown as cards.\n\n' +
          data.agent_output.slice(0, 400) +
          (data.agent_output.length > 400 ? '\n\n[…truncated]' : '')
        );
      } else {
        setError('No papers found. Try a more specific query.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── ADD SELECTED TO LIBRARY ───────────────────────────────────────────────
  // Flow matching ThunderClient Step 15 → 12:
  //  1. POST /resume { hitl_action: "approve" }
  //     → backend saves ALL parsed papers to the sources table
  //  2. GET /sources → get real DB IDs
  //  3. DELETE /sources/{id} for every paper NOT in the user's selection
  //     (requires DELETE /projects/{project_id}/sources/{source_id} on backend)
  const addSelectedToLibrary = async () => {
    if (selected.size === 0) {
      setError('Select at least one paper first.');
      return;
    }
    if (!pendingThreadId) {
      setError('No pending search thread — run a new search first.');
      return;
    }

    setIsSaving(true);
    setError(null);

    // Normalised titles of papers the user checked
    const selectedTitles = new Set(
      searchResults
        .filter((p) => selected.has(p.id))
        .map((p) => p.title.toLowerCase().trim())
    );

    try {
      // 1. Approve → backend commits ALL results to sources
      await apiFetch(`/projects/${projectId}/run/${pendingThreadId}/resume`, {
        method: 'POST',
        body: JSON.stringify({ hitl_action: 'approve' }),
      });

      // 2. Fetch newly saved sources to get real DB IDs
      const saved: Array<{ id: string; title: string }> =
        (await apiFetch(`/projects/${projectId}/sources`)) ?? [];

      // 3. Delete sources whose title was NOT selected by the user
      const toDelete = saved.filter(
        (s) => !selectedTitles.has(s.title.toLowerCase().trim())
      );

      if (toDelete.length > 0) {
        await Promise.allSettled(
          toDelete.map((s) =>
            apiFetch(`/projects/${projectId}/sources/${s.id}`, { method: 'DELETE' })
          )
        );
      }

      // Reset temporary state and reload the saved library
      setSearchResults([]);
      setSelected(new Set());
      setPendingThreadId(null);
      await loadSavedSources();
    } catch (err: any) {
      setError(err.message || 'Could not add selected papers.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Misc helpers ─────────────────────────────────────────────────────────
  const clearSearch = () => {
    setInputValue('');
    setSearchQuery('');
    setSearchResults([]);
    setPendingThreadId(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => { setMinYear(''); setMinCitations(''); };
  const hasActiveFilters = minYear !== '' || minCitations !== '';

  const applyFilters = (list: Paper[]) =>
    list.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q);
      const matchesYear = minYear === '' || p.year >= minYear;
      const matchesCitations = minCitations === '' || p.citations >= minCitations;
      return matchesQuery && matchesYear && matchesCitations;
    });

  // Temporary results take priority over saved library
  const displayPapers = searchResults.length > 0 ? searchResults : papers;
  const filteredPapers = applyFilters(displayPapers);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  // Insert from the SAVED library into the editor (not search results)
  const insertSelected = () => {
    papers.filter((p) => selected.has(p.id)).forEach((p) => onInsert(p));
    setSelected(new Set());
    onClose();
  };

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 p-4">
      <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-2xl border border-surface-border dark:border-dark-border shadow-modal overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-white">Reference Library</h2>
              <p className="text-sm text-text-secondary mt-1">
                Search papers via AI, then select the ones you want to add
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
                className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white placeholder-text-tertiary focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40"
              />
              {inputValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
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
              className={`px-4 py-2.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                showFilters || hasActiveFilters
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-secondary hover:text-brand-500'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
              {hasActiveFilters && <span className="ml-0.5 w-2 h-2 rounded-full bg-brand-500" />}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 p-4 rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filters</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1">
                    Minimum Year
                  </label>
                  <input
                    type="number"
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 2020"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-surface text-text-primary dark:text-white placeholder-text-tertiary focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1">
                    Minimum Citations
                  </label>
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

        {/* ── Error Display ── */}
        {error && (
          <div className="mx-6 mb-4 shrink-0 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
            {error}
          </div>
        )}

        {/* ── "Add Selected" toolbar — visible while temporary results are shown ── */}
        {searchResults.length > 0 && (
          <div className="px-6 pb-2 flex items-center justify-between shrink-0">
            <span className="text-xs text-text-tertiary">
              {filteredPapers.length} result{filteredPapers.length !== 1 ? 's' : ''} — select the ones you want to keep
            </span>
            <button
              onClick={addSelectedToLibrary}
              disabled={selected.size === 0 || isSaving}
              className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5" />
              )}
              Add to Library ({selected.size})
            </button>
          </div>
        )}

        {/* ── Paper count — visible when showing saved library ── */}
        {searchResults.length === 0 && (
          <div className="px-6 pb-2 text-xs text-text-tertiary shrink-0">
            {papers.length} paper{papers.length !== 1 ? 's' : ''} in library
            {searchQuery && ` · Matching "${searchQuery}"`}
          </div>
        )}

        {/* ── Results list ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 min-h-0">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-text-tertiary">
              <Loader2 className="w-8 h-8 animate-spin opacity-40" />
              <p className="text-sm">Searching for papers…</p>
            </div>
          ) : searchResults.length === 0 && papers.length === 0 ? (
            <div className="py-16 text-center text-text-tertiary">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No papers yet</p>
              <p className="text-xs mt-1">Search above to find and save references</p>
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
                      className="mt-1 w-4 h-4 rounded border-surface-border dark:border-dark-border text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
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

        {/* ── Footer — insert saved papers into editor ── */}
        {searchResults.length === 0 && selected.size > 0 && (
          <div className="px-6 py-4 border-t border-surface-border dark:border-dark-border bg-surface-secondary/50 dark:bg-dark-card/50 flex items-center justify-between shrink-0">
            <span className="text-sm text-text-secondary">
              {selected.size} paper{selected.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={insertSelected}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Insert Citation{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}