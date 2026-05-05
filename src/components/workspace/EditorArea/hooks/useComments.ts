// components/workspace/EditorArea/hooks/useComments.ts
import { useState, useCallback } from 'react';
import { useEffect, useMemo } from 'react';
import type { Editor } from '@tiptap/core';
import type { Comment } from '../type'; // ✅ Fixed import path

interface UseCommentsReturn {
  comments: Comment[];
  unresolvedComments: Comment[];
  newCommentText: string;
  setNewCommentText: React.Dispatch<React.SetStateAction<string>>;
  activeCommentId: string | null;
  setActiveCommentId: React.Dispatch<React.SetStateAction<string | null>>;
  addComment: () => void;
  resolveComment: (id: string) => void;
  deleteComment: (id: string) => void;
}

const KEY_PREFIX = 'cowritex:comments:';

export function useComments(editor: Editor | null, sectionId?: string | null): UseCommentsReturn {
  const storageKey = useMemo(
    () => (sectionId ? `${KEY_PREFIX}${sectionId}` : null),
    [sectionId]
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    if (!storageKey) {
      setComments([]);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setComments([]);
        return;
      }
      const parsed = JSON.parse(raw) as Array<Omit<Comment, 'createdAt'> & { createdAt: string }>;
      setComments(parsed.map((c) => ({ ...c, createdAt: new Date(c.createdAt) })));
    } catch {
      setComments([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const serializable = comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }));
    localStorage.setItem(storageKey, JSON.stringify(serializable));
  }, [comments, storageKey]);

  const unresolvedComments = comments.filter((c) => !c.resolved);

  const addComment = useCallback(() => {
    if (!editor || !newCommentText.trim()) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    if (!selectedText) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      text: newCommentText,
      selectedText,
      author: 'You',
      createdAt: new Date(),
      resolved: false,
      from,
      to,
    };

    setComments((prev) => [...prev, newComment]);
    setNewCommentText('');
    setActiveCommentId(null);
  }, [editor, newCommentText]);

  const resolveComment = useCallback((id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: true } : c))
    );
  }, []);

  const deleteComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    comments,
    unresolvedComments,
    newCommentText,
    setNewCommentText,
    activeCommentId,
    setActiveCommentId,
    addComment,
    resolveComment,
    deleteComment,
  };
}