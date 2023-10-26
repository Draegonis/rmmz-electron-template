import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Components
import { RMMZinject } from './RMMZinject'
import { Game } from './Game'
// Managers
import { AppManager } from '../managers/appManager'

window.$APP = AppManager

window.Imported = window.Imported || {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RMMZinject />
    <Game />
  </StrictMode>
)
