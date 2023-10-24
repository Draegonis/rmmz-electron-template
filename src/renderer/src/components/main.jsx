import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RMMZinject } from './RMMZinject'
import { Game } from './Game'

window.Imported = window.Imported || {}

// Add the Game name and text data onto the window object.
window.$APP_NAME = window.electron.process.env.npm_package_productName
window.$TEST = window.$TEST || {}

// Setup window.$TEST_ENV, and if needed other things.
if (import.meta.env.DEV) {
  switch (import.meta.env.RENDERER_VITE_ISOPTIONVALID) {
    case 'battle': {
      try {
        const battleTest = JSON.parse(import.meta.env.RENDERER_VITE_BATTLETEST)
        window.$TEST.ENV = 'battle'
        window.$TEST.BATTLERS = battleTest.testBattlers
        window.$TEST.TROOPID = battleTest.testTroopId
      } catch (e) {
        throw new Error('Failed to JSON parse RENDERER_VITE_BATTLETEST.')
      }
      break
    }
    case 'skiptitle': {
      window.$TEST.ENV = 'skiptitle'
      break
    }
    default: {
      window.$TEST.ENV = 'NONE'
    }
  }
}

window.INDICATORS = window.INDICATORS || {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RMMZinject />
    <Game />
  </StrictMode>
)
