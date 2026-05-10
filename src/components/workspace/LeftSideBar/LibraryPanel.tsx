'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Loader2, BookOpen, ChevronDown, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Source {
  id: string;
  title: string;
  authors: string;
  year: number;
  citations: number;
  relevance_score?: number;
  source_type?: 'search' | 'upload';
}

interface LibraryPanelProps {
  projectId?: string;
  onSearchOpen: () => void;
  onInsertCitation: (paper: any) => void;
  onFileUpload: () => void;
  refreshKey?: number;
}

async function apiFetch(endpoint: string, options?: RequestInit) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('No auth session');

    const url = `${API_URL}${endpoint}`;
    console.log(`[apiFetch] 🌐 ${options?.method || 'GET'} ${url}`);
    
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });
    
    console.log(`[apiFetch] 📡 Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const err = await res.text();
      console.error(`[apiFetch] ❌ Error ${res.status}: ${err}`);
      throw new Error(`${res.status}: ${err}`);
    }
    
    const contentType = res.headers.get('content-type');
    console.log(`[apiFetch] 📄 Content-Type: ${contentType}`);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`[apiFetch] ⚠️ Non-JSON response for ${endpoint}`);
      const text = await res.text();
      console.log(`[apiFetch] 📝 Raw response (first 200 chars):`, text.substring(0, 200));
      return null;
    }
    
    const text = await res.text();
    console.log(`[apiFetch] 📝 Raw JSON string (first 300 chars):`, text.substring(0, 300));
    
    const data = text ? JSON.parse(text) : null;
    console.log(`[apiFetch] ✅ Parsed data:`, data);
    console.log(`[apiFetch] 📊 Data type:`, Array.isArray(data) ? `Array(${data.length})` : typeof data);
    
    return data;
  } catch (err: any) {
    console.error(`[apiFetch] 💥 Failed for ${endpoint}: ${err.message}`);
    throw err;
  }
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
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousRefreshKey = useRef(refreshKey);

  const fetchSources = useCallback(async () => {
    if (!projectId) {
      console.log('[LibraryPanel] ⏭️ No projectId, skipping fetch');
      return;
    }
    
    console.log(`[LibraryPanel] 🔄 Fetching sources for project: ${projectId}`);
    console.log(`[LibraryPanel] 🔑 Current refreshKey: ${refreshKey}`);
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch sources
      console.log('[LibraryPanel] 📥 Fetching /sources...');
      const sourcesData = await apiFetch(`/projects/${projectId}/sources`);
      console.log('[LibraryPanel] 📦 Sources data received:', sourcesData);
      
      // Fetch uploaded PDFs
      console.log('[LibraryPanel] 📥 Fetching /upload/pdf...');
      const pdfsData = await apiFetch(`/projects/${projectId}/upload/pdf`);
      console.log('[LibraryPanel] 📦 PDFs data received:', pdfsData);
      console.log('[LibraryPanel] 📦 PDFs data type:', typeof pdfsData, Array.isArray(pdfsData));
      
      // Map search sources
      const searchSources: Source[] = (Array.isArray(sourcesData) ? sourcesData : []).map((s: any) => ({
        id: s.id || `source-${Math.random()}`,
        title: s.title || 'Untitled',
        authors: Array.isArray(s.authors) ? s.authors.join(', ') : (s.authors || 'Unknown'),
        year: s.year || (s.created_at ? new Date(s.created_at).getFullYear() : new Date().getFullYear()),
        citations: s.citations || s.citations_count || 0,
        relevance_score: s.relevance_score,
        source_type: 'search' as const,
      }));

      console.log('[LibraryPanel] 🔍 Mapped search sources:', searchSources.length);
      
      // Map uploaded PDFs - CRITICAL: Handle all possible response formats
      let rawPdfs = [];
      if (Array.isArray(pdfsData)) {
        rawPdfs = pdfsData;
        console.log('[LibraryPanel] 📄 PDFs is array of length:', rawPdfs.length);
      } else if (pdfsData && typeof pdfsData === 'object') {
        // Maybe it's wrapped in a data property?
        if (pdfsData.data && Array.isArray(pdfsData.data)) {
          rawPdfs = pdfsData.data;
          console.log('[LibraryPanel] 📄 PDFs found in .data property, length:', rawPdfs.length);
        } else if (pdfsData.files && Array.isArray(pdfsData.files)) {
          rawPdfs = pdfsData.files;
          console.log('[LibraryPanel] 📄 PDFs found in .files property, length:', rawPdfs.length);
        } else if (pdfsData.pdfs && Array.isArray(pdfsData.pdfs)) {
          rawPdfs = pdfsData.pdfs;
          console.log('[LibraryPanel] 📄 PDFs found in .pdfs property, length:', rawPdfs.length);
        } else {
          // Single object
          rawPdfs = [pdfsData];
          console.log('[LibraryPanel] 📄 Single PDF object, wrapping in array');
        }
      }
      
      console.log('[LibraryPanel] 📄 Raw PDFs to process:', rawPdfs.length, rawPdfs);
      
      const pdfSources: Source[] = rawPdfs.map((f: any, index: number) => {
        console.log(`[LibraryPanel] 📄 Processing PDF ${index}:`, f);
        
        const filename = f.filename || f.name || f.file_name || f.path || f.title || 'Uploaded PDF';
        const id = f.id || f.file_id || f.filename || f.path || `pdf-${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`[LibraryPanel] 📄 Mapped PDF: id=${id}, filename=${filename}`);
        
        return {
          id: id,
          title: filename.replace(/\.pdf$/i, ''),
          authors: 'Uploaded PDF',
          year: f.created_at ? new Date(f.created_at).getFullYear() : new Date().getFullYear(),
          citations: 0,
          relevance_score: 0,
          source_type: 'upload' as const,
        };
      });

      console.log('[LibraryPanel] 📄 Mapped PDF sources:', pdfSources.length);
      
      // Merge and de-duplicate
      const searchIds = new Set(searchSources.map(s => s.id));
      const uniquePdfs = pdfSources.filter(p => !searchIds.has(p.id));
      const allSources = [...searchSources, ...uniquePdfs];

      console.log('[LibraryPanel] 🔗 Merged sources:');
      console.log(`  - Search sources: ${searchSources.length}`);
      console.log(`  - PDF sources: ${pdfSources.length} (${uniquePdfs.length} unique)`);
      console.log(`  - Total: ${allSources.length}`);

      // Sort
      const sorted = allSources.sort((a, b) => {
        if (b.relevance_score !== undefined && a.relevance_score !== undefined && b.relevance_score !== a.relevance_score) {
          return b.relevance_score - a.relevance_score;
        }
        return b.year - a.year;
      });

      console.log(`[LibraryPanel] ✅ Final sources count: ${sorted.length}`, sorted);
      setSources(sorted);
      
    } catch (err: any) {
      console.error('[LibraryPanel] ❌ Error:', err);
      setError(err.message || 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch on mount and when refreshKey changes
  useEffect(() => {
    console.log(`[LibraryPanel] ⚡ Effect triggered`);
    console.log(`  - Current refreshKey: ${refreshKey}`);
    console.log(`  - Previous refreshKey: ${previousRefreshKey.current}`);
    console.log(`  - Changed: ${refreshKey !== previousRefreshKey.current}`);
    
    if (refreshKey !== previousRefreshKey.current) {
      console.log('[LibraryPanel] 🔄 refreshKey changed, fetching sources...');
      fetchSources();
    } else {
      console.log('[LibraryPanel] ⏭️ refreshKey unchanged, skipping fetch');
    }
    
    previousRefreshKey.current = refreshKey;
  }, [fetchSources, refreshKey]);

  const displayedSources = isExpanded ? sources : sources.slice(0, 4);
  const hasMore = sources.length > 4;

  return (
    <div className="border-t border-surface-border dark:border-dark-border flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
          Reference Library
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={onSearchOpen}
            className="p-1 rounded hover:bg-surface-tertiary dark:hover:bg-dark-border text-text-tertiary hover:text-text-primary transition-colors"
            title="Search papers"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFileUpload}
            className="p-1 rounded hover:bg-surface-tertiary dark:hover:bg-dark-border text-text-tertiary hover:text-text-primary transition-colors"
            title="Upload PDF"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={scrollContainerRef}
        className={`px-3 pb-2 overflow-y-auto transition-all duration-300 ${
          isExpanded ? 'max-h-80' : 'max-h-44'
        }`}
      >
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
          </div>
        )}

        {!loading && error && (
          <div className="py-3 text-center">
            <p className="text-[10px] text-red-500 mb-1">Failed to load</p>
            <p className="text-[9px] text-text-tertiary mb-2">{error}</p>
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

        {!loading && !error && sources.length > 0 && (
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
    </div>
  );
}