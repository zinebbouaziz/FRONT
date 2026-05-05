'use client';
import { ChevronRight, ChevronLeft, MessageSquare, Lightbulb, Library, History } from 'lucide-react';
import { PanelTab } from '../ui/PanelTab';

interface IconRailProps {
  rightPanel: string;
  rightOpen: boolean;
  onSelectPanel: (id: string) => void;
  pendingCount: number;
}

export function IconRail({ rightPanel, rightOpen, onSelectPanel, pendingCount }: IconRailProps) {
  return (
    <div className="w-12 flex flex-col bg-white dark:bg-dark-surface border-l border-surface-border dark:border-dark-border">
      <PanelTab
        id="chat"
        active={rightPanel === 'chat' && rightOpen}
        onClick={onSelectPanel}
        icon={MessageSquare}
        label="Chat"
      />
      <PanelTab
        id="suggestions"
        active={rightPanel === 'suggestions' && rightOpen}
        onClick={onSelectPanel}
        icon={Lightbulb}
        label="AI"
        badge={pendingCount}
      />
      <PanelTab
        id="literature"
        active={rightPanel === 'literature' && rightOpen}
        onClick={onSelectPanel}
        icon={Library}
        label="Lit Review"
      />
      <PanelTab
        id="versions"
        active={rightPanel === 'versions' && rightOpen}
        onClick={onSelectPanel}
        icon={History}
        label="Hist"
      />


    </div>
  );
}