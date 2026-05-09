'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { useState, useCallback } from 'react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Highlighter, Quote, Undo, Redo, Save, CheckCircle,
  ChevronDown, Heading1, Heading2, Heading3, Type,
} from 'lucide-react';
import type { Section, DocumentVersion } from '@/types';

interface DocumentEditorProps {
  sections: Section[];
  documentVersions: DocumentVersion[];
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-all duration-100 ${
        isActive
          ? 'bg-brand-500 text-white shadow-sm'
          : 'text-text-secondary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card hover:text-text-primary dark:hover:text-white'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-surface-border dark:bg-dark-border mx-1" />;
}

export function DocumentEditor({ sections, documentVersions }: DocumentEditorProps) {
  const [activeSection, setActiveSection] = useState<Section>(sections[0] ?? null);
  const [saved, setSaved] = useState(false);
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);

  const currentDoc = documentVersions.find(
    (dv) => dv.section_id === activeSection?.id && dv.is_current
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your section here...' }),
    ],
    content: currentDoc?.content ?? '',
    editorProps: {
      attributes: {
        class: 'ProseMirror focus:outline-none',
      },
    },
  });

  // Re-init editor content on section change
  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
    setSectionMenuOpen(false);
    const doc = documentVersions.find((dv) => dv.section_id === section.id && dv.is_current);
    if (editor) {
      editor.commands.setContent(doc?.content ?? '');
    }
  }, [editor, documentVersions]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border overflow-hidden">
      {/* Section selector header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card">
        <span className="text-xs text-text-tertiary dark:text-text-tertiary font-medium">Section:</span>
        <div className="relative">
          <button
            onClick={() => setSectionMenuOpen(!sectionMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-surface-border dark:border-dark-border text-sm font-medium text-text-primary dark:text-white hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
          >
            {activeSection?.title ?? 'Select section'}
            <ChevronDown className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${sectionMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {sectionMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-xl shadow-modal z-10 py-1 overflow-hidden animate-slide-up">
              {sections.map((section) => {
                const hasContent = documentVersions.some(dv => dv.section_id === section.id && dv.is_current);
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface-secondary dark:hover:bg-dark-card transition-colors ${
                      activeSection?.id === section.id
                        ? 'text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'text-text-primary dark:text-white'
                    }`}
                  >
                    <span className="capitalize">{section.title}</span>
                    {hasContent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Version badge */}
        {currentDoc && (
          <span className="text-[10px] text-text-tertiary dark:text-text-tertiary border border-surface-border dark:border-dark-border rounded-md px-2 py-0.5 font-mono">
            v{currentDoc.version_number}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs transition-all ${saved ? 'text-green-500' : 'text-text-tertiary dark:text-text-tertiary'}`}>
            {saved ? 'Saved!' : 'Unsaved changes'}
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition-colors shadow-brand"
          >
            {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-surface-border dark:border-dark-border bg-white dark:bg-dark-surface">
        {/* Undo/Redo */}
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton title="Heading 1" isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Paragraph" isActive={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Type className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton title="Bold" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Italic" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Underline" isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Highlight" isActive={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton title="Bullet List" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Numbered List" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Blockquote" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton title="Align Left" isActive={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Align Center" isActive={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Align Right" isActive={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Word count footer */}
      <div className="px-4 py-2 border-t border-surface-border dark:border-dark-border text-[10px] text-text-tertiary dark:text-text-tertiary flex items-center gap-3 bg-surface-secondary dark:bg-dark-card">
        <span>{editor.storage.characterCount?.characters?.() ?? 0} characters</span>
        <span>·</span>
        <span>{editor.getText().trim().split(/\s+/).filter(Boolean).length} words</span>
        {currentDoc && (
          <>
            <span>·</span>
            <span className="capitalize">{currentDoc.author_type} authored</span>
          </>
        )}
      </div>
    </div>
  );
}
