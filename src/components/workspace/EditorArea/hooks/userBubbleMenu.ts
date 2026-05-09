// components/workspace/EditorArea/hooks/useBubbleMenu.ts

import { useState, useEffect, useCallback, RefObject } from 'react'
import type { Editor } from '@tiptap/core'
import type { BubblePos } from '../type'

const BUBBLE_OFFSET = 10
const BUBBLE_SAFE_MARGIN = 16

export function useBubbleMenu(
  editor: Editor | null,
  scrollRef: RefObject<HTMLElement>
): BubblePos {
  const [bubble, setBubble] = useState<BubblePos>({
    x: 0,
    y: 0,
    show: false,
  })

  const updateBubble = useCallback(() => {
    if (!editor || !scrollRef.current) return

    const { from, to } = editor.state.selection

    // hide if no selection
    if (from === to) {
      setBubble((b) => ({ ...b, show: false }))
      return
    }

    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    const scrollEl = scrollRef.current
    const containerRect = scrollEl.getBoundingClientRect()

    const centerX = rect.left + rect.width / 2

    let x = centerX - containerRect.left
    let y

    const spaceAbove = rect.top - containerRect.top

    if (spaceAbove > 60) {
      y =
        rect.top -
        containerRect.top +
        scrollEl.scrollTop -
        BUBBLE_OFFSET
    } else {
      y =
        rect.bottom -
        containerRect.top +
        scrollEl.scrollTop +
        BUBBLE_OFFSET
    }

    const maxWidth = containerRect.width - BUBBLE_SAFE_MARGIN

    x = Math.max(BUBBLE_SAFE_MARGIN, Math.min(x, maxWidth))

    setBubble({
      show: true,
      x,
      y,
    })
  }, [editor, scrollRef])

  useEffect(() => {
    if (!editor) return

    editor.on('selectionUpdate', updateBubble)

    const hide = () =>
      setBubble((b) => ({ ...b, show: false }))

    editor.on('blur', hide)

    return () => {
      editor.off('selectionUpdate', updateBubble)
      editor.off('blur', hide)
    }
  }, [editor, updateBubble])

  return bubble
}