// components/workspace/EditorArea/hooks/useTodos.ts
import { useMemo, useState, useEffect } from 'react';
import type { Editor } from '@tiptap/core';

interface Todo {
  text: string;
  id: string;
  done: boolean;
  createdAt: string;
}

interface UseTodosReturn {
  todos: Todo[];
  newTodoText: string;
  setNewTodoText: React.Dispatch<React.SetStateAction<string>>;
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const KEY_PREFIX = 'cowritex:todos:';

export function useTodos(editor: Editor | null, sectionId?: string | null): UseTodosReturn {
  const [newTodoText, setNewTodoText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const storageKey = useMemo(() => (sectionId ? `${KEY_PREFIX}${sectionId}` : null), [sectionId]);

  useEffect(() => {
    if (!storageKey) {
      setTodos([]);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      setTodos(raw ? (JSON.parse(raw) as Todo[]) : []);
    } catch {
      setTodos([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(todos));
  }, [todos, storageKey]);

  const addTodo = () => {
    const text = newTodoText.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      { id: `todo-${Date.now()}`, text, done: false, createdAt: new Date().toISOString() },
    ]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return { todos, newTodoText, setNewTodoText, addTodo, toggleTodo, deleteTodo };
}