// components/workspace/EditorArea/ui/ModernPopup.tsx
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { getCSSVariables } from '@/lib/cssVars';

interface ModernPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
  icon?: React.ElementType;
  badge?: number | string;
  badgeColor?: 'blue' | 'yellow' | 'red' | 'green';
  triggerRef: React.RefObject<HTMLElement>;
  preferPlacement?: 'top' | 'bottom';
  gap?: number; // Gap between button and popup
}

export function ModernPopup({
  isOpen,
  onClose,
  title,
  children,
  width = 320,
  icon: Icon,
  badge,
  badgeColor = 'blue',
  triggerRef,
  preferPlacement = 'bottom', // Default to bottom (date picker style)
  gap = 4, // Small gap like date picker
}: ModernPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const vars = getCSSVariables();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!isOpen || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Estimate popup height (will be refined after render)
    const estimatedHeight = 300;
    
    let top: number;

    // Prefer bottom placement (date picker style)
    if (preferPlacement === 'bottom') {
      top = triggerRect.bottom + gap;
      
      // If not enough space below, flip to top
      if (top + estimatedHeight > viewportHeight - 8) {
        top = triggerRect.top - estimatedHeight - gap;
      }
    } else {
      // Prefer top placement
      top = triggerRect.top - estimatedHeight - gap;
      
      // If not enough space above, flip to bottom
      if (top < 8) {
        top = triggerRect.bottom + gap;
      }
    }

    // Center horizontally relative to trigger button
    let left = triggerRect.left + triggerRect.width / 2 - width / 2;
    
    // Keep within viewport bounds (8px margin)
    const minLeft = 8;
    const maxLeft = viewportWidth - width - 8;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    setPosition({ top, left });
  }, [isOpen, triggerRef, preferPlacement, width, gap]);

  // Update position when opened or when dependencies change
  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  // Recalculate on window resize/scroll
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const badgeStyles = {
    blue: { bg: vars.bgInfo, text: vars.textInfo },
    yellow: { bg: vars.bgWarning, text: vars.textWarning },
    red: { bg: vars.bgDanger, text: vars.textDanger },
    green: { bg: vars.bgSuccess, text: vars.textSuccess },
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-[200] rounded-xl border shadow-xl overflow-hidden"
      style={{
        width,
        top: position.top,
        left: position.left,
        background: vars.bgPrimary,
        borderColor: vars.borderSecondary,
        // Softer shadow like date picker
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ 
          borderColor: vars.borderSecondary,
          background: vars.bgSecondary 
        }}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: vars.textInfo }} />}
          <span className="text-sm font-semibold" style={{ color: vars.textPrimary }}>
            {title}
          </span>
          {badge !== undefined && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: badgeStyles[badgeColor].bg,
                color: badgeStyles[badgeColor].text,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg transition-colors"
          style={{ color: vars.textTertiary }}
          onMouseEnter={(e) => (e.currentTarget.style.background = vars.bgTertiary)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div 
        className="p-3 max-h-80 overflow-y-auto"
        style={{ 
          background: vars.bgPrimary,
          color: vars.textPrimary 
        }}
      >
        {children}
      </div>
    </div>
  );
}