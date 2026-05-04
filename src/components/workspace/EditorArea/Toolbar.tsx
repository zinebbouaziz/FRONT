// components/workspace/EditorArea/Toolbar.tsx
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Undo, Redo, Strikethrough, Save, CheckCircle, Code,
  Table as TableIcon, Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  Image as ImageIcon, Link as LinkIcon, Minus, CheckSquare, Sigma,
  Link2Off, FunctionSquare, Highlighter, Baseline, ChevronDown,
  X, FileUp,
} from 'lucide-react';
import { ToolbarBtn } from '../ui/ToolbarBtn';
import { Divider } from '../ui/Divider';
import { HexColorPicker } from './ui/HexColorPicker';
import { FONT_FAMILIES, FONT_SIZES, PRESET_COLORS } from './constants';

interface ToolbarProps {
  editor: Editor | null;
  saved: boolean;
  onSave: () => void;
  onToggleTextColorPicker?: () => void;
  onToggleHighlightPicker?: () => void;
  // kept for API compatibility
  showColorPicker: boolean;
  setShowColorPicker: (v: boolean) => void;
  textColor: string;
  setTextColor: (v: string) => void;
  // live color state
  currentTextColor: string;
  onTextColorChange: (color: string) => void;
  currentHighlightColor: string;
  onHighlightChange: (color: string) => void;
  showTextColorPicker: boolean;
  setShowTextColorPicker: (v: boolean) => void;
  showHighlightPicker: boolean;
  setShowHighlightPicker: (v: boolean) => void;
  // font
  currentFontFamily: string;
  onFontFamilyChange: (family: string) => void;
  currentFontSize: string;
  onFontSizeChange: (size: string) => void;
  // actions
  onLink?: () => void;      // now optional – inline modal used instead
  onMathOpen: () => void;
  onFunctionsOpen: () => void;
  onAddComment?: () => void;
  onAddTodo?: () => void;
  // Export callback (optional) – receives format: 'pdf' | 'latex'
  onExport?: (format: 'pdf' | 'latex') => void;
}

/* ── Table size grid picker ── */
function TableSizePicker({
  onInsert,
  onClose,
}: {
  onInsert: (r: number, c: number) => void;
  onClose: () => void;
}) {
  const [hov, setHov] = useState<{ r: number; c: number } | null>(null);
  const ROWS = 8;
  const COLS = 8;

  return (
    <div
      className="absolute top-full left-0 mt-1 z-50 rounded-xl border shadow-2xl p-3 select-none"
      style={{
        background: 'var(--background-primary, #ffffff)',
        borderColor: 'var(--border, #e4e7f0)',
        boxShadow: '0 20px 40px -8px rgba(0,0,0,0.22)',
        minWidth: 220,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-2.5 text-center"
        style={{ color: 'var(--text-tertiary, #9ba3c4)' }}
      >
        {hov ? `${hov.r} × ${hov.c} table` : 'Insert Table'}
      </p>

      <div className="flex flex-col gap-1">
        {Array.from({ length: ROWS }, (_, ri) => (
          <div key={ri} className="flex gap-1">
            {Array.from({ length: COLS }, (_, ci) => {
              const active = !!hov && ri < hov.r && ci < hov.c;
              return (
                <button
                  key={ci}
                  className="w-6 h-6 rounded border-2 transition-all duration-75 hover:scale-110"
                  style={{
                    background: active
                      ? 'var(--background-info, #ede9ff)'
                      : 'var(--background-secondary, #f4f6fb)',
                    borderColor: active
                      ? 'var(--border-info, #6550e8)'
                      : 'var(--border, #e4e7f0)',
                  }}
                  onMouseEnter={() => setHov({ r: ri + 1, c: ci + 1 })}
                  onMouseLeave={() => setHov(null)}
                  onClick={() => {
                    onInsert(ri + 1, ci + 1);
                    onClose();
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t" style={{ borderColor: 'var(--border, #e4e7f0)' }}>
        <button
          onClick={() => { onInsert(3, 3); onClose(); }}
          className="w-full text-xs py-1.5 rounded-lg font-medium transition-colors"
          style={{ color: 'var(--text-secondary, #6b7194)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--background-secondary, #f4f6fb)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Default 3 × 3
        </button>
      </div>
    </div>
  );
}

export function Toolbar({
  editor,
  saved,
  onSave,
  currentTextColor,
  onTextColorChange,
  currentHighlightColor,
  onHighlightChange,
  showTextColorPicker,
  setShowTextColorPicker,
  showHighlightPicker,
  setShowHighlightPicker,
  currentFontFamily,
  onFontFamilyChange,
  currentFontSize,
  onFontSizeChange,
  onMathOpen,
  onFunctionsOpen,
  onExport,
}: ToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // ---- helpers for heading toggles ----
  const isHeadingActive = (level: 1 | 2 | 3 | 4) =>
    editor?.isActive('heading', { level }) ?? false;

  const toggleHeading = (level: 1 | 2 | 3 | 4) => {
    if (!editor) return;
    if (isHeadingActive(level)) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.chain().focus().setImage({ src: ev.target?.result as string }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleInsertTable = useCallback(
    (rows: number, cols: number) => {
      editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    },
    [editor]
  );

  const closeAllDropdowns = () => {
    setShowTablePicker(false);
    setShowTextColorPicker(false);
    setShowHighlightPicker(false);
    // link and export modals are separate, they handle their own closing
  };

  // ---- inline link handling ----
  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const existingHref = editor.getAttributes('link').href || '';
    setLinkUrl(existingHref);
    setShowLinkModal(true);
    // Close any open dropdowns but keep link modal
    setShowTablePicker(false);
    setShowTextColorPicker(false);
    setShowHighlightPicker(false);
    setShowExportModal(false);
  }, [editor]);

  const applyLink = () => {
    if (!editor) return;
    const trimmed = linkUrl.trim();
    if (trimmed) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkModal(false);
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkModal(false);
  };

  // Focus input when modal appears
  useEffect(() => {
    if (showLinkModal && linkInputRef.current) {
      setTimeout(() => linkInputRef.current?.focus(), 10);
    }
  }, [showLinkModal]);

  // ESC key closes link modal
  useEffect(() => {
    if (!showLinkModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLinkModal(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showLinkModal]);

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyLink();
    }
  };

  // ---- export ----
  const openExportModal = () => {
    setShowExportModal(true);
    closeAllDropdowns();
    setShowLinkModal(false);
  };

  const handleExport = (format: 'pdf' | 'latex') => {
    if (onExport) {
      onExport(format);
    } else if (editor) {
      let content = '';
      if (format === 'pdf') {
        content = editor.getHTML();
      } else if (format === 'latex') {
        content = editor.getText();
      }
      const blob = new Blob([content], { type: format === 'pdf' ? 'text/html' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setShowExportModal(false);
  };

  const ss = {
    borderColor: 'var(--border, #e4e7f0)',
    background: 'var(--surface-secondary, #f4f6fb)',
    color: 'var(--text-primary, #1a1d2e)',
  };

  return (
    <>
      <div
        className="sticky top-0 z-30 flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b shadow-sm"
        style={{ background: 'var(--surface, white)', borderColor: 'var(--border, #e4e7f0)' }}
      >
        {/* ── HEADING TOGGLES ── */}
        <ToolbarBtn title="Paragraph" active={!editor?.isActive('heading')} onClick={() => editor?.chain().focus().setParagraph().run()}>
          <span className="text-[10px] font-bold leading-none">P</span>
        </ToolbarBtn>
        <ToolbarBtn title="Heading 1" active={isHeadingActive(1)} onClick={() => toggleHeading(1)}>
          <span className="text-[10px] font-bold leading-none">H1</span>
        </ToolbarBtn>
        <ToolbarBtn title="Heading 2" active={isHeadingActive(2)} onClick={() => toggleHeading(2)}>
          <span className="text-[10px] font-bold leading-none">H2</span>
        </ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={isHeadingActive(3)} onClick={() => toggleHeading(3)}>
          <span className="text-[10px] font-bold leading-none">H3</span>
        </ToolbarBtn>
        <ToolbarBtn title="Heading 4" active={isHeadingActive(4)} onClick={() => toggleHeading(4)}>
          <span className="text-[10px] font-bold leading-none">H4</span>
        </ToolbarBtn>

        <Divider />

        {/* Font family */}
        <select value={currentFontFamily} onChange={(e) => onFontFamilyChange(e.target.value)}
          className="h-7 px-1.5 text-xs rounded-md border outline-none cursor-pointer max-w-[100px]" style={ss} title="Font family">
          {FONT_FAMILIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>

        {/* Font size */}
        <select value={currentFontSize} onChange={(e) => onFontSizeChange(e.target.value)}
          className="h-7 w-16 px-1 text-xs rounded-md border outline-none cursor-pointer" style={ss} title="Font size">
          {FONT_SIZES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>

        <Divider />

        {/* Formatting buttons */}
        <ToolbarBtn title="Bold" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Strikethrough" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Superscript" active={editor?.isActive('superscript')} onClick={() => editor?.chain().focus().toggleSuperscript().run()}><SuperscriptIcon className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Subscript" active={editor?.isActive('subscript')} onClick={() => editor?.chain().focus().toggleSubscript().run()}><SubscriptIcon className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* Text Color (toggle) */}
        <div className="relative">
          <ToolbarBtn
            title="Text color"
            active={showTextColorPicker || !!editor?.getAttributes('textStyle').color}
            onClick={() => {
              if (!editor) return;
              if (editor.getAttributes('textStyle').color) {
                editor.chain().focus().unsetColor().run();
                setShowTextColorPicker(false);
                return;
              }
              closeAllDropdowns();
              setShowTextColorPicker(!showTextColorPicker);
            }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Baseline className="w-3.5 h-3.5" />
              <span className="w-3.5 h-[3px] rounded-sm" style={{ background: currentTextColor }} />
            </div>
          </ToolbarBtn>
          {showTextColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-50">
              <HexColorPicker
                value={currentTextColor}
                onChange={(color) => {
                  if (!color) {
                    editor?.chain().focus().unsetColor().run();
                  } else {
                    editor?.chain().focus().setColor(color).run();
                  }
                  onTextColorChange(color);
                }}
                onClose={() => setShowTextColorPicker(false)}
                presetColors={PRESET_COLORS}
              />
            </div>
          )}
        </div>

        {/* Highlight Color (toggle) */}
        <div className="relative">
          <ToolbarBtn
            title="Highlight color"
            active={showHighlightPicker || editor?.isActive('highlight')}
            onClick={() => {
              if (!editor) return;
              if (editor.isActive('highlight')) {
                editor.chain().focus().unsetHighlight().run();
                setShowHighlightPicker(false);
                return;
              }
              closeAllDropdowns();
              setShowHighlightPicker(!showHighlightPicker);
            }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Highlighter className="w-3.5 h-3.5" />
              <span className="w-3.5 h-[3px] rounded-sm" style={{ background: currentHighlightColor }} />
            </div>
          </ToolbarBtn>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 z-50">
              <HexColorPicker
                value={currentHighlightColor}
                onChange={(color) => {
                  if (!color) {
                    editor?.chain().focus().unsetHighlight().run();
                  } else {
                    editor?.chain().focus().setHighlight({ color }).run();
                  }
                  onHighlightChange(color);
                }}
                onClose={() => setShowHighlightPicker(false)}
                presetColors={PRESET_COLORS}
              />
            </div>
          )}
        </div>

        <Divider />

        {/* Alignment toggles */}
        <ToolbarBtn title="Align left"   active={editor?.isActive({ textAlign: 'left' })}   onClick={() => editor?.isActive({ textAlign: 'left' })   ? editor?.chain().focus().unsetTextAlign().run() : editor?.chain().focus().setTextAlign('left').run()}><AlignLeft className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Align center" active={editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.isActive({ textAlign: 'center' }) ? editor?.chain().focus().unsetTextAlign().run() : editor?.chain().focus().setTextAlign('center').run()}><AlignCenter className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Align right"  active={editor?.isActive({ textAlign: 'right' })}  onClick={() => editor?.isActive({ textAlign: 'right' })  ? editor?.chain().focus().unsetTextAlign().run() : editor?.chain().focus().setTextAlign('right').run()}><AlignRight className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Justify"      active={editor?.isActive({ textAlign: 'justify' })} onClick={() => editor?.isActive({ textAlign: 'justify' }) ? editor?.chain().focus().unsetTextAlign().run() : editor?.chain().focus().setTextAlign('justify').run()}><AlignJustify className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn title="Bullet list" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Ordered list" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Task list" active={editor?.isActive('taskList')} onClick={() => editor?.chain().focus().toggleTaskList().run()}><CheckSquare className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* Block elements */}
        <ToolbarBtn title="Blockquote" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Code block" active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}><Code className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Horizontal rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* ── Table Toggle ── */}
        <div className="relative">
          <ToolbarBtn
            title={editor?.isActive('table') ? 'Remove table' : 'Insert table'}
            active={showTablePicker || editor?.isActive('table')}
            onClick={() => {
              if (!editor) return;
              if (editor.isActive('table')) {
                editor.chain().focus().deleteTable().run();
                setShowTablePicker(false);
                return;
              }
              // Toggle the picker
              if (showTablePicker) {
                setShowTablePicker(false);
              } else {
                closeAllDropdowns(); // close other dropdowns
                setShowTablePicker(true);
              }
            }}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </ToolbarBtn>
          {showTablePicker && (
            <TableSizePicker onInsert={handleInsertTable} onClose={() => setShowTablePicker(false)} />
          )}
        </div>

        <Divider />

        {/* ── Link Button ── */}
        <ToolbarBtn
          title={editor?.isActive('link') ? 'Edit / Remove link' : 'Insert link'}
          active={!!editor?.isActive('link')}
          onClick={openLinkModal}
        >
          {editor?.isActive('link') ? (
            <Link2Off className="w-3.5 h-3.5" />
          ) : (
            <LinkIcon className="w-3.5 h-3.5" />
          )}
        </ToolbarBtn>

        {/* Image */}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <ToolbarBtn title="Upload image" onClick={() => imageInputRef.current?.click()}>
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Math & Functions */}
        <ToolbarBtn title="Equation editor" onClick={onMathOpen}><Sigma className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Insert function" onClick={onFunctionsOpen}><FunctionSquare className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* History */}
        <ToolbarBtn title="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}><Undo className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}><Redo className="w-3.5 h-3.5" /></ToolbarBtn>

        <div className="flex-1" />

        {/* ── Export Button (same UI as Save) ── */}
        <button
          onClick={openExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: 'var(--brand, #6550e8)',
            color: 'white',
          }}
          title="Export document"
        >
          <FileUp className="w-3.5 h-3.5" />
          Export
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: saved ? 'rgba(34,197,94,0.1)' : 'var(--brand, #6550e8)',
            color: saved ? 'var(--text-success, #22c55e)' : 'white',
          }}
        >
          {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* ── LINK MODAL ── */}
      {showLinkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowLinkModal(false)}
        >
          <div
            className="rounded-xl border shadow-2xl p-5 w-96"
            style={{
              background: 'var(--background-primary, #ffffff)',
              borderColor: 'var(--border, #e4e7f0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {editor?.isActive('link') ? 'Edit Link' : 'Insert Link'}
            </h3>
            <input
              ref={linkInputRef}
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              className="w-full h-8 px-2 text-sm rounded-md border outline-none mb-3"
              style={{
                borderColor: 'var(--border, #e4e7f0)',
                background: 'var(--surface-secondary, #f4f6fb)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg"
                style={{
                  background: 'var(--surface-secondary, #f4f6fb)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              {editor?.isActive('link') && (
                <button
                  onClick={removeLink}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg"
                  style={{
                    background: 'var(--background-danger, #fee2e2)',
                    color: 'var(--text-danger, #ef4444)',
                  }}
                >
                  Remove
                </button>
              )}
              <button
                onClick={applyLink}
                className="px-4 py-1.5 text-xs font-medium rounded-lg"
                style={{
                  background: 'var(--brand, #6550e8)',
                  color: 'white',
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT MODAL ── */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="rounded-xl border shadow-2xl p-5 w-80"
            style={{
              background: 'var(--background-primary, #ffffff)',
              borderColor: 'var(--border, #e4e7f0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Export as
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  background: 'var(--brand, #6550e8)',
                  color: 'white',
                }}
              >
                PDF Document (.pdf)
              </button>
              <button
                onClick={() => handleExport('latex')}
                className="w-full py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  background: 'var(--surface-secondary, #f4f6fb)',
                  color: 'var(--text-primary)',
                }}
              >
                LaTeX Document (.tex)
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-2 py-2 text-sm font-medium rounded-lg"
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}