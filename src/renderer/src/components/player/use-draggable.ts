import { useState, useEffect, useCallback } from 'react'

export function useDraggable(onDrag: (clientX: number) => void) {
  const [isDragging, setIsDragging] = useState(false)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      onDrag(e.clientX)
    },
    [onDrag]
  )

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent): void => {
      e.preventDefault()
      onDrag(e.clientX)
    }
    const onUp = (): void => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, onDrag])

  return { isDragging, onMouseDown }
}
