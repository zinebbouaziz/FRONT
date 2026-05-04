// components/workspace/EditorArea/EditorHeader.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Layers, Edit3, Check } from 'lucide-react';

interface EditorHeaderProps {
  sectionTitle: string;
  writingStyle: string;
  projectTitle: string;
  journal?: string;
  onSectionTitleChange?: (title: string) => void;
}

export function EditorHeader({
  sectionTitle,
  writingStyle,
  projectTitle,
  journal = 'IEEE Transactions on Medical Imaging',
  onSectionTitleChange,
}: EditorHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(sectionTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(sectionTitle); }, [sectionTitle]);
  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [editing]);

  const commit = () => {
    const v = draft.trim() || sectionTitle;
    setDraft(v);
    setEditing(false);
    onSectionTitleChange?.(v);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') { setDraft(sectionTitle); setEditing(false); }
  };

  return (
    <div
      className="mb-8 pb-6 border-b"
      style={{ borderColor: 'var(--border, #e4e7f0)' }}
    >
      {/* Section label row */}
      <div
        className="flex items-center gap-2 mb-3 text-xs font-medium uppercase tracking-wide"
        style={{ color: 'var(--brand, #6550e8)' }}
      >
        <Layers className="w-3.5 h-3.5 shrink-0" />

        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onKey}
              className="flex-1 px-2 py-0.5 rounded-md border-2 text-xs font-medium outline-none normal-case"
              style={{
                borderColor: 'var(--border-info, #6550e8)',
                background: 'var(--background-info, #ede9ff)',
                color: 'var(--text-info, #6550e8)',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={commit}
              className="p-1 rounded-md"
              style={{ background: 'var(--background-info, #ede9ff)', color: 'var(--text-info, #6550e8)' }}
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-all group/btn"
            title="Click to rename section"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in srgb, var(--brand, #6550e8) 10%, transparent)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>{sectionTitle}</span>
            <Edit3 className="w-3 h-3 opacity-0 group-hover/btn:opacity-60 transition-opacity" />
          </button>
        )}

        {writingStyle && (
          <>
            <span style={{ color: 'var(--text-tertiary, #9ba3c4)' }}>·</span>
            <span className="normal-case capitalize" style={{ color: 'var(--text-tertiary, #9ba3c4)' }}>
              {writingStyle}
            </span>
          </>
        )}
      </div>

      {/* Project title — dark/light theme aware */}
      <h1
        className="text-[26px] font-bold leading-tight tracking-tight"
        style={{ color: 'var(--text-primary, #1a1d2e)' }}
      >
        {projectTitle}
      </h1>

      {/* Journal / date — dark/light theme aware */}
      <p
        className="text-sm mt-2"
        style={{ color: 'var(--text-tertiary, #9ba3c4)' }}
      >
        {journal} · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
      </p>
    </div>
  );
}