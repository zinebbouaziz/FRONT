'use client';
<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
=======
import { useEffect, useState } from 'react';
import { BookOpen, Plus, Loader2, Sparkles, ChevronDown, ChevronUp, RefreshCw, Quote } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384

interface Source {
  id: string;
  title: string;
<<<<<<< HEAD
  authors: string | string[];
  year: number;
  citations: number;
  abstract?: string;
  url?: string;
  pdf_url?: string;
=======
  authors: string;
  year: number;
  citation: string;
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
  relevance_score?: number;
}

interface LiteratureReviewPanelProps {
<<<<<<< HEAD
  litReview: {
    known: string;
    debated: string;
    methodologies: string;
    gaps: string;
  };
  setLitReview: (review: any) => void;
  onInsertCitation?: (paper: any) => void;
  projectId: string;   // new
  token: string;       // new
=======
  projectId: string;
  token: string;
  onInsertCitation?: (paper: any) => void;
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function LiteratureReviewPanel({
<<<<<<< HEAD
  litReview,
  setLitReview,
  onInsertCitation,
  projectId,
  token,
}: LiteratureReviewPanelProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    loadSources();
  }, [projectId]);

  const loadSources = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/projects/${projectId}/sources`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load sources');
      const data = await res.json();
      const mapped: Source[] = data.map((s: any) => ({
        id: s.id,
        title: s.title || 'Untitled',
        authors: Array.isArray(s.authors) ? s.authors.join(', ') : (s.authors || 'Unknown'),
        year: s.year || 0,
        citations: s.citations || 0,
        abstract: s.abstract || '',
        url: s.url,
        pdf_url: s.pdf_url,
        relevance_score: s.relevance_score,
      }));
      setSources(mapped);
    } catch (err: any) {
=======
  projectId,
  token,
  onInsertCitation,
}: LiteratureReviewPanelProps) {
  const [litReview, setLitReview] = useState({
    known: '',
    debated: '',
    methodologies: '',
    gaps: '',
  });
  const [citations, setCitations] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [citationsLoading, setCitationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchLiteratureReview();
    }
  }, [projectId]);

  const getToken = async (): Promise<string> => {
    if (token) return token;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const fetchLiteratureReview = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = await getToken();
      
      if (!authToken) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const listRes = await fetch(`${BASE_URL}/projects/${projectId}/literature`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!listRes.ok) {
        if (listRes.status === 404) {
          setLitReview({ known: '', debated: '', methodologies: '', gaps: '' });
          setCitations([]);
          setLoading(false);
          return;
        }
        throw new Error(`Failed: ${listRes.status}`);
      }

      const analyses = await listRes.json();
      
      if (!analyses || (Array.isArray(analyses) && analyses.length === 0)) {
        setLitReview({ known: '', debated: '', methodologies: '', gaps: '' });
        setCitations([]);
        setLoading(false);
        return;
      }

      const latestAnalysis = Array.isArray(analyses) ? analyses[0] : analyses;

      const detailsRes = await fetch(`${BASE_URL}/literature/${latestAnalysis.id}`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!detailsRes.ok) throw new Error(`Failed to fetch details: ${detailsRes.status}`);

      const details = await detailsRes.json();
      
      const reviewText = details.review_content || '';
      const gapsText = details.gaps_content || '';

      const parsed = parseLiteratureContent(reviewText);
      
      if (gapsText && !parsed.gaps) {
        parsed.gaps = cleanGapsContent(gapsText);
      } else if (parsed.gaps) {
        parsed.gaps = cleanGapsContent(parsed.gaps);
      }

      setLitReview(parsed);
      await fetchCitations(latestAnalysis.id, authToken);

    } catch (err: any) {
      console.error('Error:', err);
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const updateField = (field: keyof typeof litReview, value: string) => {
    setLitReview({ ...litReview, [field]: value });
  };

  return (
    <div className="px-3 py-3 space-y-4">
      {/* Four text cards */}
      <div className="space-y-3">
        <TextCard
          label="What is known"
          value={litReview.known}
          onChange={(v) => updateField('known', v)}
          placeholder="Summarize established findings..."
        />
        <TextCard
          label="What is debated"
          value={litReview.debated}
          onChange={(v) => updateField('debated', v)}
          placeholder="Describe controversies or open questions..."
        />
        <TextCard
          label="Methodologies"
          value={litReview.methodologies}
          onChange={(v) => updateField('methodologies', v)}
          placeholder="Common approaches used in the field..."
        />
        <TextCard
          label="Gaps"
          value={litReview.gaps}
          onChange={(v) => updateField('gaps', v)}
          placeholder="Identify research gaps..."
        />
      </div>

      {/* Divider */}
      <div className="border-t border-surface-border dark:border-dark-border pt-3">
        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
          Citations
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-4 text-text-tertiary">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-xs text-red-500 py-2">{error}</div>
        ) : sources.length === 0 ? (
          <p className="text-xs text-text-tertiary py-2">No sources saved yet. Search in Reference Library to add papers.</p>
        ) : (
          <div className="space-y-2">
            {sources.map((src) => (
              <CitationCard
                key={src.id}
                source={src}
                onInsert={() => onInsertCitation?.(src)}
=======
  const fetchCitations = async (analysisId: string, authToken: string) => {
    try {
      setCitationsLoading(true);
      
      const detailsRes = await fetch(`${BASE_URL}/literature/${analysisId}`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!detailsRes.ok) return;

      const details = await detailsRes.json();
      
      const citationsData = details.literature_citations || details.citations || [];
      
      const mappedCitations: Source[] = citationsData.map((citation: any) => {
        const source = citation.sources || citation;
        return {
          id: source.id || citation.id,
          title: source.title || citation.title || 'Untitled',
          authors: source.authors || citation.authors || 'Unknown',
          year: source.year || citation.year || new Date().getFullYear(),
          citation: citation.formatted_citation || `${source.authors || 'Unknown'} (${source.year || 'n.d.'}). ${source.title || 'Untitled'}.`,
          relevance_score: citation.relevance_score || source.relevance_score || 0,
        };
      });

      setCitations(mappedCitations);
    } catch (err) {
      console.error('Error fetching citations:', err);
    } finally {
      setCitationsLoading(false);
    }
  };

  // ============================================
  // GENERATE LITERATURE REVIEW
  // ============================================
  const handleGenerate = async () => {
    if (!projectId) return;

    setGenerating(true);
    setGenerateError(null);

    try {
      const authToken = await getToken();
      if (!authToken) throw new Error('Not authenticated');

      // Step 1: Run the orchestrator with literature intent
      const runRes = await fetch(`${BASE_URL}/projects/${projectId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_message: 'Generate a comprehensive literature review analysis from the uploaded PDFs. Structure the output with these sections: "What is Known", "What is Debated", "Methodologies", and "Research Gaps".',
          section_id: null,
        }),
      });

      if (!runRes.ok) throw new Error(`Generation failed: ${runRes.status}`);

      const runData = await runRes.json();

      // Step 2: If pending_review, auto-approve
      if (runData.status === 'pending_review' && runData.thread_id) {
        await fetch(`${BASE_URL}/projects/${projectId}/run/${runData.thread_id}/resume`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hitl_action: 'approve' }),
        });

        // Wait for backend to save
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Step 3: Refresh the literature review
      await fetchLiteratureReview();

    } catch (err: any) {
      console.error('Generation error:', err);
      setGenerateError(err.message || 'Failed to generate literature review');
    } finally {
      setGenerating(false);
    }
  };

  // ============================================
  // REGENERATE LITERATURE REVIEW
  // ============================================
  const handleRegenerate = async () => {
    if (!projectId) return;

    setGenerating(true);
    setGenerateError(null);

    try {
      const authToken = await getToken();
      if (!authToken) throw new Error('Not authenticated');

      const runRes = await fetch(`${BASE_URL}/projects/${projectId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_message: 'Regenerate the literature review analysis with fresh insights. Focus on emerging trends, recent developments, and critical analysis. Structure with: "What is Known", "What is Debated", "Methodologies", and "Research Gaps".',
          section_id: null,
        }),
      });

      if (!runRes.ok) throw new Error(`Regeneration failed: ${runRes.status}`);

      const runData = await runRes.json();

      if (runData.status === 'pending_review' && runData.thread_id) {
        await fetch(`${BASE_URL}/projects/${projectId}/run/${runData.thread_id}/resume`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hitl_action: 'approve' }),
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      await fetchLiteratureReview();

    } catch (err: any) {
      console.error('Regeneration error:', err);
      setGenerateError(err.message || 'Failed to regenerate literature review');
    } finally {
      setGenerating(false);
    }
  };

  const parseLiteratureContent = (content: string) => {
    const result = {
      known: '',
      debated: '',
      methodologies: '',
      gaps: '',
    };

    if (!content) return result;

    const mainContent = content.split(/\n---\n|\n## References\n/)[0] || content;
    const sections = mainContent.split(/(?=\n## )/);

    sections.forEach((section: string) => {
      const trimmed = section.trim();
      const lower = trimmed.toLowerCase();
      const contentWithoutHeader = trimmed.replace(/^## .+?\n/, '').trim();

      if (lower.startsWith('## what is known')) {
        result.known = contentWithoutHeader;
      } else if (lower.startsWith('## what is debated')) {
        result.debated = contentWithoutHeader;
      } else if (lower.startsWith('## methodologies')) {
        result.methodologies = contentWithoutHeader;
      } else if (lower.startsWith('## research gaps') || lower.startsWith('## gaps')) {
        result.gaps = contentWithoutHeader;
      }
    });

    if (!result.known && !result.debated && !result.methodologies && !result.gaps) {
      result.known = content;
    }

    return result;
  };

  const cleanGapsContent = (content: string): string => {
    let cleaned = content.replace(/\[\d+\]/g, '');
    cleaned = cleaned.replace(/Source:.*$/gm, '');
    cleaned = cleaned.replace(/Chunk:.*$/gm, '');
    cleaned = cleaned.replace(/\(.*?\.pdf.*?\)/g, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    return cleaned;
  };

  const toggleCardExpansion = (cardLabel: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardLabel]: !prev[cardLabel]
    }));
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        <p className="text-xs text-text-tertiary">Loading literature analysis...</p>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="px-3 py-6 text-center space-y-3">
        <p className="text-xs text-red-500">Error: {error}</p>
        <button onClick={fetchLiteratureReview} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-medium hover:bg-brand-100">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  const isEmpty = !litReview.known && !litReview.debated && !litReview.methodologies && !litReview.gaps;

  // ============================================
  // EMPTY STATE - SHOW GENERATE BUTTON
  // ============================================
  if (isEmpty) {
    return (
      <div className="px-3 py-6 space-y-4">
        <div className="rounded-xl border-2 border-dashed border-surface-border dark:border-dark-border p-6 text-center">
          <BookOpen className="w-10 h-10 text-text-tertiary mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-2">
            No Literature Analysis Yet
          </h3>
          <p className="text-xs text-text-secondary dark:text-text-secondary mb-4 leading-relaxed">
            Generate a comprehensive literature analysis from your uploaded PDFs. The AI will analyze and structure the review into four sections.
          </p>
          
          {generateError && (
            <div className="flex items-center justify-center gap-1 text-xs text-red-500 mb-3 bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3">
              {generateError}
            </div>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Analysis...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Literature Analysis
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // FULL REVIEW STATE
  // ============================================
  return (
    <div className="px-3 py-3 space-y-3">
      {/* Header with Regenerate button */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Literature Analysis</p>
        <div className="flex items-center gap-1">
          <button 
            onClick={fetchLiteratureReview} 
            className="p-1 rounded text-text-tertiary hover:text-text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Generate error banner */}
      {generateError && (
        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3">
          {generateError}
        </div>
      )}

      {/* What is Known */}
      <ReviewCard
        label="What is Known"
        icon="📚"
        content={litReview.known}
        isExpanded={expandedCards['known']}
        onToggle={() => toggleCardExpansion('known')}
        colorClass="border-l-green-400 dark:border-l-green-500"
      />

      {/* What is Debated */}
      <ReviewCard
        label="What is Debated"
        icon="⚡"
        content={litReview.debated}
        isExpanded={expandedCards['debated']}
        onToggle={() => toggleCardExpansion('debated')}
        colorClass="border-l-amber-400 dark:border-l-amber-500"
      />

      {/* Methodologies */}
      <ReviewCard
        label="Methodologies"
        icon="🔬"
        content={litReview.methodologies}
        isExpanded={expandedCards['methodologies']}
        onToggle={() => toggleCardExpansion('methodologies')}
        colorClass="border-l-blue-400 dark:border-l-blue-500"
      />

      {/* Research Gaps */}
      <ReviewCard
        label="Research Gaps"
        icon="🎯"
        content={litReview.gaps}
        isExpanded={expandedCards['gaps']}
        onToggle={() => toggleCardExpansion('gaps')}
        colorClass="border-l-purple-400 dark:border-l-purple-500"
      />

      {/* Citations Section */}
      <div className="border-t border-surface-border dark:border-dark-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Citations</p>
          {citations.length > 0 && (
            <span className="text-[10px] text-text-tertiary bg-surface dark:bg-dark-hover px-1.5 py-0.5 rounded">
              {citations.length} source{citations.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {citationsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
          </div>
        ) : citations.length === 0 ? (
          <div className="text-center py-4">
            <Quote className="w-4 h-4 text-text-tertiary mx-auto mb-1 opacity-50" />
            <p className="text-[10px] text-text-tertiary">No citations available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {citations.map((source) => (
              <CitationCard
                key={source.id}
                source={source}
                onInsert={() => onInsertCitation?.(source)}
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
              />
            ))}
          </div>
        )}
      </div>
<<<<<<< HEAD
=======

      {/* Regenerate Button at Bottom */}
      <div className="pt-2 pb-1">
        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-surface-border dark:border-dark-border text-text-secondary dark:text-text-tertiary text-xs font-medium hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {generating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Regenerate Literature Analysis
            </>
          )}
        </button>
      </div>
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
    </div>
  );
}

<<<<<<< HEAD
// Helper component for text area cards
function TextCard({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <div className="rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden">
      <span className="text-[12px] font-semibold dark:text-brand-400 uppercase tracking-wide m-2">
        {label}
      </span>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          adjustHeight();
        }}
        placeholder={placeholder}
        rows={1}
        className="w-full px-3 py-2 text-xs bg-transparent text-text-primary dark:text-white placeholder-text-tertiary resize-none focus:outline-none overflow-hidden"
        style={{ minHeight: '60px' }}
      />
=======
// Review Card Component
function ReviewCard({
  label,
  icon,
  content,
  isExpanded,
  onToggle,
  colorClass,
}: {
  label: string;
  icon: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
  colorClass: string;
}) {
  const maxPreviewLength = 120;
  const shouldTruncate = content.length > maxPreviewLength;

  return (
    <div className={`rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden border-l-2 ${colorClass}`}>
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface/50 dark:hover:bg-dark-hover/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[11px] font-semibold text-text-primary dark:text-white uppercase tracking-wide">
            {label}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
        )}
      </div>
      
      {isExpanded ? (
        <div className="px-3 py-2 text-xs text-text-primary dark:text-white max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed border-t border-surface-border dark:border-dark-border">
          {content || 'No data available.'}
        </div>
      ) : (
        <div 
          className="px-3 py-2 text-xs text-text-secondary dark:text-text-tertiary cursor-pointer border-t border-surface-border/50 dark:border-dark-border/50"
          onClick={onToggle}
        >
          {content ? (
            <>
              {content.substring(0, maxPreviewLength)}
              {shouldTruncate && <span className="text-brand-500 dark:text-brand-400 ml-1 font-medium">... Read more</span>}
            </>
          ) : (
            <span className="italic">Click to expand</span>
          )}
        </div>
      )}
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
    </div>
  );
}

<<<<<<< HEAD
// Citation card component
=======
// Citation Card Component
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
function CitationCard({
  source,
  onInsert,
}: {
  source: Source;
  onInsert: () => void;
}) {
<<<<<<< HEAD
  const authorShort =
    typeof source.authors === 'string'
      ? source.authors.split(',')[0]
      : (Array.isArray(source.authors) ? source.authors[0] : 'Unknown');

  return (
    <div className="p-3 rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-300 dark:hover:border-brand-600 transition-all">
      <div className="flex items-start gap-2">
        <BookOpen className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-text-primary dark:text-white">
            {authorShort} ({source.year})
          </p>
          <p className="text-[10px] text-text-secondary dark:text-text-secondary line-clamp-2 mt-0.5">
            {source.title}
          </p>
        </div>
      </div>
      <button
        onClick={onInsert}
        className="mt-2 w-full text-[10px] font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors flex items-center justify-center gap-1 py-1 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/20"
      >
        <Plus className="w-3 h-3" />
        Insert citation at cursor position
      </button>
=======
  const authorShort = source.authors?.split(',')[0]?.split(' ').pop() || source.authors?.split(' ')[0] || 'Unknown';
  const year = source.year || 'n.d.';

  return (
    <div className="p-3 rounded-lg border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-300 dark:hover:border-brand-600 transition-all group">
      <div className="flex items-start gap-2">
        <BookOpen className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-text-primary dark:text-white leading-tight">
            {authorShort} et al. ({year})
          </p>
          <p className="text-[10px] text-text-secondary dark:text-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
            {source.title}
          </p>
          {source.citation && (
            <p className="text-[9px] text-text-tertiary mt-1 italic line-clamp-1">
              {source.citation}
            </p>
          )}
        </div>
      </div>
      
      {onInsert && (
        <button
          onClick={onInsert}
          className="mt-2 w-full text-[10px] font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors flex items-center justify-center gap-1 py-1.5 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="w-3 h-3" />
          Insert citation at cursor position
        </button>
      )}
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
    </div>
  );
}