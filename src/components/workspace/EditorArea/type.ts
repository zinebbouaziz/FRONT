// components/workspace/EditorArea/type.ts
import type { Editor } from '@tiptap/core';

export interface EditorAreaProps {
  editor: Editor | null;
  activeSection: { id?: string; title: string } | null;
  writingStyle: string;
  projectTitle: string;
  saved: boolean;
  onSave: () => void;
  showColorPicker: boolean;
  setShowColorPicker: (v: boolean) => void;
  textColor: string;
  setTextColor: (v: string) => void;
  wordCount: number;
  charCount: number;
}

export interface BubblePos { x: number; y: number; show: boolean }

export interface Comment {
  id: string;
  text: string;
  selectedText: string;
  author: string;
  createdAt: Date;
  resolved: boolean;
  from: number;
  to: number;
}

export interface SlashMenu {
  show: boolean;
  x: number;
  y: number;
  query: string;
  triggerPos: number;
}

export interface PopupState {
  comments: boolean;
  todos: boolean;
  crossRef: boolean;
}

export interface LinkPopup {
  show: boolean;
  mode: 'view' | 'edit';
  url: string;
  inputUrl: string;
  x: number;
  y: number;
}

export interface MathModal {
  show: boolean;
  type: 'inline' | 'block';
  latex: string;
  editFrom?: number;
  editTo?: number;
  preview: string;
  equationNumber?: number;
}