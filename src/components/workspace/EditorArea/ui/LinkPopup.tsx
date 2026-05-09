'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Globe,
  ExternalLink,
  Link as LinkIcon,
  Link2Off,
  Check,
  Sparkles,
  Keyboard,
  AlertCircle,
} from 'lucide-react';
import { getCSSVariables } from '@/lib/cssVars';
import type { LinkPopup as LinkPopupType } from '../type';

/* ── Toast ── */
function Toast({ message, visible, onHide }: { message: string; visible: boolean; onHide: () => void }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 2000);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300]">
      <div
        className="px-4 py-2 rounded-full text-sm font-medium shadow-2xl flex items-center gap-2"
        style={{
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        }}
      >
        <Check className="w-4 h-4" style={{ color: 'var(--text-info)' }} />
        {message}
      </div>
    </div>
  );
}

/* ── Tooltip ── */
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs z-50"
          style={{
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────── */

export function LinkPopup({
  popup,
  onClose,
  onSetLink,
  onUnlink,
  onVisit,
  onCopy,
}: {
  popup: LinkPopupType;
  onClose: () => void;
  onSetLink: (url: string) => void;
  onUnlink: () => void;
  onVisit: () => void;
  onCopy: () => void;
}) {
  const vars = getCSSVariables();
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputUrl, setInputUrl] = useState(popup.inputUrl || '');
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setInputUrl(popup.inputUrl || popup.url || '');
  }, [popup]);

  const validate = (v: string) => {
    if (!v.trim()) return true;
    try {
      new URL(v.startsWith('http') ? v : `https://${v}`);
      return true;
    } catch {
      return false;
    }
  };

  const notify = (msg: string) => setToast({ show: true, msg });

  const handleSubmit = useCallback(() => {
    if (!inputUrl.trim()) return;
    if (!isValid) return notify('Invalid URL');

    const url = /^https?:\/\//i.test(inputUrl)
      ? inputUrl
      : `https://${inputUrl}`;

    onSetLink(url);
    notify(popup.url ? 'Link updated' : 'Link inserted');
  }, [inputUrl, isValid]);

  if (!popup.show) return null;

  const hasLink = !!popup.url;

  return (
    <>
      <div
        ref={popupRef}
        className="absolute z-[100] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          left: popup.x,
          top: popup.y,
          width: 380,

          /* 🔥 SAME SYSTEM AS MATHMODAL */
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        }}
      >
        {/* HEADER */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--background-secondary)' }}
            >
              <LinkIcon className="w-4 h-4" style={{ color: 'var(--text-info)' }} />
            </div>

            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {hasLink ? 'Edit Link' : 'Insert Link'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Add hyperlink
              </p>
            </div>
          </div>

          <button onClick={onClose}>
            <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          {hasLink && (
            <div
              className="p-3 rounded-xl border flex items-center gap-3"
              style={{
                background: 'var(--background-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <Globe className="w-4 h-4" style={{ color: 'var(--text-info)' }} />
              <div className="flex-1">
                <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                  {popup.url}
                </p>
              </div>
            </div>
          )}

          {/* INPUT */}
          <input
            ref={inputRef}
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setIsValid(validate(e.target.value));
            }}
            placeholder="https://example.com"
            className="w-full px-3 py-2 rounded-xl outline-none"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />

          {!isValid && (
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-danger)' }}>
              <AlertCircle className="w-3 h-3" />
              Invalid URL
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="flex justify-end gap-2 px-5 py-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg"
            style={{
              background: 'var(--background-info)',
              color: 'var(--text-info)',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* TOAST */}
      <Toast
        message={toast.msg}
        visible={toast.show}
        onHide={() => setToast({ show: false, msg: '' })}
      />
    </>
  );
}