'use client';

import { IconRail } from './IconRail';
import { ChatPanel } from './ChatPanel';
import { SuggestionsPanel } from './SuggestionsPanel';
import { LiteratureReviewPanel } from './LiteraturePanel';
import { VersionsPanel } from './VersionPanel';

export function RightPanel({
  rightPanel,
  rightOpen,
  setRightPanel,
  setRightOpen,
  pendingCount,
  messages,
  chatInput,
  setChatInput,
  sendMessage,
  chatLoading,
  suggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
  litReview,
  setLitReview,
  onInsertCitation,
  projectId,   // new
  token,       // new
}: any) {

  const panelTitles: Record<string, string> = {
    chat: 'AI Assistant',
    suggestions: 'AI Suggestions',
    literature: 'Literature Review & Citations',
    versions: 'History',
  };

  const handleSelectPanel = (id: string) => {
    if (rightOpen && rightPanel === id) {
      setRightOpen(false);
    } else {
      setRightPanel(id);
      setRightOpen(true);
    }
  };

  return (
    <div className="flex flex-shrink-0 h-screen">
      {rightOpen && (
        <div className="w-72 h-full flex flex-col bg-white dark:bg-dark-surface border-l border-surface-border dark:border-dark-border overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <span className="text-2xl font-bold text-text-primary dark:text-white">
              {panelTitles[rightPanel]}
            </span>

            {rightPanel === 'suggestions' && pendingCount > 0 && (
              <span className="text-xs font-bold bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 rounded-full px-2 py-0.5">
                {pendingCount}
              </span>
            )}
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {rightPanel === 'chat' && (
              <ChatPanel
                messages={messages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                sendMessage={sendMessage}
                chatLoading={chatLoading}
              />
            )}

            {rightPanel === 'suggestions' && (
              <SuggestionsPanel
                suggestions={suggestions}
                onAccept={onAcceptSuggestion}
                onReject={onRejectSuggestion}
              />
            )}

            {rightPanel === 'literature' && (
              <LiteratureReviewPanel
                litReview={litReview}
                setLitReview={setLitReview}
                onInsertCitation={onInsertCitation}
                projectId={projectId}   // new
                token={token}           // new
              />
            )}

            {rightPanel === 'versions' && (
              <VersionsPanel />
            )}
          </div>
        </div>
      )}

      {/* ICON RAIL */}
      <IconRail
        rightPanel={rightPanel}
        rightOpen={rightOpen}
        onSelectPanel={handleSelectPanel}
        pendingCount={pendingCount}
      />
    </div>
  );
}