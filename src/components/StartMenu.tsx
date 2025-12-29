import Clock from './Clock'

interface StartMenuProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onSystemInfoClick: () => void
}

export default function StartMenu({ isOpen, setIsOpen, onSystemInfoClick }: StartMenuProps) {

  return (
    <>
      <div
        className="invisible absolute bottom-0 left-0 w-full h-0.5 bg-win-shadow-dark"
        id="start-menu-outline"
      />
      <nav className="start-menu absolute z-[1000000] bottom-0 left-0 w-full h-11 bg-win-bg flex items-center pt-0.5">
        <button
          className={`win-start-button ml-0.5 pr-2 ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
        >
          <div
            className="w-6 h-5 mr-1.5 flex-shrink-0"
            style={{
              backgroundImage: 'url("./assets/windows.png")',
              backgroundSize: '24px 21px',
              backgroundRepeat: 'no-repeat',
            }}
          />
          Start
        </button>
        <div className="flex-grow" />
        <div 
          className="whitespace-nowrap overflow-hidden text-ellipsis grid place-items-center h-[34px] px-2 mx-0.5"
          style={{
            boxShadow: 'inset -1.5px -1.5px 0 0 #fcfcfc, inset 1.5px 1.5px 0 0 #a099a1',
          }}
        >
          <Clock />
        </div>
      </nav>
      {isOpen && (
        <div
          className="absolute bottom-11 left-1 z-[4] bg-win-bg p-1"
          style={{
            boxShadow: 'inset -1.5px -1.5px 0 0 #263238, inset 1.5px 1.5px 0 0 #fcfcfc, inset -3px -3px 0 0 #a099a1, inset 3px 3px 0 0 #dedcde',
            minWidth: '200px',
          }}
        >
          <div className="flex">
            <div className="w-8 bg-[#8e9699]" />
            <menu className="menu main-menu m-0 p-0 list-none">
              <li className="border-b-[1.5px] border-win-shadow-dark">
                <label 
                  className="win-menu-item cursor-pointer h-[50px]"
                  onClick={onSystemInfoClick}
                >
                  <div
                    className="w-12 h-12 mr-2.5 flex-shrink-0"
                    style={{
                      backgroundImage: 'url("./assets/info.png")',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'contain',
                    }}
                  />
                  <span><span className="underline">S</span>ystem Info</span>
                </label>
              </li>

            </menu>
          </div>
        </div>
      )}
    </>
  )
}

