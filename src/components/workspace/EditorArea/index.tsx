// components/workspace/EditorArea/index.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';

import { Toolbar } from './Toolbar';
import { EditorHeader } from './EditorHeader';

// Hooks
import { useSlashCommands } from './hooks/useSlashCommands';
import { useComments } from './hooks/useComments';
import { useTodos } from './hooks/useTodos';
import { useTableOperations } from './hooks/useTableOperations';

// UI Components
import { MathModal } from './ui/MathModal';
import { FunctionModal } from './ui/FunctionModal';
import { LinkPopup } from './ui/LinkPopup';

// Utilities & Constants
import { getCSSVariables } from '@/lib/cssVars';
import { HIGHLIGHT_COLORS, MOCK_CROSS_REFS } from './constants';

// Types
import type {
  EditorAreaProps,
  PopupState,
  LinkPopup as LinkPopupType,
  MathModal as MathModalType,
} from './type';

// Icons
import {
  Check, Type, BookOpen, Clock, Hash, ChevronUp, X,
  MessageSquare, Sigma, Trash2, CheckCircle2, Plus,
  Undo, Redo, ChevronRight, Smile,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   Special Characters data
───────────────────────────────────────────────────────────────── */
const SPECIAL_CHARS: { label: string; chars: { ch: string; name: string }[] }[] = [
  {
    label: 'Typography',
    chars: [
      { ch: '—', name: 'Em dash' }, { ch: '–', name: 'En dash' },
      { ch: '…', name: 'Ellipsis' }, { ch: '\u201C', name: 'Left double quote' },
      { ch: '\u201D', name: 'Right double quote' }, { ch: '\u2018', name: 'Left single quote' },
      { ch: '\u2019', name: 'Right single quote' }, { ch: '«', name: 'Left guillemet' },
      { ch: '»', name: 'Right guillemet' }, { ch: '•', name: 'Bullet' },
      { ch: '·', name: 'Middle dot' }, { ch: '†', name: 'Dagger' },
      { ch: '‡', name: 'Double dagger' }, { ch: '§', name: 'Section sign' },
      { ch: '¶', name: 'Pilcrow' },
    ],
  },
  {
    label: 'Math',
    chars: [
      { ch: '±', name: 'Plus-minus' }, { ch: '×', name: 'Multiplication' },
      { ch: '÷', name: 'Division' }, { ch: '≠', name: 'Not equal' },
      { ch: '≈', name: 'Approximately' }, { ch: '≤', name: 'Less or equal' },
      { ch: '≥', name: 'Greater or equal' }, { ch: '∞', name: 'Infinity' },
      { ch: '√', name: 'Square root' }, { ch: '∑', name: 'Sum' },
      { ch: '∏', name: 'Product' }, { ch: '∫', name: 'Integral' },
      { ch: 'π', name: 'Pi' }, { ch: 'Δ', name: 'Delta' }, { ch: 'λ', name: 'Lambda' },
    ],
  },
  {
    label: 'Arrows',
    chars: [
      { ch: '→', name: 'Right arrow' }, { ch: '←', name: 'Left arrow' },
      { ch: '↑', name: 'Up arrow' }, { ch: '↓', name: 'Down arrow' },
      { ch: '↔', name: 'Left-right arrow' }, { ch: '⇒', name: 'Right double arrow' },
      { ch: '⇐', name: 'Left double arrow' }, { ch: '⇔', name: 'Double arrow' },
      { ch: '↗', name: 'NE arrow' }, { ch: '↘', name: 'SE arrow' },
      { ch: '↙', name: 'SW arrow' }, { ch: '↖', name: 'NW arrow' },
      { ch: '⟶', name: 'Long right arrow' }, { ch: '⟵', name: 'Long left arrow' },
      { ch: '↕', name: 'Up-down arrow' },
    ],
  },
  {
    label: 'Symbols',
    chars: [
      { ch: '©', name: 'Copyright' }, { ch: '®', name: 'Registered' },
      { ch: '™', name: 'Trademark' }, { ch: '°', name: 'Degree' },
      { ch: '′', name: 'Prime' }, { ch: '″', name: 'Double prime' },
      { ch: '€', name: 'Euro' }, { ch: '£', name: 'Pound' },
      { ch: '¥', name: 'Yen' }, { ch: '¢', name: 'Cent' },
      { ch: '½', name: 'One half' }, { ch: '¼', name: 'One quarter' },
      { ch: '¾', name: 'Three quarters' }, { ch: 'µ', name: 'Micro' }, { ch: 'Ω', name: 'Omega' },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   useFloatingPos
   Computes { top, left } so a popup of `popupWidth` px appears
   directly below the trigger button, clamped inside the viewport.
───────────────────────────────────────────────────────────────── */
function useFloatingPos(
  triggerRef: React.RefObject<HTMLButtonElement>,
  isOpen: boolean,
  popupWidth: number,
  gap = 6,
) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) { setPos(null); return; }

    const compute = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const vw = window.innerWidth;

      // Align left edge of popup with left edge of button
      let left = rect.left;

      // Clamp so popup never overflows viewport
      if (left + popupWidth > vw - 12) left = vw - popupWidth - 12;
      if (left < 12) left = 12;

      setPos({ top: rect.bottom + gap, left });
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [isOpen, triggerRef, popupWidth, gap]);

  return pos;
}

/* ─────────────────────────────────────────────────────────────────
   FloatingModernPanel
   Renders as a fixed overlay (position: fixed) so it always floats
   above the editor content regardless of any parent overflow/z-index.
   Styled to match SpecialCharsPanel exactly.
───────────────────────────────────────────────────────────────── */
function FloatingModernPanel({
  onClose,
  title,
  icon,
  triggerRef,
  width,
  children,
}: {
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  triggerRef: React.RefObject<HTMLButtonElement>;
  width: number;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pos = useFloatingPos(triggerRef, true, width);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) onClose();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 80);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler); };
  }, [onClose, triggerRef]);

  if (!pos) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-[300] rounded-2xl border shadow-2xl overflow-hidden"
      style={{
        top: pos.top,
        left: pos.left,
        width,
        /* entry animation via Tailwind (requires tailwindcss-animate plugin) */
        animation: 'fadeInDown 0.15s ease',
        background: 'var(--background-primary, #fff)',
        borderColor: 'var(--border, #e4e7f0)',
        boxShadow: '0 20px 48px -8px rgba(0,0,0,0.20), 0 0 0 1px var(--border, #e4e7f0)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header - styled like SpecialCharsPanel */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--background-secondary)' }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: 'var(--text-info)' }}>{icon}</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--background-tertiary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable content - styled like SpecialCharsPanel */}
      <div
        className="p-4 overflow-y-auto"
        style={{
          maxHeight: 'min(60vh, 420px)',
          background: 'var(--background-primary)',
          color: 'var(--text-primary)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SpecialCharsPanel — same anchor strategy
───────────────────────────────────────────────────────────────── */
function SpecialCharsPanel({
  onInsert,
  onClose,
  triggerRef,
}: {
  onInsert: (ch: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}) {
  const PANEL_W = 340;
  const panelRef = useRef<HTMLDivElement>(null);
  const pos = useFloatingPos(triggerRef, true, PANEL_W);
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) onClose();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 80);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler); };
  }, [onClose, triggerRef]);

  if (!pos) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-[300] rounded-2xl border shadow-2xl overflow-hidden"
      style={{
        top: pos.top,
        left: pos.left,
        width: PANEL_W,
        animation: 'fadeInDown 0.15s ease',
        background: 'var(--background-primary, #fff)',
        borderColor: 'var(--border, #e4e7f0)',
        boxShadow: '0 20px 48px -8px rgba(0,0,0,0.20), 0 0 0 1px var(--border, #e4e7f0)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--background-secondary)' }}
      >
        <div className="flex items-center gap-2.5">
          <Smile className="w-4 h-4" style={{ color: 'var(--text-info)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Special Characters
          </span>
          {hoveredName && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--background-info)', color: 'var(--text-info)' }}
            >
              {hoveredName}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--background-tertiary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {SPECIAL_CHARS.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(i)}
            className="flex-1 py-2 text-[10px] font-medium transition-colors relative"
            style={{ color: activeTab === i ? 'var(--text-info)' : 'var(--text-secondary)' }}
          >
            {cat.label}
            {activeTab === i && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background: 'var(--text-info)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Character grid */}
      <div className="p-3">
        <div className="grid grid-cols-8 gap-1">
          {SPECIAL_CHARS[activeTab].chars.map(({ ch, name }) => (
            <button
              key={name}
              title={name}
              onClick={() => { onInsert(ch); onClose(); }}
              onMouseEnter={() => setHoveredName(name)}
              onMouseLeave={() => setHoveredName(null)}
              className="w-9 h-9 rounded-lg border text-base font-mono flex items-center justify-center
                         transition-all hover:scale-110 hover:shadow-md active:scale-95"
              style={{
                background: 'var(--background-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px] text-center" style={{ color: 'var(--text-tertiary)' }}>
          Click to insert at cursor position
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Content sub-components (unchanged)
───────────────────────────────────────────────────────────────── */
function CommentsContent({ editor, comments, newCommentText, setNewCommentText, addComment, resolveComment, deleteComment, vars }: any) {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl border" style={{ background: vars.bgSecondary, borderColor: vars.borderSecondary }}>
        <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a new comment..." rows={2}
          className="w-full bg-transparent text-xs resize-none outline-none mb-2"
          style={{ color: vars.textPrimary }} />
        <div className="flex justify-end gap-2">
          <button onClick={() => setNewCommentText('')} className="px-2 py-1 rounded text-[10px]" style={{ color: vars.textTertiary }}>Clear</button>
          <button
            onClick={() => { if (editor.state.selection.from !== editor.state.selection.to) addComment(); else alert('Please select text first'); }}
            disabled={!newCommentText.trim()}
            className="px-3 py-1 rounded-md text-[10px] font-medium disabled:opacity-50"
            style={{ background: vars.bgInfo, color: vars.textInfo }}>Add</button>
        </div>
      </div>
      {comments.length === 0 ? (
        <div className="text-center py-6" style={{ color: vars.textTertiary }}>
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No comments yet</p>
        </div>
      ) : comments.map((c: any) => (
        <div key={c.id} className="p-3 rounded-xl border text-xs"
          style={{ background: c.resolved ? vars.bgTertiary : vars.bgPrimary, borderColor: vars.borderSecondary, opacity: c.resolved ? 0.6 : 1 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium" style={{ color: vars.textPrimary }}>{c.author}</span>
            <div className="flex gap-1">
              {!c.resolved && <button onClick={() => resolveComment(c.id)} className="p-1 rounded hover:bg-green-100" style={{ color: vars.textSuccess }}><Check className="w-3.5 h-3.5" /></button>}
              <button onClick={() => deleteComment(c.id)} className="p-1 rounded hover:bg-red-100" style={{ color: vars.textDanger }}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <p style={{ color: vars.textPrimary }}>{c.text}</p>
        </div>
      ))}
    </div>
  );
}

function TodosContent({ todos, newTodoText, setNewTodoText, addTodo, toggleTodo, deleteTodo, vars }: any) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a TODO..." className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none"
          style={{ background: vars.bgPrimary, borderColor: vars.borderSecondary, color: vars.textPrimary }}
          onKeyDown={(e) => { if (e.key === 'Enter' && newTodoText.trim()) addTodo(); }} />
        <button onClick={addTodo}
          disabled={!newTodoText.trim()} className="px-3 py-2 rounded-lg disabled:opacity-50"
          style={{ background: vars.bgWarning, color: vars.textWarning }}><Plus className="w-4 h-4" /></button>
      </div>
      {todos.length === 0 ? (
        <div className="text-center py-6" style={{ color: vars.textTertiary }}>
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No TODOs found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {todos.map((t: any) => (
            <div key={t.id} className="flex items-start gap-2 p-2.5 rounded-xl border group"
              style={{ background: t.done ? 'rgba(187,247,208,0.2)' : 'rgba(254,240,138,0.15)', borderColor: t.done ? 'rgba(34,197,94,0.35)' : 'rgba(254,240,138,0.5)' }}>
              <button onClick={() => toggleTodo(t.id)} className="mt-0.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: t.done ? '#16a34a' : '#a16207' }} />
              </button>
              <p className="text-xs flex-1" style={{ color: vars.textPrimary, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.75 : 1 }}>{t.text}</p>
              <button onClick={() => deleteTodo(t.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100" style={{ color: vars.textDanger }}>
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Sep({ vars }: { vars: any }) {
  return <div className="w-px h-4 mx-1" style={{ background: vars.borderTertiary }} />;
}

function StatusChip({ bg, color, children }: { bg: string; color?: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: bg, color: color || 'inherit' }}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main EditorArea component
───────────────────────────────────────────────────────────────── */
export function EditorArea(props: EditorAreaProps) {
  const {
    editor, activeSection, writingStyle, projectTitle,
    saved, onSave, showColorPicker, setShowColorPicker,
    textColor, setTextColor, wordCount, charCount, onInlineSuggestion,
  } = props;

  const vars = getCSSVariables();
  const scrollRef = useRef<HTMLDivElement>(null);
  const slashRef = useRef<HTMLDivElement>(null);

  // Button refs — used by useFloatingPos to anchor popups
  const commentsBtnRef = useRef<HTMLButtonElement>(null);
  const todosBtnRef = useRef<HTMLButtonElement>(null);
  const crossRefBtnRef = useRef<HTMLButtonElement>(null);
  const specialCharsBtnRef = useRef<HTMLButtonElement>(null);

  // UI State
  const [readingMode, setReadingMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [popups, setPopups] = useState<PopupState>({ comments: false, todos: false, crossRef: false });
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState('#0f172a');
  const [currentHighlightColor, setCurrentHighlightColor] = useState('#fef08a');
  const [currentFontFamily, setCurrentFontFamily] = useState('Inter, sans-serif');
  const [currentFontSize, setCurrentFontSize] = useState('16px');
  const [linkPopup, setLinkPopup] = useState<LinkPopupType>({ show: false, mode: 'edit', url: '', inputUrl: '', x: 0, y: 0 });
  const [mathModal, setMathModal] = useState<MathModalType | null>(null);
  const [showFunctionsModal, setShowFunctionsModal] = useState(false);
  const [equationCounter, setEquationCounter] = useState(1);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  // Custom hooks
  const { slashMenu, slashIdx, filteredSlash, execSlashCommand } = useSlashCommands(editor, scrollRef);
  const { comments, unresolvedComments, newCommentText, setNewCommentText, addComment, resolveComment, deleteComment } = useComments(editor, activeSection?.id ?? null);
  const { todos, newTodoText, setNewTodoText, addTodo, toggleTodo, deleteTodo } = useTodos(editor, activeSection?.id ?? null);
  const tableOps = useTableOperations(editor);

  // Sync editor styles
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const attrs = editor.getAttributes('textStyle');
      setCurrentFontFamily(attrs.fontFamily || 'Inter, sans-serif');
      setCurrentFontSize(attrs.fontSize || '16px');
      if (attrs.color) setCurrentTextColor(attrs.color);
      const h = editor.getAttributes('highlight');
      if (h?.color) setCurrentHighlightColor(h.color);
    };
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => { editor.off('selectionUpdate', update); editor.off('transaction', update); };
  }, [editor]);

  const handleFontFamilyChange = useCallback((family: string) => {
    if (!editor) return;
    editor.chain().focus().setFontFamily(family).run();
    setCurrentFontFamily(family);
  }, [editor]);

  const handleFontSizeChange = useCallback((size: string) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(size).run();
    setCurrentFontSize(size);
  }, [editor]);

  const handleTextColorChange = useCallback((color: string) => {
    setCurrentTextColor(color || '#0f172a');
  }, []);

  const handleHighlightChange = useCallback((color: string) => {
    const finalColor = color || '#fef08a';
    setCurrentHighlightColor(finalColor);
    if (!editor) return;
    editor.chain().focus().setMark('highlight', { color: finalColor }).run();
  }, [editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    let rect: DOMRect;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && from !== to) {
      rect = selection.getRangeAt(0).getBoundingClientRect();
    } else {
      rect = (editor.view.dom as HTMLElement).getBoundingClientRect();
    }
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const scrollRect = scrollEl.getBoundingClientRect();
    const baseX = rect.left - scrollRect.left + rect.width / 2 - 190;
    const baseY = rect.bottom - scrollRect.top + scrollEl.scrollTop + 8;
    if (editor.isActive('link')) {
      const attrs = editor.getAttributes('link');
      setLinkPopup({ show: true, mode: 'view', url: attrs.href || '', inputUrl: attrs.href || '', x: baseX, y: baseY });
    } else {
      setLinkPopup({ show: true, mode: 'edit', url: '', inputUrl: '', x: baseX, y: baseY });
    }
  }, [editor, scrollRef]);

  const handleSetLink = useCallback((url: string) => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
    setLinkPopup((p) => ({ ...p, show: false }));
  }, [editor]);

  const handleUnlink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkPopup((p) => ({ ...p, show: false }));
  }, [editor]);

  const handleInsertMath = useCallback((latex: string, type: 'inline' | 'block', numbered?: boolean) => {
    if (!editor) return;
    if (type === 'inline') {
      editor.chain().focus().insertContent(`$${latex}$ `).run();
    } else {
      const content = numbered
        ? `$$
${latex} \quad \text{(${equationCounter})}
$$`
        : `$$
${latex}
$$`;
      if (numbered) setEquationCounter((n) => n + 1);
      editor.chain().focus().insertContent(`
${content}
`).run();
    }
    setMathModal(null);
    setTimeout(async () => {
      try {
        const mod = await import('katex/contrib/auto-render');
        const render = (mod as any).default ?? mod;
        render(editor.view.dom, {
          delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
          throwOnError: false,
        });
      } catch {}
    }, 100);
  }, [editor, equationCounter]);

  const handleInsertFunction = useCallback((latex: string) => {
    editor?.chain().focus().insertContent(`$${latex}$ `).run();
  }, [editor]);

  const handleInsertSpecialChar = useCallback((ch: string) => {
    editor?.chain().focus().insertContent(ch).run();
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const t = setTimeout(async () => {
      try {
        const mod = await import('katex/contrib/auto-render');
        const render = (mod as any).default ?? mod;
        render(editor.view.dom, {
          delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
          throwOnError: false,
        });
      } catch {}
    }, 80);
    return () => clearTimeout(t);
  }, [editor?.state]);

  const handleScroll = () => setShowScrollTop((scrollRef.current?.scrollTop ?? 0) > 400);
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Close all sub-toolbar popups at once
  const closeAllSubPopups = useCallback(() => {
    setPopups({ comments: false, todos: false, crossRef: false });
    setShowSpecialChars(false);
  }, []);

  if (!editor) return null;

  return (
    <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden" style={{ background: vars.bgTertiary }}>

      {/* ── Modals (full-screen overlays) ── */}
      {mathModal?.show && (
        <MathModal modal={mathModal} onInsert={handleInsertMath} onClose={() => setMathModal(null)} />
      )}
      <FunctionModal isOpen={showFunctionsModal} onClose={() => setShowFunctionsModal(false)} onInsert={handleInsertFunction} />

      {/* ─────────────────────────────────────────────────────────────
          FLOATING PANELS — rendered here (outside any scrollable
          container) so position:fixed works without clipping.
      ───────────────────────────────────────────────────────────── */}
      {showSpecialChars && (
        <SpecialCharsPanel
          onInsert={handleInsertSpecialChar}
          onClose={() => setShowSpecialChars(false)}
          triggerRef={specialCharsBtnRef}
        />
      )}

      {popups.comments && (
        <FloatingModernPanel
          onClose={() => setPopups((p) => ({ ...p, comments: false }))}
          title="Comments"
          icon={<MessageSquare className="w-4 h-4" />}
          triggerRef={commentsBtnRef}
          width={340}
        >
          <CommentsContent
            editor={editor} comments={comments}
            newCommentText={newCommentText} setNewCommentText={setNewCommentText}
            addComment={addComment} resolveComment={resolveComment}
            deleteComment={deleteComment} vars={vars}
          />
        </FloatingModernPanel>
      )}

      {popups.todos && (
        <FloatingModernPanel
          onClose={() => setPopups((p) => ({ ...p, todos: false }))}
          title="TODOs"
          icon={<CheckCircle2 className="w-4 h-4" />}
          triggerRef={todosBtnRef}
          width={320}
        >
          <TodosContent
            todos={todos}
            newTodoText={newTodoText} setNewTodoText={setNewTodoText}
            addTodo={addTodo}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            vars={vars}
          />
        </FloatingModernPanel>
      )}

      {popups.crossRef && (
        <FloatingModernPanel
          onClose={() => setPopups((p) => ({ ...p, crossRef: false }))}
          title="Cross References"
          icon={<ChevronRight className="w-4 h-4" />}
          triggerRef={crossRefBtnRef}
          width={280}
        >
          <div className="space-y-1">
            {MOCK_CROSS_REFS.map((ref) => (
              <button
                key={ref.id}
                onClick={() => {
                  editor.chain().focus().insertContent(`<span class="cross-ref-chip">${ref.label}</span> `).run();
                  setPopups((p) => ({ ...p, crossRef: false }));
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all"
                style={{ color: vars.textSecondary }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = vars.bgSecondary)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider shrink-0"
                  style={{ background: vars.bgInfo, color: vars.textInfo, minWidth: 60, textAlign: 'center' }}>
                  {ref.type}
                </span>
                <span style={{ color: vars.textPrimary }}>{ref.label}</span>
              </button>
            ))}
          </div>
        </FloatingModernPanel>
      )}

      {/* ── Main Toolbar ── */}
      {!readingMode && (
        <Toolbar
          editor={editor}
          saved={saved}
          onSave={onSave}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          textColor={textColor}
          setTextColor={setTextColor}
          currentTextColor={currentTextColor}
          onTextColorChange={handleTextColorChange}
          currentHighlightColor={currentHighlightColor}
          onHighlightChange={handleHighlightChange}
          showTextColorPicker={showTextColorPicker}
          setShowTextColorPicker={setShowTextColorPicker}
          showHighlightPicker={showHighlightPicker}
          setShowHighlightPicker={setShowHighlightPicker}
          currentFontFamily={currentFontFamily}
          onFontFamilyChange={handleFontFamilyChange}
          currentFontSize={currentFontSize}
          onFontSizeChange={handleFontSizeChange}
          onLink={handleLink}
          onMathOpen={() => setMathModal({ show: true, type: 'inline', latex: '', preview: '' })}
          onFunctionsOpen={() => setShowFunctionsModal(true)}
          onAddComment={() => setActiveCommentId('new')}
          onAddTodo={() => editor.chain().focus().insertContent('<mark data-color="#fef08a">[TODO: ]</mark> ').run()}
        />
      )}

      {/* ── Sub-toolbar ── */}
      <div
        className="shrink-0 flex items-center gap-0.5 px-3 py-1.5 border-b"
        style={{
          background: 'var(--background-primary, white)',
          backdropFilter: 'blur(8px)',
          borderColor: vars.borderTertiary,
        }}
      >
        {/* Reading mode */}
        <button
          onClick={() => setReadingMode((r) => !r)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
          style={{ background: readingMode ? vars.bgInfo : 'transparent', color: readingMode ? vars.textInfo : vars.textSecondary }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          {readingMode ? 'Exit' : 'Reading'}
        </button>

        <Sep vars={vars} />

        {/* Comments */}
        <button
          ref={commentsBtnRef}
          onClick={() => { closeAllSubPopups(); setPopups((p) => ({ ...p, comments: !p.comments })); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
          style={{ background: popups.comments ? vars.bgInfo : 'transparent', color: popups.comments ? vars.textInfo : vars.textSecondary }}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Comments
          {unresolvedComments.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: vars.bgDanger, color: vars.textDanger }}>
              {unresolvedComments.length}
            </span>
          )}
        </button>

        {/* TODOs */}
        <button
          ref={todosBtnRef}
          onClick={() => { closeAllSubPopups(); setPopups((p) => ({ ...p, todos: !p.todos })); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
          style={{ background: popups.todos ? vars.bgWarning : 'transparent', color: popups.todos ? vars.textWarning : vars.textSecondary }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          TODOs
          {todos.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: vars.bgWarning, color: vars.textWarning }}>
              {todos.length}
            </span>
          )}
        </button>

        <Sep vars={vars} />

        <button
          onClick={() => onInlineSuggestion?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--brand, #6550e8)', color: 'white' }}
          title="Generate inline AI suggestion from selected text"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Inline AI
        </button>

        <Sep vars={vars} />

        {/* Special Characters */}
        <button
          ref={specialCharsBtnRef}
          onClick={() => { const next = !showSpecialChars; closeAllSubPopups(); setShowSpecialChars(next); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
          style={{ background: showSpecialChars ? vars.bgSecondary : 'transparent', color: showSpecialChars ? vars.textPrimary : vars.textSecondary }}
        >
          <Smile className="w-3.5 h-3.5" />
          Special
        </button>

        <Sep vars={vars} />

        {/* Cross-reference */}
        <button
          ref={crossRefBtnRef}
          onClick={() => { closeAllSubPopups(); setPopups((p) => ({ ...p, crossRef: !p.crossRef })); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
          style={{ background: popups.crossRef ? vars.bgSecondary : 'transparent', color: popups.crossRef ? vars.textPrimary : vars.textSecondary }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
          Cross-ref
        </button>

        <div className="flex-1" />

        {/* Undo / Redo */}
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg disabled:opacity-30 transition-colors" style={{ color: vars.textSecondary }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = vars.bgSecondary)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')} title="Undo">
          <Undo className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg disabled:opacity-30 transition-colors" style={{ color: vars.textSecondary }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = vars.bgSecondary)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')} title="Redo">
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* ── Scrollable editor ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
      >
        {/* Link Popup - styled to match SpecialCharsPanel */}
        {linkPopup.show && (
          <LinkPopup
            popup={linkPopup}
            onClose={() => setLinkPopup((p) => ({ ...p, show: false }))}
            onSetLink={handleSetLink}
            onUnlink={handleUnlink}
            onVisit={() => window.open(linkPopup.url, '_blank', 'noopener,noreferrer')}
            onCopy={() => {}}
          />
        )}

        {/* Slash menu - styled to match SpecialCharsPanel */}
        {slashMenu.show && filteredSlash.length > 0 && (
          <div 
            ref={slashRef} 
            className="absolute z-50 rounded-2xl border shadow-2xl overflow-hidden"
            style={{ 
              left: slashMenu.x, 
              top: slashMenu.y, 
              background: 'var(--background-primary, white)', 
              borderColor: 'var(--border, #e4e7f0)', 
              boxShadow: '0 20px 48px -8px rgba(0,0,0,0.20), 0 0 0 1px var(--border, #e4e7f0)', 
              width: 280,
              animation: 'fadeInDown 0.15s ease',
            }}
          >
            {filteredSlash.map((cmd, i) => (
              <button 
                key={cmd.id} 
                onClick={() => execSlashCommand(cmd.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors"
                style={{ 
                  background: i === slashIdx ? 'var(--background-secondary)' : 'transparent', 
                  color: 'var(--text-primary)' 
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--background-secondary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = i === slashIdx ? 'var(--background-secondary)' : 'transparent')}
              >
                <span className="text-lg">{cmd.icon}</span>
                <p className="font-medium">{cmd.label}</p>
              </button>
            ))}
          </div>
        )}

        {/* Editor paper */}
        <div className="border overflow-hidden shadow-2xl bg-[var(--background-primary)] border-[var(--border)] text-[var(--text-primary)]">
          <div className={`px-16 py-14 min-h-[800px] transition-all duration-300 bg-[var(--background-primary)] ${readingMode ? 'max-w-3xl mx-auto' : ''}`}>
            <EditorHeader
              sectionTitle={activeSection?.title || 'Untitled section'}
              writingStyle={writingStyle}
              projectTitle={projectTitle}
            />
            <EditorContent editor={editor} className="focus-within:outline-none prose prose-lg max-w-none text-[var(--text-primary)]" />
          </div>
        </div>

        <div className="h-32" style={{ background: 'var(--background-secondary)' }} />

        {showScrollTop && (
          <button
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-8 w-12 h-12 flex items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background: 'var(--background-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-2.5 border-t text-[11px] bg-[var(--background-primary)] border-[var(--border)] text-[var(--text-tertiary)]">
        <StatusChip bg="var(--background-secondary)">
          <Type className="w-3.5 h-3.5" /><b className="text-[var(--text-secondary)]">{wordCount.toLocaleString()}</b> words
        </StatusChip>
        <StatusChip bg="var(--background-secondary)">
          <Hash className="w-3.5 h-3.5" /><b className="text-[var(--text-secondary)]">{charCount.toLocaleString()}</b> chars
        </StatusChip>
        <StatusChip bg="var(--background-secondary)">
          <Clock className="w-3.5 h-3.5" />{readTime} min read
        </StatusChip>
        {todos.length > 0 && (
          <StatusChip bg="var(--background-warning)" color="var(--text-warning)">
            <CheckCircle2 className="w-3.5 h-3.5" /><b>{todos.length}</b> todos
          </StatusChip>
        )}
        {unresolvedComments.length > 0 && (
          <StatusChip bg="var(--background-info)" color="var(--text-info)">
            <MessageSquare className="w-3.5 h-3.5" /><b>{unresolvedComments.length}</b> comments
          </StatusChip>
        )}
        {equationCounter > 1 && (
          <StatusChip bg="var(--background-secondary)">
            <Sigma className="w-3.5 h-3.5" /><b>{equationCounter - 1}</b> equations
          </StatusChip>
        )}
        <div className="flex-1" />
        {activeSection && (
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium bg-[var(--background-secondary)] text-[var(--text-secondary)]">
            <BookOpen className="w-3.5 h-3.5" />{activeSection.title}
          </span>
        )}
        <div className="flex items-center gap-2 font-medium px-3 py-1.5 rounded-lg"
          style={{ background: saved ? 'var(--background-success)' : 'var(--background-warning)', color: saved ? 'var(--text-success)' : 'var(--text-warning)' }}>
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : <><div className="w-2 h-2 rounded-full bg-current animate-pulse" /> Unsaved</>}
        </div>
      </div>

      {/* Inline keyframe for the panel entry animation */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}