import { useEffect, useRef } from 'react'
import { useDraggable } from '../hooks/useDraggable'

interface WindowProps {
  id: string
  title: string
  isActive: boolean
  onActivate: () => void
  onClose: () => void
  children: React.ReactNode
  isMobile?: boolean
}

export default function Window({
  id,
  title,
  isActive,
  onActivate,
  onClose,
  children,
  isMobile = false,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const { position } = useDraggable(windowRef, navRef, { disabled: isMobile })

  useEffect(() => {
    if (isMobile || !windowRef.current) return
    if (isActive) {
      windowRef.current.style.zIndex = '10'
    } else {
      windowRef.current.style.zIndex = '2'
    }
  }, [isActive, isMobile])

  useEffect(() => {
    if (!isMobile || !windowRef.current) return
    windowRef.current.style.zIndex = '5'
  }, [isMobile])

  const containerClass = isMobile
    ? 'relative w-full bg-win-bg p-1.5'
    : `win-window draggable ${isActive ? 'active' : ''}`

  const styleOverrides = isMobile
    ? {
        position: 'relative' as const,
        transform: 'none',
        opacity: 1,
        visibility: 'visible' as const,
        width: 'min(640px, 90vw)',
        margin: '0 auto',
        boxShadow:
          'inset -1.5px -1.5px 0 0 var(--win-border-dark), inset 1.5px 1.5px 0 0 var(--win-shadow-light), inset -3px -3px 0 0 var(--win-shadow-dark), inset 3px 3px 0 0 var(--win-border-light)',
      }
    : {
        transform: `translate(${position.x}px, ${position.y}px)`,
      }

  return (
    <div
      ref={windowRef}
      id={`window-${id}`}
      className={containerClass}
      style={styleOverrides}
      onClick={onActivate}
    >
      <div className="flex flex-col justify-between max-w-[calc(100vw-36px)] max-h-[calc(100vh-44px-12px)] min-w-[250px] min-h-[300px] overflow-hidden bg-win-bg">
        <nav
          ref={navRef}
          className={`flex items-center justify-between h-7 px-0.5 text-white ${
            isMobile ? 'cursor-default' : 'cursor-move'
          } ${isActive ? 'bg-win-nav-active' : 'bg-win-nav'}`}
        >
          <h3 className="flex items-center justify-start w-[calc(100%-69px)] m-0 leading-7 px-0.5">
            <span>{title}</span>
          </h3>
          <div className="flex">
            <button
              className="win-nav-button close ml-0.5"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              tabIndex={0}
            >
              <div
                className="w-3 h-2.5"
                style={{
                  backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOHB4IiBoZWlnaHQ9IjdweCIgdmlld0JveD0iMCAwIDggNyIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgPHBvbHlnb24gc3Ryb2tlPSJub25lIiBmaWxsPSIjMjYzMjM4IiBwb2ludHM9IjMgMyAyIDMgMiAyIDEgMiAxIDEgMCAxIDAgMCAyIDAgMiAxIDMgMSAzIDIgNSAyIDUgMSA2IDEgNiAwIDggMCA4IDEgNyAxIDcgMiA2IDIgNiAzIDUgMyA1IDQgNiA0IDYgNSA3IDUgNyA2IDggNiA4IDcgNiA3IDYgNiA1IDYgNSA1IDMgNSAzIDYgMiA2IDIgNyAwIDcgMCA2IDEgNiAxIDUgMiA1IDIgNCAzIDQiPjwvcG9seWdvbj4KPC9zdmc+")`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </button>
          </div>
        </nav>
        <div className="window-content flex flex-col flex-grow overflow-auto bg-win-bg min-h-0">
          {children}
        </div>
      </div>
    </div>
  )
}

