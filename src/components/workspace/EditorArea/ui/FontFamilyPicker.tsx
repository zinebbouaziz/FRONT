// components/workspace/EditorArea/ui/FontFamilyPicker.tsx
'use client';

import { useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { getCSSVariables } from '@/lib/cssVars';
import { FONT_FAMILIES } from '../constants';

interface FontFamilyPickerProps {
  value: string;
  onChange: (family: string) => void;
  onClose: () => void;
}

export function FontFamilyPicker({ value, onChange, onClose }: FontFamilyPickerProps) {
  const vars = getCSSVariables();
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="p-3 rounded-2xl border shadow-2xl z-[100] max-h-[400px] overflow-y-auto"
      style={{
        background: vars.bgPrimary,
        borderColor: vars.borderSecondary,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        width: 240,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: vars.textTertiary }}
        >
          Font Family
        </span>
        <button onClick={onClose} className="p-1 rounded" style={{ color: vars.textTertiary }}>
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-1">
        {FONT_FAMILIES.map(({ value: family, label, preview }) => (
          <button
            key={family}
            onClick={() => {
              onChange(family);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all hover:scale-[1.02]"
            style={{
              background: value === family ? vars.bgInfo : 'transparent',
              color: value === family ? vars.textInfo : vars.textSecondary,
            }}
            onMouseEnter={(e) => {
              if (value !== family) e.currentTarget.style.background = vars.bgSecondary;
            }}
            onMouseLeave={(e) => {
              if (value !== family) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium border"
              style={{
                borderColor: value === family ? vars.borderInfo : vars.borderSecondary,
                background: vars.bgSecondary,
                fontFamily: family,
                color: vars.textPrimary,
              }}
            >
              {preview}
            </span>
            <span
              className="flex-1 font-medium"
              style={{ color: value === family ? vars.textInfo : vars.textPrimary }}
            >
              {label}
            </span>
            {value === family && <Check className="w-4 h-4" style={{ color: vars.textInfo }} />}
          </button>
        ))}
      </div>
    </div>
  );
}