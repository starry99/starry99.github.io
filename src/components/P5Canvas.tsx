import { useEffect, useRef } from 'react'
import p5 from 'p5'
import { makeWorld } from '../game/world'


interface P5CanvasProps {
  width?: number
  height?: number
}

export default function P5Canvas({ width = 512, height = 384 }: P5CanvasProps) {
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

  return (
    <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      <div
        ref={containerRef}
        className="flex items-center justify-center bg-black w-full h-full"
      />
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
    </div>
  )
}

