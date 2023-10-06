import { Game_Temp } from '../../rmmz_objects'

Game_Temp.prototype.initialize = function () {
  // EDIT: Changed to check the NODE_ENV_ELECTRON_VITE env variable.
  this._isPlaytest = window.electron.process.env.NODE_ENV_ELECTRON_VITE === 'development'
  this._destinationX = null
  this._destinationY = null
  this._touchTarget = null
  this._touchState = ''
  this._needsBattleRefresh = false
  this._commonEventQueue = []
  this._animationQueue = []
  this._balloonQueue = []
  this._lastActionData = [0, 0, 0, 0, 0, 0]
}

export { Game_Temp }
