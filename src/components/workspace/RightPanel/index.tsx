'use client';

import { IconRail } from './IconRail';
import { ChatPanel } from './ChatPanel';
import { SuggestionsPanel } from './SuggestionsPanel';
import { LiteratureReviewPanel } from './LiteraturePanel';
import { VersionsPanel } from './VersionPanel';

<<<<<<< HEAD
=======
type HitlStatus = 'idle' | 'pending_review' | 'error';

interface RightPanelProps {
  rightPanel: string;
  rightOpen: boolean;
  setRightPanel: (panel: string) => void;
  setRightOpen: (open: boolean) => void;
  pendingCount: number;
  messages: any[];
  chatInput: string;
  setChatInput: (value: string) => void;
  sendMessage: () => void;
  chatLoading: boolean;
  suggestions: any[];
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onInsertCitation?: (paper: any) => void;
  projectId: string;
  token: string;
  hitlStatus: HitlStatus;
  hitlAgentOutput: string | null;
  hitlIntents: string[];
  onHitlApprove: () => void;
  onHitlEdit: (editedText: string) => void;
  onHitlRegenerate: (feedback: string) => void;
  versions: any[];
  versionsLoading: boolean;
  onRestoreVersion: (versionId: string) => void;
  sectionId: string | null;
}

>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
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
<<<<<<< HEAD
  litReview,
  setLitReview,
  onInsertCitation,
  projectId,
  token,
=======
  onInsertCitation,
  projectId,
  token,
  hitlStatus,
  hitlAgentOutput,
  hitlIntents,
  onHitlApprove,
  onHitlEdit,
  onHitlRegenerate,
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
  versions,
  versionsLoading,
  onRestoreVersion,
  sectionId,
<<<<<<< HEAD
}: any) {
=======
}: RightPanelProps) {
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384

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

<<<<<<< HEAD
          {/* HEADER */}
=======
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
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

<<<<<<< HEAD
          {/* SCROLLABLE CONTENT */}
=======
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
          <div className="flex-1 min-h-0 overflow-y-auto">
            {rightPanel === 'chat' && (
              <ChatPanel
                messages={messages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                sendMessage={sendMessage}
                chatLoading={chatLoading}
<<<<<<< HEAD
=======
                hitlStatus={hitlStatus}
                hitlAgentOutput={hitlAgentOutput}
                hitlIntents={hitlIntents}
                onHitlApprove={onHitlApprove}
                onHitlEdit={onHitlEdit}
                onHitlRegenerate={onHitlRegenerate}
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
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
<<<<<<< HEAD
                litReview={litReview}
                setLitReview={setLitReview}
                onInsertCitation={onInsertCitation}
                projectId={projectId}   // new
                token={token}           // new
=======
                projectId={projectId}
                token={token}
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
              />
            )}

            {rightPanel === 'versions' && (
              <VersionsPanel
                sectionId={sectionId}
                versions={versions}
                versionsLoading={versionsLoading}
                onRestoreVersion={onRestoreVersion}
              />
            )}
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* ICON RAIL */}
=======
>>>>>>> 3d76b04f5771a2d5df5b09c48f3c224eda0fb384
      <IconRail
        rightPanel={rightPanel}
        rightOpen={rightOpen}
        onSelectPanel={handleSelectPanel}
        pendingCount={pendingCount}
      />
    </div>
  );
}