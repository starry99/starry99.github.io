import { useEffect, useRef } from 'react'
import p5 from 'p5'
import { makeWorld } from '../game/world'


interface P5CanvasProps {
  width?: number
  height?: number
  isMobile?: boolean
}

export default function P5Canvas({ width = 512, height = 384, isMobile = false }: P5CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<p5 | null>(null)
  const worldRef = useRef<ReturnType<typeof makeWorld> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sketch = (p: p5) => {
      let font: p5.Font | null = null
      let world: ReturnType<typeof makeWorld> | null = null

      p.preload = () => {
        try {
          console.log('P5Canvas: preload started')
          font = p.loadFont(
            '/assets/power-clear.ttf',
            () => {
              console.log('P5Canvas: font loaded successfully')
            },
            (err: any) => {
              console.error('P5Canvas: font load error', err)
            }
          )
          world = makeWorld(p)
          worldRef.current = world
          try {
            world.load()
            console.log('P5Canvas: world.load() called')
          } catch (error) {
            console.error('P5Canvas: world.load() error', error)
          }
          console.log('P5Canvas: preload function completed', { font, world })
        } catch (error) {
          console.error('P5Canvas: preload error', error)
        }
      }

      p.setup = () => {
        try {
          console.log('P5Canvas: setup started', { font, world, container: containerRef.current })

          if (!world) {
            console.error('P5Canvas: world not loaded')
            return
          }

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
          console.log('P5Canvas: setup completed')
        } catch (error) {
          console.error('P5Canvas: setup error', error)
          console.error('P5Canvas: setup error stack', (error as Error).stack)
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

  const handleMoveStart = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (worldRef.current) {
      worldRef.current.startMove(direction)
    }
  }

  const handleMoveEnd = () => {
    if (worldRef.current) {
      worldRef.current.stopMove()
    }
  }

  const handleInteract = () => {
    if (worldRef.current) {
      worldRef.current.interact()
    }
  }

  return (
    <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      <div
        ref={containerRef}
        className="flex items-center justify-center bg-black w-full h-full"
      />
      
      {isMobile ? (
        /* Mobile Controls: D-pad + Action Button */
        <div className="absolute bottom-2 left-0 w-full flex justify-between items-end px-4 pointer-events-none">
          {/* D-Pad */}
          <div className="relative w-28 h-28 pointer-events-auto">
            {/* Up */}
            <button
              className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 win-button flex items-center justify-center text-xl font-bold"
              onTouchStart={() => handleMoveStart('up')}
              onTouchEnd={handleMoveEnd}
              onMouseDown={() => handleMoveStart('up')}
              onMouseUp={handleMoveEnd}
              onMouseLeave={handleMoveEnd}
            >
              ▲
            </button>
            {/* Down */}
            <button
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 win-button flex items-center justify-center text-xl font-bold"
              onTouchStart={() => handleMoveStart('down')}
              onTouchEnd={handleMoveEnd}
              onMouseDown={() => handleMoveStart('down')}
              onMouseUp={handleMoveEnd}
              onMouseLeave={handleMoveEnd}
            >
              ▼
            </button>
            {/* Left */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 win-button flex items-center justify-center text-xl font-bold"
              onTouchStart={() => handleMoveStart('left')}
              onTouchEnd={handleMoveEnd}
              onMouseDown={() => handleMoveStart('left')}
              onMouseUp={handleMoveEnd}
              onMouseLeave={handleMoveEnd}
            >
              ◀
            </button>
            {/* Right */}
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 win-button flex items-center justify-center text-xl font-bold"
              onTouchStart={() => handleMoveStart('right')}
              onTouchEnd={handleMoveEnd}
              onMouseDown={() => handleMoveStart('right')}
              onMouseUp={handleMoveEnd}
              onMouseLeave={handleMoveEnd}
            >
              ▶
            </button>
          </div>

          {/* Action Button */}
          <button
            className="pointer-events-auto w-14 h-14 win-button flex items-center justify-center text-sm font-bold rounded-full"
            onTouchStart={handleInteract}
            onMouseDown={handleInteract}
          >
            A
          </button>
        </div>
      ) : (
        /* Desktop Controls: Gender Selection */
        <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4 pointer-events-none">
          <button 
            className="pointer-events-auto win-button font-bold text-base"
            onClick={() => {
              if (worldRef.current) {
                worldRef.current.setPlayerGender('male');
                const canvas = containerRef.current?.querySelector('canvas');
                if (canvas instanceof HTMLElement) canvas.focus();
              }
            }}
          >
            Male
          </button>
          <button 
            className="pointer-events-auto win-button font-bold text-base"
            onClick={() => {
              if (worldRef.current) {
                worldRef.current.setPlayerGender('female');
                const canvas = containerRef.current?.querySelector('canvas');
                if (canvas instanceof HTMLElement) canvas.focus();
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

