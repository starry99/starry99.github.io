import { useEffect, useRef } from 'react'
import p5 from 'p5'
import { makeWorld } from '../game/world'


interface P5CanvasProps {
  width?: number
  height?: number
  isMobile?: boolean
  worldRef?: React.MutableRefObject<ReturnType<typeof makeWorld> | null>
}

export default function P5Canvas({ width = 512, height = 384, isMobile = false, worldRef: externalWorldRef }: P5CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<p5 | null>(null)
  const internalWorldRef = useRef<ReturnType<typeof makeWorld> | null>(null)
  
  const worldRef = externalWorldRef || internalWorldRef

  useEffect(() => {
    if (!containerRef.current) return

    const sketch = (p: p5) => {
      let font: p5.Font | null = null
      let world: ReturnType<typeof makeWorld> | null = null

      p.preload = () => {
        try {
          font = p.loadFont('/assets/power-clear.ttf')
          world = makeWorld(p)
          worldRef.current = world
          world.load()
        } catch (error) {
          console.error('P5Canvas: preload error', error)
        }
      }

      p.setup = () => {
        try {
          if (!world) return

          const canvasEl = p.createCanvas(width, height, containerRef.current!)
          p.pixelDensity(3)
          const canvas = (canvasEl as any).canvas
          if (canvas) {
            canvas.style.width = '100%'
            canvas.style.height = '100%'
            canvas.style.objectFit = 'contain'
          }

          if (font) {
            p.textFont(font)
          }
          p.noSmooth()

          world.setup()
        } catch (error) {
          console.error('P5Canvas: setup error', error)
        }
      }

      p.draw = () => {
        try {
          if (world) {
            world.update()
            world.draw()
          }
        } catch (error) {
          console.error('P5Canvas: draw error', error)
        }
      }

      p.keyPressed = () => {
        if (world && world.keyPressed) {
          world.keyPressed()
        }
      }

      p.mousePressed = () => {
        if (world && world.mousePressed) {
          if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            world.mousePressed()
          }
        }
      }

      p.keyReleased = () => {
        if (world) {
          world.keyReleased()
        }
      }
    }

    p5InstanceRef.current = new p5(sketch, containerRef.current!)

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove()
        p5InstanceRef.current = null
        worldRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (p5InstanceRef.current) {
      p5InstanceRef.current.resizeCanvas(width, height)
    }
  }, [width, height])

  return (
    <div className="relative">
      {/* Canvas Container */}
      <div style={{ width: `${width}px`, height: `${height}px` }}>
        <div
          ref={containerRef}
          className="flex items-center justify-center bg-black w-full h-full"
        />
      </div>
      
      {/* Desktop Controls: Gender Selection (overlaid at bottom) */}
      {!isMobile && (
        <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4 pointer-events-none">
          <button 
            className="pointer-events-auto win-button font-bold text-base"
            onClick={() => {
              if (worldRef.current) {
                worldRef.current.setPlayerGender('male')
                const canvas = containerRef.current?.querySelector('canvas')
                if (canvas instanceof HTMLElement) canvas.focus()
              }
            }}
          >
            Male
          </button>
          <button 
            className="pointer-events-auto win-button font-bold text-base"
            onClick={() => {
              if (worldRef.current) {
                worldRef.current.setPlayerGender('female')
                const canvas = containerRef.current?.querySelector('canvas')
                if (canvas instanceof HTMLElement) canvas.focus()
              }
            }}
          >
            Female
          </button>
        </div>
      )}
    </div>
  )
}

// Separate Mobile Controls Component
interface MobileControlsProps {
  worldRef: React.MutableRefObject<ReturnType<typeof makeWorld> | null>
}

export function MobileControls({ worldRef }: MobileControlsProps) {
  const lastInteractTime = useRef(0)

  const handleMoveStart = (e: React.TouchEvent | React.MouseEvent, direction: 'up' | 'down' | 'left' | 'right') => {
    e.preventDefault()
    e.stopPropagation()
    if (worldRef.current) {
      worldRef.current.startMove(direction)
    }
  }

  const handleMoveEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (worldRef.current) {
      worldRef.current.stopMove()
    }
  }

  const handleInteract = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Debounce: prevent rapid firing (300ms cooldown)
    const now = Date.now()
    if (now - lastInteractTime.current < 300) return
    lastInteractTime.current = now

    if (worldRef.current) {
      worldRef.current.interact()
    }
  }

  return (
    <div className="w-full flex justify-between items-center px-8 py-3" style={{ touchAction: 'none' }}>
      {/* D-Pad */}
      <div className="relative w-28 h-28">
        {/* Up */}
        <button
          className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 win-button flex items-center justify-center text-xl font-bold select-none"
          onTouchStart={(e) => handleMoveStart(e, 'up')}
          onTouchEnd={handleMoveEnd}
          onMouseDown={(e) => handleMoveStart(e, 'up')}
          onMouseUp={handleMoveEnd}
          onMouseLeave={handleMoveEnd}
        >
          ▲
        </button>
        {/* Down */}
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 win-button flex items-center justify-center text-xl font-bold select-none"
          onTouchStart={(e) => handleMoveStart(e, 'down')}
          onTouchEnd={handleMoveEnd}
          onMouseDown={(e) => handleMoveStart(e, 'down')}
          onMouseUp={handleMoveEnd}
          onMouseLeave={handleMoveEnd}
        >
          ▼
        </button>
        {/* Left */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 win-button flex items-center justify-center text-xl font-bold select-none"
          onTouchStart={(e) => handleMoveStart(e, 'left')}
          onTouchEnd={handleMoveEnd}
          onMouseDown={(e) => handleMoveStart(e, 'left')}
          onMouseUp={handleMoveEnd}
          onMouseLeave={handleMoveEnd}
        >
          ◀
        </button>
        {/* Right */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 win-button flex items-center justify-center text-xl font-bold select-none"
          onTouchStart={(e) => handleMoveStart(e, 'right')}
          onTouchEnd={handleMoveEnd}
          onMouseDown={(e) => handleMoveStart(e, 'right')}
          onMouseUp={handleMoveEnd}
          onMouseLeave={handleMoveEnd}
        >
          ▶
        </button>
      </div>

      {/* Action Button */}
      <button
        className="w-14 h-14 win-button flex items-center justify-center text-lg font-bold select-none"
        onTouchEnd={handleInteract}
        onMouseUp={handleInteract}
      >
        A
      </button>
    </div>
  )
}

