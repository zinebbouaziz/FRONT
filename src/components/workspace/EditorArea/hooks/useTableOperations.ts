// components/workspace/EditorArea/hooks/useTableOperations.ts
import { useCallback } from 'react';
import type { Editor } from '@tiptap/core';

export interface TableOperations {
  isTableActive: boolean;
  addColumnBefore: () => void;
  addColumnAfter: () => void;
  deleteColumn: () => void;
  addRowBefore: () => void;
  addRowAfter: () => void;
  deleteRow: () => void;
  deleteTable: () => void;
  mergeCells: () => void;
  splitCell: () => void;
  toggleHeaderRow: () => void;
  toggleHeaderColumn: () => void;
  /** Apply a background color to the currently selected table cell */
  setCellBackground: (color: string) => void;
  /** Remove the background color from the currently selected table cell */
  clearCellBackground: () => void;
}

export function useTableOperations(editor: Editor | null): TableOperations {
  const isTableActive = editor?.isActive('table') ?? false;

  const addColumnBefore = useCallback(() => {
    editor?.chain().focus().addColumnBefore().run();
  }, [editor]);

  const addColumnAfter = useCallback(() => {
    editor?.chain().focus().addColumnAfter().run();
  }, [editor]);

  const deleteColumn = useCallback(() => {
    editor?.chain().focus().deleteColumn().run();
  }, [editor]);

  const addRowBefore = useCallback(() => {
    editor?.chain().focus().addRowBefore().run();
  }, [editor]);

  const addRowAfter = useCallback(() => {
    editor?.chain().focus().addRowAfter().run();
  }, [editor]);

  const deleteRow = useCallback(() => {
    editor?.chain().focus().deleteRow().run();
  }, [editor]);

  const deleteTable = useCallback(() => {
    editor?.chain().focus().deleteTable().run();
  }, [editor]);

  const mergeCells = useCallback(() => {
    editor?.chain().focus().mergeCells().run();
  }, [editor]);

  const splitCell = useCallback(() => {
    editor?.chain().focus().splitCell().run();
  }, [editor]);

  const toggleHeaderRow = useCallback(() => {
    editor?.chain().focus().toggleHeaderRow().run();
  }, [editor]);

  const toggleHeaderColumn = useCallback(() => {
    editor?.chain().focus().toggleHeaderColumn().run();
  }, [editor]);

  const setCellBackground = useCallback(
    (color: string) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .updateAttributes('tableCell', { backgroundColor: color })
        .run();
    },
    [editor]
  );

  const clearCellBackground = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .updateAttributes('tableCell', { backgroundColor: null })
      .run();
  }, [editor]);

  return {
    isTableActive,
    addColumnBefore,
    addColumnAfter,
    deleteColumn,
    addRowBefore,
    addRowAfter,
    deleteRow,
    deleteTable,
    mergeCells,
    splitCell,
    toggleHeaderRow,
    toggleHeaderColumn,
    setCellBackground,
    clearCellBackground,
  };
}