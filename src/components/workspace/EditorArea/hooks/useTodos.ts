// components/workspace/EditorArea/hooks/useTodos.ts
import { useMemo, useState } from 'react';
import type { Editor } from '@tiptap/core';

interface Todo {
  text: string;
  index: number;
  id: string;
}

interface UseTodosReturn {
  todos: Todo[];
  newTodoText: string;
  setNewTodoText: React.Dispatch<React.SetStateAction<string>>;
}

export function useTodos(editor: Editor | null): UseTodosReturn {
  const [newTodoText, setNewTodoText] = useState('');

  const todos = useMemo(() => {
    if (!editor) return [];
    const text = editor.getText();
    const matches: Todo[] = [];
    const re = /\[TODO:([^\]]*)\]/g;
    let m: RegExpExecArray | null;
    let id = 0;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        text: m[1].trim() || '(empty)',
        index: m.index,
        id: `todo-${id++}`,
      });
    }
    return matches;
  }, [editor?.state]);

  return { todos, newTodoText, setNewTodoText };
}