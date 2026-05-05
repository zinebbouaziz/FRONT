'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Sigma, Check, Keyboard, Sparkles } from 'lucide-react';
import { getCSSVariables } from '@/lib/cssVars';

interface FunctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

const FUNCTIONS = [
  { label: 'Sine', latex: '\\sin(x)' },
  { label: 'Cosine', latex: '\\cos(x)' },
  { label: 'Tangent', latex: '\\tan(x)' },
  { label: 'Log', latex: '\\log(x)' },
  { label: 'Natural Log', latex: '\\ln(x)' },
  { label: 'Square Root', latex: '\\sqrt{x}' },
  { label: 'Fraction', latex: '\\frac{a}{b}' },
  { label: 'Limit', latex: '\\lim_{x \\to 0}' },
  { label: 'Sum', latex: '\\sum_{i=1}^{n}' },
  { label: 'Integral', latex: '\\int_a^b' },
  { label: 'Derivative', latex: '\\frac{d}{dx}' },
];

export function FunctionModal({ isOpen, onClose, onInsert }: FunctionModalProps) {
  const vars = getCSSVariables();
  const [latex, setLatex] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Escape + shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleInsert();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, latex]);

  useEffect(() => {
    if (isOpen) textareaRef.current?.focus();
    else {
      setLatex('');
      setRenderError(null);
    }
  }, [isOpen]);

  // KaTeX preview (theme safe)
  useEffect(() => {
    if (!previewRef.current) return;

    if (!latex.trim()) {
      previewRef.current.innerHTML = `
        <div class="flex flex-col items-center gap-2 text-slate-400">
          <Sparkles class="w-6 h-6 opacity-50" />
          <span class="text-sm">Live preview</span>
        </div>
      `;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const katex = await import('katex');
        const html = katex.default.renderToString(latex, {
          throwOnError: false,
          displayMode: true,
        });

        previewRef.current!.innerHTML = html;
        setRenderError(null);
      } catch (e: any) {
        setRenderError(e.message);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [latex]);

  const insertFunction = (code: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setLatex((p) => p + code);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue = latex.slice(0, start) + code + latex.slice(end);
    setLatex(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + code.length, start + code.length);
    }, 0);
  };

  const handleInsert = () => {
    if (!latex.trim()) return;
    onInsert(latex);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--surface, white)',
          borderColor: 'var(--border, #e2e8f0)',
          maxHeight: '90vh',
        }}
      >
        {/* HEADER */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: 'var(--border, #e2e8f0)',
            background: 'linear-gradient(to right, rgba(59,130,246,0.08), rgba(99,102,241,0.08))',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--background-info, #dbeafe)' }}
            >
              <Sigma className="w-5 h-5" style={{ color: 'var(--text-info, #1d4ed8)' }} />
            </div>

            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary, #0f172a)' }}
              >
                Function Builder
              </h3>

              <p
                className="text-xs flex items-center gap-2"
                style={{ color: 'var(--text-secondary, #64748b)' }}
              >
                <Keyboard className="w-3.5 h-3.5" />
                Ctrl + Enter to insert
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-secondary, #64748b)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* BODY */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* LEFT */}
          <div className="flex-1 flex flex-col border-r" style={{ borderColor: 'var(--border)' }}>
            <div className="p-4 space-y-3">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                LaTeX Input
              </label>

              <textarea
                ref={textareaRef}
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                placeholder="e.g. \\sin(x) + \\frac{a}{b}"
                className="w-full font-mono text-sm rounded-xl border-2 px-4 py-3 outline-none resize-none"
                style={{
                  background: 'var(--surface-secondary, #f8fafc)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  minHeight: 120,
                }}
              />

              {renderError && (
                <div
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                  }}
                >
                  {renderError}
                </div>
              )}
            </div>

            {/* PREVIEW */}
            <div
              className="flex-1 p-4 border-t"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--surface-secondary, #f9fafb)',
              }}
            >
              <label
                className="text-xs font-semibold uppercase mb-2 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Preview
              </label>

              <div
                className="rounded-xl border-2 border-dashed p-6 flex items-center justify-center min-h-[120px]"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div ref={previewRef} className="w-full overflow-x-auto" />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="w-full lg:w-72 p-3 space-y-2 overflow-y-auto"
            style={{ background: 'var(--surface-secondary, #f8fafc)' }}
          >
            {FUNCTIONS.map((fn) => (
              <button
                key={fn.label}
                onClick={() => insertFunction(fn.latex)}
                className="w-full text-left p-3 rounded-xl border transition hover:shadow-md hover:scale-[1.02]"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {fn.label}
                </div>
                <code
                  className="text-xs font-mono opacity-70"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {fn.latex}
                </code>
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-secondary, #f8fafc)',
          }}
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Press Ctrl + Enter to insert
          </span>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>

            <button
              onClick={handleInsert}
              disabled={!latex.trim()}
              className="px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
              style={{
                background: 'var(--background-info, #3b82f6)',
                color: 'white',
              }}
            >
              <Check className="w-4 h-4" />
              Insert
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}