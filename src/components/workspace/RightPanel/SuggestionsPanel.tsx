'use client';
import { SuggestionCard } from '../ui/Suggestioncard';

interface SuggestionsPanelProps {
  suggestions: any[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function SuggestionsPanel({ suggestions, onAccept, onReject }: SuggestionsPanelProps) {
  return (
    <div className="px-3 py-3 space-y-3">
      {suggestions.length === 0 ? (
        <p className="text-xs text-text-tertiary text-center py-8">No suggestions yet.</p>
      ) : (
        suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} onAccept={onAccept} onReject={onReject} />
        ))
      )}
    </div>
  );
}