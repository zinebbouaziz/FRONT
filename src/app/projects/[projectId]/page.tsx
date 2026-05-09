'use client';

import { notFound } from 'next/navigation';
import { useState } from 'react';
import {
  projects, projectPreferences, sections,
  documentVersions, sources, literatureAnalysis,
  literatureCitations, aiSuggestions,
} from '@/lib/mockData';
import { ProjectHeader } from '@/components/features/ProjectHeader';
import { OverviewTab } from '@/components/features/OverviewTab';
import { SourcesTable } from '@/components/features/SourcesTable';
import { LiteratureReviewCard } from '@/components/features/LiteratureReviewCard';
import { CitationsList } from '@/components/features/CitationsList';
import { AiSuggestionsList } from '@/components/features/AiSuggestionsList';
import { DocumentEditor } from '@/components/features/DocumentEditor';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sources', label: 'Sources' },
  { id: 'literature', label: 'Literature Review' },
  { id: 'suggestions', label: 'AI Suggestions' },
  { id: 'citations', label: 'Citations' },
  { id: 'documents', label: 'Documents' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const project = projects.find(p => p.id === params.projectId);
  if (!project) notFound();

  const preference = projectPreferences.find(pp => pp.project_id === project.id);
  const projectSections = sections.filter(s => s.project_id === project.id).sort((a, b) => a.position - b.position);
  const projectSources = sources.filter(s => s.project_id === project.id);
  const projectAnalysis = literatureAnalysis.find(la => la.project_id === project.id);
  const projectDocVersions = documentVersions.filter(dv =>
    projectSections.some(s => s.id === dv.section_id)
  );
  const projectSuggestions = aiSuggestions.filter(ai =>
    projectSections.some(s => s.id === ai.section_id)
  );

  // Citations: get analysis for this project, then filter citations
  const analysisIds = literatureAnalysis
    .filter(la => la.project_id === project.id)
    .map(la => la.id);
  const projectCitations = literatureCitations.filter(lc =>
    analysisIds.includes(lc.literature_analysis_id)
  );

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader project={project} />

      {/* Tab navigation */}
      <div className="bg-white dark:bg-dark-surface border-b border-surface-border dark:border-dark-border px-4 md:px-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3.5 text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className={`flex-1 overflow-y-auto ${activeTab === 'documents' ? 'p-0' : 'px-4 md:px-6 py-5'}`}>
        <div className={`animate-fade-in ${activeTab === 'documents' ? 'h-full' : 'max-w-5xl mx-auto'}`}>
          {activeTab === 'overview' && (
            <OverviewTab project={project} preference={preference} sections={projectSections} />
          )}

          {activeTab === 'sources' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-text-primary dark:text-white">Reference Library</h2>
                  <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-0.5">{projectSources.length} papers collected</p>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
                  + Add Source
                </button>
              </div>
              <SourcesTable sources={projectSources} />
            </div>
          )}

          {activeTab === 'literature' && (
            <div>
              {projectAnalysis ? (
                <LiteratureReviewCard analysis={projectAnalysis} />
              ) : (
                <div className="text-center py-12 text-text-tertiary dark:text-text-tertiary text-sm">
                  No literature review generated yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <AiSuggestionsList suggestions={projectSuggestions} />
          )}

          {activeTab === 'citations' && (
            <CitationsList citations={projectCitations} />
          )}

          {activeTab === 'documents' && (
            <div className="h-full p-4 md:p-6">
              <DocumentEditor
                sections={projectSections}
                documentVersions={projectDocVersions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
