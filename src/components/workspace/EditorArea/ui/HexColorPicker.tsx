'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { getCSSVariables } from '@/lib/cssVars';

export interface PresetColor {
  color: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
  title?: string;
  presetColors?: PresetColor[];
  triggerRef?: React.RefObject<HTMLElement>;
}

/* ───────── helpers ───────── */
function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);

  const toHex = (x: number) => {
    const v = Math.round(x * 255).toString(16);
    return v.length === 1 ? '0' + v : v;
  };

  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
}

function hexToHsv(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h,
    s: max ? d / max : 0,
    v: max,
  };
}

const DEFAULT_PRESETS: PresetColor[] = [
  { color: '#ef4444', label: 'Red' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#22c55e', label: 'Green' },
  { color: '#f59e0b', label: 'Amber' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#64748b', label: 'Slate' },
  { color: '#000000', label: 'Black' },
  { color: '#ffffff', label: 'White' },
];

export function HexColorPicker({
  value,
  onChange,
  onClose,
  title = 'Color',
  presetColors = DEFAULT_PRESETS,
  triggerRef,
}: Props) {
  const vars = getCSSVariables();

  const pickerRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const init = hexToHsv(value || '#3b82f6');

  const [hue, setHue] = useState(init.h);
  const [sat, setSat] = useState(init.s);
  const [val, setVal] = useState(init.v);

  const currentHex = hsvToHex(hue, sat, val);

  /* ───────── positioning (smaller popover) ───────── */
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const width = 240;
    const height = 320;

    if (triggerRef?.current) {
      const r = triggerRef.current.getBoundingClientRect();

      let left = r.left + r.width / 2 - width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

      let top = r.bottom + 8;
      if (top + height > window.innerHeight) {
        top = r.top - height - 8;
      }

      setPos({ top, left });
    } else {
      setPos({
        top: window.innerHeight / 2 - height / 2,
        left: window.innerWidth / 2 - width / 2,
      });
    }
  }, [triggerRef]);

  /* ───────── outside click ───────── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const commit = useCallback(
    (h: number, s: number, v: number) => {
      onChange(hsvToHex(h, s, v));
    },
    [onChange]
  );

  const getCoords = (e: React.PointerEvent) => {
    const r = paletteRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;

    return {
      s: Math.max(0, Math.min(1, x)),
      v: Math.max(0, Math.min(1, 1 - y)),
    };
  };

  const picker = (
    <div
      ref={pickerRef}
      className="fixed z-[300] rounded-2xl border overflow-hidden shadow-xl"
      style={{
        top: pos.top,
        left: pos.left,
        width: 240,
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{
          borderColor: 'var(--border)',
          background:
            'linear-gradient(to right, rgba(59,130,246,0.08), rgba(99,102,241,0.08))',
        }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          {title}
        </span>

        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* BODY */}
      <div className="p-3 space-y-3">
        {/* PALETTE */}
        <div
          ref={paletteRef}
          className="relative w-full rounded-xl cursor-crosshair"
          style={{
            height: 120,
            background: `hsl(${hue},100%,50%)`,
          }}
          onPointerDown={(e) => {
            dragging.current = true;
            const { s, v } = getCoords(e);
            setSat(s);
            setVal(v);
            commit(hue, s, v);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            const { s, v } = getCoords(e);
            setSat(s);
            setVal(v);
            commit(hue, s, v);
          }}
          onPointerUp={() => (dragging.current = false)}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent" />

          {/* HANDLE */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow"
            style={{
              left: `${sat * 100}%`,
              top: `${(1 - val) * 100}%`,
              transform: 'translate(-50%, -50%)',
              background: currentHex,
            }}
          />
        </div>

        {/* HUE */}
        <input
          type="range"
          min={0}
          max={360}
          value={hue}
          onChange={(e) => {
            const h = Number(e.target.value);
            setHue(h);
            commit(h, sat, val);
          }}
          className="w-full h-2 rounded-full"
          style={{
            background:
              'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
          }}
        />

        {/* PRESETS */}
        <div className="grid grid-cols-6 gap-1.5">
          {presetColors.slice(0, 12).map((c) => (
            <button
              key={c.color}
              title={c.label}
              onClick={() => {
                const { h, s, v } = hexToHsv(c.color);
                setHue(h);
                setSat(s);
                setVal(v);
                onChange(c.color);
              }}
              className="w-6 h-6 rounded-md border hover:scale-110 transition"
              style={{
                background: c.color,
                borderColor:
                  currentHex.toLowerCase() === c.color.toLowerCase()
                    ? 'var(--text-info)'
                    : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="flex justify-between items-center px-3 py-2 border-t"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface-secondary)',
        }}
      >
        <button
          onClick={() => onChange('')}
          className="text-[11px] px-2 py-1 rounded-md"
          style={{ color: 'var(--text-danger)' }}
        >
          Clear
        </button>

        <button
          onClick={onClose}
          className="text-[11px] px-3 py-1 rounded-md font-semibold"
          style={{
            background: 'var(--background-info)',
            color: 'var(--text-info)',
          }}
        >
          Done
        </button>
      </div>
    </div>
  );

  return createPortal(picker, document.body);
}