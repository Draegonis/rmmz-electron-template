import { Scene_Boot, Scene_Base } from '../../rmmz_scenes'
// Edited
import { DataManager, ConfigManager, Graphics } from '../editsIndex'

// EDIT: Removed StorageManager.updateForageKeys()
Scene_Boot.prototype.create = function () {
  Scene_Base.prototype.create.call(this)
  DataManager.loadDatabase()
}

// EDIT: Removed && StorageManager.forageKeysUpdated() in if statement.
Scene_Boot.prototype.isReady = function () {
  if (!this._databaseLoaded) {
    if (DataManager.isDatabaseLoaded()) {
      this._databaseLoaded = true
      this.onDatabaseLoaded()
    }
    return false
  }
  return Scene_Base.prototype.isReady.call(this) && this.isPlayerDataLoaded()
}

Scene_Boot.prototype.resizeScreen = function () {
  const { minWidth, minHeight, fullScreen } = ConfigManager.window

  // EDIT: Set electron min width/height
  Graphics.resize(minWidth, minHeight)
  // Edit: Scale is set by graphics itself.
  Graphics.defaultScale = Graphics._realScale

  this.adjustBoxSize()
  // Edit: Remove adjust window, since the window is adjusted by electron.

  // EDIT: check and set fullscreen.
  if (fullScreen) {
    Graphics._requestFullScreen(false)
  }
}

// EDIT: These are removed since they are not needed.
delete Scene_Boot.adjustWindow
delete Scene_Boot.screenScale

export { Scene_Boot }
