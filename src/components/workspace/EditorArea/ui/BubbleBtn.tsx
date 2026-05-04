// components/workspace/EditorArea/ui/BubbleBtn.tsx

import { getCSSVariables } from '@/lib/cssVars'
import type { ReactNode, MouseEvent } from 'react'

interface BubbleBtnProps {
  title: string
  active?: boolean
  danger?: boolean
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
  className?: string
}

export function BubbleBtn({
  title,
  active = false,
  danger = false,
  onClick,
  children,
  className = '',
}: BubbleBtnProps) {
  const vars = getCSSVariables()

  const color = danger
    ? vars.textDanger
    : active
    ? vars.textInfo
    : vars.textSecondary

  const background = active ? vars.bgInfo : 'transparent'

  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick(e)
      }}
      className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${className}`}
      style={{
        color,
        background,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = vars.bgSecondary
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}