'use client';

import { SectionTree } from './SectionTree';
import { LibraryPanel } from './LibraryPanel';

interface LeftSidebarProps {
  projectId?: string;
  sections: any[];
  activeSectionId: string | null;
  onSelectSection: (s: any) => void;
  onAddSection: (name: string, parentId: string | null, depth: number, position: number) => void;
  onRenameSection?: (id: string, newTitle: string) => void;
  onDeleteSection?: (id: string) => void;
  onReorderSections?: (sections: any[]) => void;
  sectionSearch: string;
  setSectionSearch: (v: string) => void;
  showSectionSearch: boolean;
  setShowSectionSearch: (v: boolean) => void;
  addingSection: boolean;
  setAddingSection: (v: boolean) => void;
  newSectionName: string;
  setNewSectionName: (v: string) => void;
  onSearchOpen: () => void;
  onInsertCitation: (paper: any) => void;
  onFileUpload: () => void;
  sourcesRefreshKey?: number;
}

export function LeftSidebar({
  projectId,
  sections,
  activeSectionId,
  onSelectSection,
  onAddSection,
  onRenameSection,
  onDeleteSection,
  onReorderSections,
  sectionSearch,
  setSectionSearch,
  showSectionSearch,
  setShowSectionSearch,
  addingSection,
  setAddingSection,
  newSectionName,
  setNewSectionName,
  onSearchOpen,
  onInsertCitation,
  onFileUpload,
  sourcesRefreshKey = 0,
}: LeftSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-56 h-screen flex-shrink-0 bg-surface-secondary dark:bg-dark-bg border-r border-surface-border dark:border-dark-border overflow-hidden">

      {/* SCROLLABLE SECTION TREE */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <SectionTree
          sections={sections}
          activeSectionId={activeSectionId}
          onSelectSection={onSelectSection}
          onAddSection={onAddSection}
          onRenameSection={onRenameSection}
          onDeleteSection={onDeleteSection}
          onReorderSections={onReorderSections}
          sectionSearch={sectionSearch}
          setSectionSearch={setSectionSearch}
          showSectionSearch={showSectionSearch}
          setShowSectionSearch={setShowSectionSearch}
          addingSection={addingSection}
          setAddingSection={setAddingSection}
          newSectionName={newSectionName}
          setNewSectionName={setNewSectionName}
        />
      </div>

      {/* REFERENCE LIBRARY PANEL */}
      <LibraryPanel
        projectId={projectId}
        onSearchOpen={onSearchOpen}
        onInsertCitation={onInsertCitation}
        onFileUpload={onFileUpload}
        refreshKey={sourcesRefreshKey}
      />

    </aside>
  );
}