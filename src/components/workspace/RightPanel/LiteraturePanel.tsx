'use client';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Plus, Loader2 } from 'lucide-react';

interface Source {
  id: string;
  title: string;
  authors: string | string[];
  year: number;
  citations: number;
  abstract?: string;
  url?: string;
  pdf_url?: string;
  relevance_score?: number;
}

interface LiteratureReviewPanelProps {
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
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function LiteratureReviewPanel({
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
    </div>
  );
}

// Citation card component
function CitationCard({
  source,
  onInsert,
}: {
  source: Source;
  onInsert: () => void;
}) {
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
    </div>
  );
}