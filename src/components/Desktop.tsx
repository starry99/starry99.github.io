import { useState, useEffect } from 'react'
import DesktopIcon from './DesktopIcon'
import Window from './Window'
import P5Canvas from './P5Canvas'

interface DesktopProps {
  isWelcomeOpen: boolean
  setIsWelcomeOpen: (open: boolean) => void
  activeWindow: string | null
  setActiveWindow: (window: string | null) => void
  isMobile: boolean
  isSystemInfoOpen: boolean
  setIsSystemInfoOpen: (open: boolean) => void
  onToggleDarkMode: () => void
  isDarkMode: boolean
}

export default function Desktop({ 
  isWelcomeOpen, 
  setIsWelcomeOpen, 
  activeWindow, 
  setActiveWindow, 
  isMobile,
  isSystemInfoOpen,
  setIsSystemInfoOpen,
  onToggleDarkMode,
  isDarkMode
}: DesktopProps) {
  const [showCanvas, setShowCanvas] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 384 })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      if (width >= 1440 && height >= 1100) { 
        setCanvasSize({ width: 1280, height: 960 })
      } else if (width >= 1024) {
        setCanvasSize({ width: 800, height: 600 })
      } else {
        setCanvasSize({ width: 512, height: 384 })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleIconClick = (windowId: string) => {
    setIsWelcomeOpen(true)
    setActiveWindow(windowId)
  }

  const handleStartClick = () => {
    setShowCanvas(true)
  }

  return (
    <div id="desktop" className="absolute top-0 left-0 w-full h-[calc(100vh-44px)]">
      <div id="icons" className="relative z-[1] h-full w-full">
        <DesktopIcon
          icon="exe"
          label="My Homepage"
          onClick={() => handleIconClick('welcome')}
          initialPosition={{ x: 20, y: 20 }}
        />
        <DesktopIcon
          icon="paint" 
          label={isDarkMode ? "Light Mode" : "Dark Mode"}
          onClick={onToggleDarkMode}
          initialPosition={{ x: 20, y: 120 }}
        />

      </div>
      <div id="windows" className="absolute top-0 left-0 w-full h-[calc(100%+44px)] pb-11 grid place-items-center">
        {isWelcomeOpen && (
          <Window
            id="welcome"
            title="My Homepage"
            isActive={activeWindow === 'welcome'}
            onActivate={() => setActiveWindow('welcome')}
            onClose={() => {
              setIsWelcomeOpen(false)
              setShowCanvas(false)
            }}
            isMobile={isMobile}
          >
            {showCanvas ? (
              <div className="flex flex-col flex-grow min-h-0 w-full h-full items-center justify-center">
                <P5Canvas width={canvasSize.width} height={canvasSize.height} />
              </div>
            ) : (
              <>
                <div className="p-5 self-center flex justify-center items-center flex-grow min-h-0">
                  <div
                    className="w-[420px] h-[420px] bg-cover bg-center flex-shrink-0"
                    style={{
                      boxShadow: 'inset -1.5px -1.5px 0 0 var(--win-border-light), inset 1.5px 1.5px 0 0 var(--win-shadow-dark)',
                      backgroundImage: 'url("./assets/main.png")',
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center items-center pb-[19px] bg-win-bg">
                  <button 
                    className="win-button font-bold"
                    onClick={handleStartClick}
                    style={{
                      boxShadow: 'inset -3px -3px 0 0 var(--win-border-dark), inset 1.5px 1.5px 0 0 var(--win-border-dark), inset -4.5px -4.5px 0 0 var(--win-shadow-dark), inset 3px 3px 0 0 var(--win-border-light)',
                    }}
                  >
                    <span className="start-btn">START</span>
                  </button>
                </div>
              </>
            )}
          </Window>
        )}

        {isSystemInfoOpen && (
          <Window
            id="system-info"
            title="System Info"
            isActive={activeWindow === 'system-info'}
            onActivate={() => setActiveWindow('system-info')}
            onClose={() => setIsSystemInfoOpen(false)}
            isMobile={isMobile}
          >
            <div className="w-90 p-4 bg-win-bg flex flex-col font-pixel text-sm">
              <div className="flex gap-4 mb-6 mt-2">
                <div className="flex flex-col justify-center gap-1">
                  <p>Last Updated: 25.12.30</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="mb-1">Registered to:</p>
                <div className="pl-4">Starry99
                </div>
              </div>
              <div>
                <p className="mb-1">Credits:</p>
                <div 
                  className="w-full h-32 p-2 bg-white overflow-y-auto whitespace-pre-line select-text leading-snug"
                  style={{
                    boxShadow: 'inset 1.5px 1.5px 0 0 #404040, inset -1.5px -1.5px 0 0 #fff'
                  }}
                >
                  <p className="text-sm" >Code Ref: <a href="https://codepen.io/gabriellewee/pen/MWqRZzp" target='_blank'>Gabrielle Wee</a>, <a href="https://github.com/JSLegendDev/Pokemon-p5js" target='_blank'>JSLegendDev</a></p>
                  <p className="text-sm">Tilesets: <a href="https://www.deviantart.com/akizakura16/art/Hi-res-Interior-General-Tileset-588725678" target='_blank'>Akizakura16</a>, <a href="https://www.deviantart.com/tobalcr/art/POKEMON-BW-CHRISTMAS-TILESET-FOR-POKEMON-FANGAMES-1131592133" target='_blank'>TobalCR</a></p>
                  <p className="text-sm">Character: <a href="https://www.pokecommunity.com/threads/fire-red-overworld-sprite-resource.407124" target='_blank'>Kalarie</a>, <a href="https://www.deviantart.com/lolw3e932/art/NPC-32-729485034" target='_blank'>Lolw3e932</a>, <a href="https://www.deviantart.com/aveontrainer/art/Rich-Boy-815899381" target='_blank'>aveontrainer</a></p>
                </div>
              </div>
            </div>
          </Window>
        )}
      </div>
    </div>
  )
}

