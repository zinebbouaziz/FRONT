'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Sigma, Check, Sparkles, Keyboard, Info } from 'lucide-react';
import { MATH_SYMBOLS, EQUATION_TEMPLATES } from '../constants';
import type { MathModal as MathModalType } from '../type';

interface MathModalProps {
  modal: MathModalType;
  onInsert: (latex: string, type: 'inline' | 'block', numbered?: boolean) => void;
  onClose: () => void;
}

// Toast notification component
function Toast({ message, visible, onHide }: { message: string; visible: boolean; onHide: () => void }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium shadow-2xl flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-400" />
        {message}
      </div>
    </div>
  );
}

// Keyboard shortcut badge
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      {children}
    </kbd>
  );
}

// Tooltip component
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap z-50 animate-in fade-in duration-200">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

export function MathModal({ modal, onInsert, onClose }: MathModalProps) {
  const [latex, setLatex] = useState(modal.latex || '');
  const [type, setType] = useState<'inline' | 'block'>(modal.type || 'inline');
  const [activeTab, setActiveTab] = useState<'symbols' | 'templates'>('symbols');
  const [activeSymbolCat, setActiveSymbolCat] = useState<keyof typeof MATH_SYMBOLS>('Greek Letters');
  const [numbered, setNumbered] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleInsert();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, latex, type, numbered]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // KaTeX preview with debouncing
  useEffect(() => {
    if (!previewRef.current) return;

    if (!latex.trim()) {
      previewRef.current.innerHTML = `
        <div class="flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
          <Sparkles class="w-8 h-8 opacity-50" />
          <span class="text-sm">Preview will appear here...</span>
        </div>
      `;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const katex = await import('katex');
        const html = katex.default.renderToString(latex, {
          throwOnError: false,
          displayMode: type === 'block',
          strict: false,
        });
        if (previewRef.current) {
          previewRef.current.innerHTML = html;
          setRenderError(null);
        }
      } catch (e: any) {
        setRenderError(e.message || 'Render error');
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [latex, type]);

  const insertSymbol = (latexCode: string, name: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = latex.slice(0, start) + latexCode + latex.slice(end);
    
    setLatex(newValue);
    
    // Restore focus and set cursor position after inserted symbol
    setTimeout(() => {
      textarea.focus();
      const newPos = start + latexCode.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);

    showNotification(`Inserted ${name}`);
  };
  

  const handleInsert = () => {
    if (!latex.trim()) return;
    onInsert(latex, type, numbered);
    showNotification(type === 'inline' ? 'Inline equation inserted' : 'Block equation inserted');
    onClose(); // ← CLOSE MODAL AFTER INSERT
  };

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

 

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="relative rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          style={{
            background: 'var(--surface, white)',
            borderColor: 'var(--border, #e2e8f0)',
            width: '100%',
            maxWidth: 800,
            maxHeight: '90vh',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="math-modal-title"
        >
          {/* HEADER - Copy button removed */}
          <header
            className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-900/50"
            style={{ borderColor: 'var(--border, #e2e8f0)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: 'var(--background-info, #dbeafe)' }}
              >
                <Sigma className="w-5 h-5" style={{ color: 'var(--text-info, #1d4ed8)' }} />
              </div>
              <div>
                <h3
                  id="math-modal-title"
                  className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>LaTeX editor</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1">
                    <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> to insert
                  </span>
                </p>
              </div>
            </div>

            {/* Close button only - Copy button removed */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* TYPE TOGGLE */}
          <div className="flex gap-2 p-4 border-b" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
            {(['inline', 'block'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: type === t ? 'var(--background-info, #dbeafe)' : 'transparent',
                  borderColor: type === t ? 'var(--border-info, #93c5fd)' : 'var(--border, #e2e8f0)',
                  color: type === t ? 'var(--text-info, #1d4ed8)' : 'var(--text-secondary, #64748b)',
                  fontWeight: type === t ? 600 : 400,
                }}
              >
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-current/10">
                  {t === 'inline' ? '$...$' : '$$...$$'}
                </span>
                <span>{t === 'inline' ? 'Inline' : 'Block'}</span>
              </button>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* LEFT: Editor */}
            <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    LaTeX Source
                    <Info className="w-3.5 h-3.5 opacity-50" />
                  </label>
                  <span className="text-xs text-slate-400">{latex.length} chars</span>
                </div>
                
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={latex}
                    onChange={(e) => setLatex(e.target.value)}
                    placeholder="e.g., E = mc^2  or  \frac{a}{b} + \sqrt{x}"
                    className="w-full font-mono text-sm rounded-xl border-2 px-4 py-3 resize-none outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/10"
                    style={{
                      background: 'var(--surface-secondary, #f8fafc)',
                      borderColor: renderError ? '#ef4444' : 'var(--border, #e2e8f0)',
                      color: 'var(--text-primary, #0f172a)',
                      minHeight: 120,
                    }}
                    rows={5}
                    spellCheck={false}
                  />
                  
                  {/* Quick actions toolbar */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <Tooltip content="Clear">
                      <button
                        onClick={() => setLatex('')}
                        className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                        disabled={!latex}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {renderError && (
                  <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                    <Info className="w-4 h-4" />
                    {renderError}
                  </div>
                )}

                {/* Numbered equation option */}
                {type === 'block' && (
                  <label className="flex items-center gap-3 px-1 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={numbered}
                        onChange={(e) => setNumbered(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all" />
                      <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      Add equation number (1), (2), etc.
                    </span>
                  </label>
                )}
              </div>

              {/* PREVIEW */}
              <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">
                  Live Preview
                </label>
                <div
                  className="rounded-xl border-2 border-dashed p-6 flex items-center justify-center min-h-[120px] transition-all duration-200"
                  style={{
                    background: 'var(--surface, white)',
                    borderColor: latex.trim() ? 'var(--border-info, #93c5fd)' : 'var(--border, #e2e8f0)',
                  }}
                >
                  <div ref={previewRef} className="w-full overflow-x-auto" />
                </div>
              </div>
            </div>

            {/* RIGHT: Symbols & Templates - History tab removed */}
            <div className="w-full lg:w-80 flex flex-col bg-slate-50/30 dark:bg-slate-900/20">
              {/* Tabs - Only Symbols and Templates */}
              <div className="flex border-b" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
                {(['symbols', 'templates'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 px-4 py-3 text-xs font-medium capitalize transition-all relative"
                    style={{
                      color: activeTab === tab ? 'var(--text-info, #1d4ed8)' : 'var(--text-secondary, #64748b)',
                    }}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {/* SYMBOLS */}
                {activeTab === 'symbols' && (
                  <div className="h-full flex">
                    {/* Categories */}
                    <div className="w-32 border-r overflow-y-auto" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
                      {(Object.keys(MATH_SYMBOLS) as Array<keyof typeof MATH_SYMBOLS>).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveSymbolCat(cat)}
                          className="w-full text-left px-3 py-2.5 text-xs transition-all border-l-2"
                          style={{
                            background: activeSymbolCat === cat ? 'var(--background-info, #dbeafe)' : 'transparent',
                            color: activeSymbolCat === cat ? 'var(--text-info, #1d4ed8)' : 'var(--text-secondary, #64748b)',
                            borderLeftColor: activeSymbolCat === cat ? 'var(--border-info, #93c5fd)' : 'transparent',
                            fontWeight: activeSymbolCat === cat ? 600 : 400,
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Symbol Grid */}
                    <div className="flex-1 overflow-y-auto p-3">
                      <div className="grid grid-cols-6 gap-1.5">
                        {MATH_SYMBOLS[activeSymbolCat].map(({ sym, latex: l, name }) => (
                          <Tooltip key={name} content={`${name}: ${l}`}>
                            <button
                              onClick={() => insertSymbol(l, name)}
                              className="aspect-square rounded-lg border text-lg font-mono flex items-center justify-center transition-all duration-150 hover:scale-110 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 active:scale-95"
                              style={{
                                background: 'var(--surface, white)',
                                borderColor: 'var(--border, #e2e8f0)',
                                color: 'var(--text-primary, #0f172a)',
                              }}
                            >
                              {sym}
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATES */}
                {activeTab === 'templates' && (
                  <div className="h-full overflow-y-auto p-3 space-y-2">
                    {EQUATION_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.label}
                        onClick={() => {
                          setLatex(tmpl.latex);
                          setType(tmpl.type);
                          showNotification(`Loaded ${tmpl.label}`);
                        }}
                        className="w-full text-left p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 group"
                        style={{
                          background: 'var(--surface, white)',
                          borderColor: 'var(--border, #e2e8f0)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {tmpl.label}
                            </p>
                            <code className="text-[10px] font-mono text-slate-400 block mt-1 truncate">
                              {tmpl.latex.slice(0, 40)}
                              {tmpl.latex.length > 40 ? '...' : ''}
                            </code>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: tmpl.type === 'block' ? 'var(--background-info, #dbeafe)' : 'var(--surface-secondary, #f1f5f9)',
                              color: tmpl.type === 'block' ? 'var(--text-info, #1d4ed8)' : 'var(--text-secondary, #64748b)',
                            }}
                          >
                            {tmpl.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer
            className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50 dark:bg-slate-900/30"
            style={{ borderColor: 'var(--border, #e2e8f0)' }}
          >
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5" />
                <Kbd>Esc</Kbd> to close
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> to insert
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ color: 'var(--text-secondary, #64748b)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleInsert}
                disabled={!latex.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                style={{
                  background: 'var(--background-info, #3b82f6)',
                  color: 'white',
                }}
              >
                <Check className="w-4 h-4" />
               
              </button>
            </div>
          </footer>
        </div>
      </div>

      <Toast 
        message={toastMessage} 
        visible={showToast} 
        onHide={() => setShowToast(false)} 
      />
    </>
  );
}