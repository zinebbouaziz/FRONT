'use client';

import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 flex items-center gap-3 px-4 md:px-6 bg-white dark:bg-dark-surface border-b border-surface-border dark:border-dark-border flex-shrink-0">
      {children}

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-secondary dark:bg-dark-card rounded-lg border border-surface-border dark:border-dark-border text-text-tertiary text-sm">
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs">Search papers, sections...</span>
        <kbd className="ml-auto text-[10px] font-mono bg-white dark:bg-dark-surface border border-surface-border dark:border-dark-border px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-card text-text-secondary dark:text-text-secondary transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-card text-text-secondary dark:text-text-secondary transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
