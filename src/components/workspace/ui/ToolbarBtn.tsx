'use client';
import React from 'react';

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

export function ToolbarBtn({ onClick, active, disabled, title, children }: ToolbarBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-7 w-7 flex items-center justify-center rounded-md transition-all duration-100 ${
        active
          ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
          : 'text-text-secondary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card hover:text-text-primary dark:hover:text-white'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}