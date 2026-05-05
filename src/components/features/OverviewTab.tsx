'use client';

import { Calendar, Target, Cpu, BookOpen, Settings2 } from 'lucide-react';
import type { Project, ProjectPreference, Section } from '@/types';

interface OverviewTabProps {
  project: Project;
  preference: ProjectPreference | undefined;
  sections: Section[];
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-surface-border dark:border-dark-border last:border-0">
      <span className="text-xs text-text-tertiary dark:text-text-tertiary font-medium w-36 flex-shrink-0">{label}</span>
      <span className="text-xs text-text-primary dark:text-white text-right">{value}</span>
    </div>
  );
}

function SectionChip({ section }: { section: Section }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs rounded-lg border border-brand-100 dark:border-brand-800 font-medium capitalize">
      {section.title}
    </span>
  );
}

export function OverviewTab({ project, preference, sections }: OverviewTabProps) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Project Info */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
          </div>
          <span className="text-sm font-semibold text-text-primary dark:text-white">Project Details</span>
        </div>

        <div>
          <InfoRow label="Thread ID" value={<span className="font-mono text-[10px] text-text-secondary dark:text-text-secondary">{project.thread_id}</span>} />
          <InfoRow label="Created" value={formatDate(project.created_at)} />
          <InfoRow label="Last Updated" value={formatDate(project.updated_at)} />
          <InfoRow label="Progress" value={`${project.progress}%`} />
        </div>
      </div>

      {/* Preferences */}
      {preference && (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Settings2 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-text-primary dark:text-white">Preferences</span>
          </div>

          <div>
            <InfoRow label="Writing Style" value={<span className="capitalize">{preference.writing_style}</span>} />
            <InfoRow label="Tone" value={<span className="capitalize">{preference.tone}</span>} />
            <InfoRow label="Target Journal" value={preference.target_journal} />
            <InfoRow label="Citation Style" value={preference.citation_style} />
            <InfoRow label="AI Provider" value={<span className="capitalize font-mono text-xs">{preference.llm_provider}</span>} />
            <InfoRow label="Grounded Only" value={preference.grounded_only ? 'Yes' : 'No'} />
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border p-5 lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          </div>
          <span className="text-sm font-semibold text-text-primary dark:text-white">Paper Sections</span>
          <span className="text-xs text-text-tertiary dark:text-text-tertiary">({sections.length} sections)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <SectionChip key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
