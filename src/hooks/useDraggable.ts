import { useState, useRef, useEffect } from 'react'

export function useDraggable<T extends HTMLElement = HTMLElement>(
  elementRef: React.RefObject<HTMLElement>,
  dragHandleRef?: React.RefObject<T>,
  options: { disabled?: boolean; initialPosition?: { x: number; y: number } } = {}
) {
  const { disabled = false, initialPosition = { x: 0, y: 0 } } = options
  const [position, setPosition] = useState(initialPosition)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const initialPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (disabled) {
      setPosition({ x: 0, y: 0 })
      return
    }

    const element = elementRef.current
    const dragHandle = dragHandleRef?.current || element
    if (!element || !dragHandle) return

    const handleMouseDown = (e: MouseEvent) => {
      // Don't drag if clicking on buttons
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('.win-nav-button')) {
        return
      }

      isDragging.current = true
      startPos.current = { x: e.clientX, y: e.clientY }

      const style = window.getComputedStyle(element)
      const transform = style.transform
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrix(transform)
        initialPos.current = {
          x: matrix.m41 || 0,
          y: matrix.m42 || 0,
        }
      } else {
        initialPos.current = { x: 0, y: 0 }
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      e.preventDefault()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const diffX = e.clientX - startPos.current.x
      const diffY = e.clientY - startPos.current.y

      const newX = initialPos.current.x + diffX
      const newY = initialPos.current.y + diffY

      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    dragHandle.addEventListener('mousedown', handleMouseDown)

    return () => {
      dragHandle.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [elementRef, dragHandleRef, disabled])

  return {
    position,
  }
}

