import { Scene_Options, Scene_MenuBase } from '../../rmmz_scenes'
import { Rectangle } from '../../rmmz_core'
// Edited
import { Graphics, ConfigManager } from '../editsIndex'
// Custom
import { Window_Text } from '../../custom/windows/utility/text'
// Helper
import { equals as r_equals } from 'ramda'

// Edit: Add temp window min size to be compared when config is saved..
Scene_Options.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)

  ConfigManager.tempWindowSize[0] = ConfigManager.window.minWidth
  ConfigManager.tempWindowSize[1] = ConfigManager.window.minHeight
  // In case fullscreen is toggled by hotkey change config value to Graphics._isFullScreen
  // which is always up to date. This is saved on electron side when the hotkey is pressed
  // but don't want circular dependency importing ConfigManager into rmmz_core.js in order
  // to set the config value there.
  ConfigManager.tempFullScreen = Graphics._isFullScreen
  ConfigManager.window.fullScreen = Graphics._isFullScreen

  this.createOptionsWindow()
  // Edit: Added an info window to scene.
  this.createInfoWindow()
}

// Edit: Determine if the window needs to be resized.
Scene_Options.prototype.terminate = function () {
  const currentSize = [ConfigManager.window.minWidth, ConfigManager.window.minHeight]
  const fullScreen = ConfigManager.window.fullScreen

  ConfigManager.save()

  // Edit: Enter or exit fullscreen based on config fullscreen value.
  if (!r_equals(ConfigManager.tempFullScreen, fullScreen)) {
    // This is saved at the end with everything else.
    if (fullScreen) {
      Graphics._requestFullScreen(false)
    } else {
      Graphics._cancelFullScreen(false)
    }
  }

  if (!r_equals(ConfigManager.tempWindowSize, currentSize) && currentSize[0] !== 1) {
    window.electron.ipcRenderer.send('resizeWindow', [
      ConfigManager.window.minWidth,
      ConfigManager.window.minHeight,
      ConfigManager.window.ratio
    ])

    Graphics.resize(...currentSize)
    Graphics.defaultScale = Graphics._realScale
    // Edit: Update UI
    this.adjustBoxSize()
  }

  Scene_MenuBase.prototype.terminate.call(this)
}

Scene_Options.prototype.optionsWindowRect = function () {
  const n = Math.min(this.maxCommands(), this.maxVisibleCommands())
  // Edit: Increased width slightly.
  const ww = 450
  const wh = this.calcWindowHeight(n, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

// Edit: New info window with certain information.
Scene_Options.prototype.createInfoWindow = function () {
  // WIP: Add a way for custom text?
  const ww = 735
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = 0
  this._infoWindow = new Window_Text(
    new Rectangle(wx, wy, ww, 56),
    'Full Screen and Window Size will update when you exit.',
    'center'
  )
  this.addWindow(this._infoWindow)
  this._infoWindow.open()
}

Scene_Options.prototype.maxCommands = function () {
  // Increase this value when adding option items.
  return 9
}

export { Scene_Options }
