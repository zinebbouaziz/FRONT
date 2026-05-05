import React from 'react';

interface PanelTabProps {
  id: string;
  active: boolean;
  onClick: (id: string) => void;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

export function PanelTab({ id, active, onClick, icon: Icon, label, badge }: PanelTabProps) {
  return (
    <button
      onClick={() => onClick(id)}
      title={label}
      className={`relative flex flex-col items-center gap-1 py-3 px-2 w-full transition-all border-l-2 ${
        active
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-500 dark:text-brand-400'
          : 'border-transparent text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white hover:bg-surface-secondary dark:hover:bg-dark-card'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[9px] font-medium leading-tight text-center">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-2 right-1 min-w-[14px] h-3.5 rounded-full bg-brand-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
          {badge}
        </span>
      )}
    </button>
  );
}