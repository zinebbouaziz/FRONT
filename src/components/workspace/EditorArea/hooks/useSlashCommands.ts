// components/workspace/EditorArea/hooks/useSlashCommands.ts
import { useState, useEffect, useCallback, RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import { SLASH_COMMANDS } from '../constants';
import type { SlashMenu } from '../type';

interface UseSlashCommandsReturn {
  slashMenu: SlashMenu;
  slashIdx: number;
  filteredSlash: typeof SLASH_COMMANDS;
  execSlashCommand: (id: string | undefined) => void;
  setSlashMenu: React.Dispatch<React.SetStateAction<SlashMenu>>;
  setSlashIdx: React.Dispatch<React.SetStateAction<number>>;
}

export function useSlashCommands(
  editor: Editor | null,
  scrollRef: RefObject<HTMLElement>
): UseSlashCommandsReturn {
  const [slashMenu, setSlashMenu] = useState<SlashMenu>({
    show: false,
    x: 0,
    y: 0,
    query: '',
    triggerPos: -1,
  });
  const [slashIdx, setSlashIdx] = useState(0);

  // Filter commands based on query
  const filteredSlash = SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(slashMenu.query.toLowerCase())
  );

  // Execute slash command
  const execSlashCommand = useCallback(
    (id: string | undefined) => {
      if (!id || !editor) return;
      const { from } = editor.state.selection;
      editor
        .chain()
        .focus()
        .deleteRange({ from: slashMenu.triggerPos, to: from })
        .run();
      setSlashMenu((s) => ({ ...s, show: false }));

      switch (id) {
        case 'h1':
          editor.chain().focus().setHeading({ level: 1 }).run();
          break;
        case 'h2':
          editor.chain().focus().setHeading({ level: 2 }).run();
          break;
        case 'h3':
          editor.chain().focus().setHeading({ level: 3 }).run();
          break;
        case 'bullet':
          editor.chain().focus().toggleBulletList().run();
          break;
        case 'ordered':
          editor.chain().focus().toggleOrderedList().run();
          break;
        case 'task':
          editor.chain().focus().toggleTaskList().run();
          break;
        case 'quote':
          editor.chain().focus().toggleBlockquote().run();
          break;
        case 'code':
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case 'table':
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          break;
        case 'todo':
          editor
            .chain()
            .focus()
            .insertContent('<mark data-color="#fef08a">[TODO: write here]</mark> ')
            .run();
          break;
        case 'math':
          // Open math modal – handled by parent via a callback
          // We'll expose a way to trigger math modal via a callback prop
          break;
        case 'block-math':
          // Open math modal – handled by parent
          break;
        case 'hr':
          editor.chain().focus().setHorizontalRule().run();
          break;
      }
    },
    [editor, slashMenu.triggerPos]
  );

  // Keyboard navigation for slash menu
  useEffect(() => {
    if (!editor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slashMenu.show) {
        const filtered = SLASH_COMMANDS.filter((c) =>
          c.label.toLowerCase().includes(slashMenu.query.toLowerCase())
        );
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSlashIdx((i) => (i + 1) % filtered.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSlashIdx((i) => (i - 1 + filtered.length) % filtered.length);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          execSlashCommand(filtered[slashIdx]?.id);
          return;
        }
        if (e.key === 'Escape') {
          setSlashMenu((s) => ({ ...s, show: false }));
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [slashMenu, slashIdx, execSlashCommand, editor]);

  // Detect slash typing
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      const { state } = editor;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(Math.max(0, from - 30), from, '\n');
      const slashIndex = textBefore.lastIndexOf('/');
      if (slashIndex !== -1) {
        const query = textBefore.slice(slashIndex + 1);
        if (!query.includes(' ') && !query.includes('\n')) {
          const coords = editor.view.coordsAtPos(from);
          const scrollEl = scrollRef.current;
          if (!scrollEl) return;
          const scrollRect = scrollEl.getBoundingClientRect();
          setSlashMenu({
            show: true,
            x: coords.left - scrollRect.left,
            y: coords.bottom - scrollRect.top + scrollEl.scrollTop + 4,
            query,
            triggerPos: from - query.length - 1,
          });
          setSlashIdx(0);
          return;
        }
      }
      setSlashMenu((s) => ({ ...s, show: false }));
    };
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, scrollRef]);

  return {
    slashMenu,
    slashIdx,
    filteredSlash,
    execSlashCommand,
    setSlashMenu,
    setSlashIdx,
  };
}