import { useState, useEffect } from 'react'
import Desktop from './components/Desktop'
import StartMenu from './components/StartMenu'
import Window from './components/Window'
import P5Canvas from './components/P5Canvas'

function App() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [activeWindow, setActiveWindow] = useState<string | null>('welcome')
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)

  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false)
  
  // Initialize with system preference or default (light) -> Changed to default Dark (Teal) per request
  const [isDarkMode, setIsDarkMode] = useState(true)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.start-menu') && !target.closest('.win-start-button')) {
        setIsStartMenuOpen(false)
      }
      if (!target.closest('.window') && !target.closest('.desktop-icon')) {
        // Keep window active if clicking inside it
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial check
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Prevent default arrow key and spacebar behavior for p5.js game
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])



  const renderMobileView = () => {
    // Calculate responsive dimensions for mobile
    // Use 90% of window width, but max out at some reasonable size if needed
    // Maintain aspect ratio or just fill available space? 
    // User said "percentage appropriately" for mobile.
    const canvasWidth = Math.min(windowSize.width * 0.9, 512)
    const canvasHeight = canvasWidth * 0.75 // 4:3 aspect ratio

    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-start px-4 py-6 ${isDarkMode ? 'dark-mode' : ''}`} style={{ backgroundColor: 'var(--body-bg)' }}>
        {isWelcomeOpen && (
          <Window
            id="welcome"
            title="My Homepage"
            isActive
            isMobile
            onActivate={() => setActiveWindow('welcome')}
            onClose={() => {
              setIsWelcomeOpen(false)
              setShowCanvas(false)
            }}
          >
            {showCanvas ? (
              <div className="flex flex-col flex-grow min-h-0 w-full h-full items-center justify-center">
                <P5Canvas width={canvasWidth} height={canvasHeight} isMobile={true} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow w-full">
                <div className="p-4 flex justify-center items-center">
                  <div
                    className="bg-cover bg-center"
                    style={{
                      width: `${Math.min(windowSize.width * 0.8, 360)}px`,
                      height: `${Math.min(windowSize.width * 0.8, 360) * (338/360)}px`,
                      boxShadow: 'inset -1.5px -1.5px 0 0 var(--win-border-light), inset 1.5px 1.5px 0 0 var(--win-shadow-dark)',
                      backgroundImage: 'url("./assets/main.png")',
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center items-center py-4 bg-win-bg">
                  <button
                    className="win-button font-bold"
                    onClick={() => setShowCanvas(true)}
                    style={{
                      boxShadow:
                        'inset -3px -3px 0 0 var(--win-border-dark), inset 1.5px 1.5px 0 0 var(--win-border-dark), inset -4.5px -4.5px 0 0 var(--win-shadow-dark), inset 3px 3px 0 0 var(--win-border-light)',
                    }}
                  >
                    <span className="start-btn">START</span>
                  </button>
                </div>
              </div>
            )}
          </Window>
        )}
      </div>
    )
  }



  return (
    <main className={`relative w-full h-screen overflow-hidden ${isDarkMode ? 'dark-mode' : ''}`} style={{ backgroundColor: 'var(--body-bg)' }}>
      {isMobile ? (
        renderMobileView()
      ) : (
        <>
          <Desktop
            isWelcomeOpen={isWelcomeOpen}
            setIsWelcomeOpen={setIsWelcomeOpen}
            activeWindow={activeWindow}
            setActiveWindow={setActiveWindow}
            isMobile={isMobile}
            isSystemInfoOpen={isSystemInfoOpen}
            setIsSystemInfoOpen={setIsSystemInfoOpen}
            onToggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
          />
          <StartMenu
            isOpen={isStartMenuOpen}
            setIsOpen={setIsStartMenuOpen}
            onSystemInfoClick={() => {
              setIsSystemInfoOpen(true)
              setActiveWindow('system-info')
              setIsStartMenuOpen(false)
            }}
          />
        </>
      )}
    </main>
  )
}

export default App


