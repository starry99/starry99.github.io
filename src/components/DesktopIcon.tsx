import { useRef } from 'react'
import { useDraggable } from '../hooks/useDraggable'

interface DesktopIconProps {
  icon: string
  label: string
  onClick: () => void
  initialPosition?: { x: number, y: number }
}

export default function DesktopIcon({ icon, label, onClick, initialPosition = { x: 0, y: 0 } }: DesktopIconProps) {
  const iconRef = useRef<HTMLLabelElement>(null)
  const { position } = useDraggable(iconRef, iconRef, { initialPosition }) 

  const getIconUrl = () => {
    switch (icon) {
      case 'exe':
        return './assets/game.png'
      case 'paint':
        return './assets/wallpaper.png'
      default:
        return './assets/exe.png'
    }
  }
  const x = position.x
  const y = position.y

  return (
    <label
      ref={iconRef}
      className="desktop-icon label-exe"
      onClick={onClick}
      onDoubleClick={onClick}
      tabIndex={0}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <div
        className="w-12 h-12 mb-1.5 pointer-events-none"
        style={{
          backgroundImage: `url("${getIconUrl()}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      />
      <span className="pointer-events-none">{label}</span>
    </label>
  )
}