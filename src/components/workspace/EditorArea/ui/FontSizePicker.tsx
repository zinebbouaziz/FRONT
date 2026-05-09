// components/workspace/EditorArea/ui/FontSizePicker.tsx
'use client';

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { getCSSVariables } from '@/lib/cssVars';
import { FONT_SIZES } from '../constants';

interface FontSizePickerProps {
  value: string;
  onChange: (size: string) => void;
  onClose: () => void;
}

export function FontSizePicker({ value, onChange, onClose }: FontSizePickerProps) {
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
      className="p-3 rounded-2xl border shadow-2xl z-[100] max-h-[320px] overflow-y-auto"
      style={{
        background: vars.bgPrimary,
        borderColor: vars.borderSecondary,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        width: 200,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: vars.textTertiary }}
        >
          Font Size
        </span>
        <button onClick={onClose} className="p-1 rounded" style={{ color: vars.textTertiary }}>
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {FONT_SIZES.map(({ value: size, label }) => (
          <button
            key={size}
            onClick={() => {
              onChange(size);
              onClose();
            }}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
            style={{
              background: value === size ? vars.bgInfo : vars.bgSecondary,
              color: value === size ? vars.textInfo : vars.textSecondary,
              border: `1px solid ${value === size ? vars.borderInfo : vars.borderSecondary}`,
            }}
          >
            <span style={{ fontSize: size }}>A</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}