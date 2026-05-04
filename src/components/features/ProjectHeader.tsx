'use client';

import { ArrowLeft, Archive, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Project } from '@/types';

interface ProjectHeaderProps {
  project: Project;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-status-active-bg text-status-active dark:bg-green-900/30 dark:text-green-400',
    dotClass: 'bg-status-active badge-active-pulse',
  },
  archived: {
    label: 'Archived',
    className: 'bg-status-archived-bg text-status-archived dark:bg-slate-800 dark:text-slate-400',
    dotClass: 'bg-status-archived',
  },
  draft: {
    label: 'Draft',
    className: 'bg-status-pending-bg text-status-pending dark:bg-amber-900/30 dark:text-amber-400',
    dotClass: 'bg-status-pending',
  },
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const status = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.draft;

  return (
    <div className="bg-white dark:bg-dark-surface border-b border-surface-border dark:border-dark-border px-6 py-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-text-secondary hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <span className="text-text-tertiary text-xs">/</span>
        <span className="text-xs text-text-tertiary dark:text-text-tertiary truncate max-w-[200px]">
          {project.title}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-display font-bold text-xl text-text-primary dark:text-white leading-tight">
              {project.title}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${status.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>
          </div>

          <p className="text-sm text-text-secondary dark:text-text-secondary leading-relaxed max-w-2xl mb-4">
            {project.description}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-3 max-w-sm">
            <div className="flex-1 h-2 bg-surface-tertiary dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-purple transition-all duration-700"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-brand-500 dark:text-brand-400 flex-shrink-0">
              {project.progress}%
            </span>
            <span className="text-xs text-text-tertiary dark:text-text-tertiary">complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
