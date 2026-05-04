'use client';

import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle2, Archive } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle2,
    className: 'bg-status-active-bg text-status-active dark:bg-green-900/30 dark:text-green-400',
    dotClass: 'bg-status-active badge-active-pulse',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'bg-status-archived-bg text-status-archived dark:bg-slate-800 dark:text-slate-400',
    dotClass: 'bg-status-archived',
  },
  draft: {
    label: 'Draft',
    icon: Clock,
    className: 'bg-status-pending-bg text-status-pending dark:bg-amber-900/30 dark:text-amber-400',
    dotClass: 'bg-status-pending',
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.draft;

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-surface-border dark:border-dark-border p-5 shadow-card hover:shadow-card-hover hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-200 hover:-translate-y-0.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary dark:text-white text-sm leading-snug group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
              {project.title}
            </h3>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${status.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
            {status.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary dark:text-text-secondary leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-tertiary dark:text-text-tertiary font-medium">Progress</span>
            <span className="text-xs font-semibold text-brand-500 dark:text-brand-400">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-tertiary dark:bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-purple transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-text-tertiary dark:text-text-tertiary">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{formatDate(project.updated_at)}</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-brand-500 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Open <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
