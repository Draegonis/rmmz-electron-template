import {
  Scene_Base,
  Scene_Boot,
  Scene_Title,
  Scene_Menu,
  Scene_Options,
  Scene_GameEnd,
  Scene_MenuBase
} from '../rmmz_scenes'
import { AudioManager, SceneManager } from '../rmmz_managers'
import { Rectangle } from '../rmmz_core'
// Import edited ones not the originals.
import { DataManager, ConfigManager } from './managers_edits'
import { Graphics } from './core_edits'
import { Window_TitleCommand, Window_MenuCommand, Window_GameEnd } from './window_edits'
// Import new custom
import { Window_ConfirmCommand } from '../custom/windows/utility/confirmCommand'
import { Window_Text } from '../custom/windows/utility/text'
import { Scene_Controls } from '../custom/scenes/controls/controls'
// Helpers
import { equals as r_equals } from 'ramda'

//==========================================================================
// Common Code

// Window_ConfirmCommand functionality in Scene_Title and Scene_GameEnd
const switchToConfirm = function () {
  this._commandWindow.close()
  // free up old command window for garbage collection
  this._commandWindow = null

  const ww = this.mainCommandWidth()
  const wh = this.calcWindowHeight(2, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = Graphics.boxHeight - wh - 96

  const rect = new Rectangle(wx, wy, ww, wh)

  this._commandWindow = new Window_ConfirmCommand(rect)
  this._commandWindow.setBackgroundType(0)

  this._commandWindow.setHandler('confirmYes', this.commandConfirmYes.bind(this))
  this._commandWindow.setHandler('confirmNo', this.commandConfirmNo.bind(this))
  this._commandWindow.setHandler('cancel', this.commandConfirmNo.bind(this))

  if (!this._confirmText) {
    this._confirmText = new Window_Text(
      new Rectangle(wx + 20, wy - 75, 200, 60),
      'Are you sure?',
      'center'
    )
    this.addWindow(this._confirmText)
  }
  this._confirmText.open()

  this.addWindow(this._commandWindow)
  this._commandWindow.open()
}

const switchToCommand = function () {
  this._commandWindow.close()
  this._confirmText.close()
  this.createCommandWindow()
}

const commandQuitConfirmed = function () {
  this._commandWindow.close()
  this._confirmText.close()
  AudioManager.stopBgm()
  AudioManager.stopBgs()
  window.electron.ipcRenderer.send('quit-game')
}

//==========================================================================
// SCENE_BOOT EDITS

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

//==========================================================================
// SCENE_TITLE EDITS

Scene_Title.prototype.initialize = function () {
  Scene_Base.prototype.initialize.call(this)
  this.switchToConfirm = switchToConfirm.bind(this)
  this.switchToCommand = switchToCommand.bind(this)
  this.commandQuitConfirmed = commandQuitConfirmed.bind(this)
}

Scene_Title.prototype.drawGameTitle = function () {
  const x = 20
  const y = Graphics.height / 4
  const maxWidth = Graphics.width - x * 2
  // EDIT: changed to window.$APP_NAME to create a single source of truth for the game name.
  const text = window.$APP_NAME
  const bitmap = this._gameTitleSprite.bitmap
  bitmap.fontFace = window.$gameSystem.mainFontFace()
  bitmap.outlineColor = 'black'
  bitmap.outlineWidth = 8
  bitmap.fontSize = 72
  bitmap.drawText(text, x, y, maxWidth, 48, 'center')
}

Scene_Title.prototype.createCommandWindow = function () {
  const background = window.$dataSystem.titleCommandWindow.background
  const rect = this.commandWindowRect()
  this._commandWindow = new Window_TitleCommand(rect)
  this._commandWindow.setBackgroundType(background)
  this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this))
  this._commandWindow.setHandler('continue', this.commandContinue.bind(this))
  this._commandWindow.setHandler('options', this.commandOptions.bind(this))
  // EDIT: Add controls button to title.
  this._commandWindow.setHandler('controls', this.commandControls.bind(this))
  // EDIT: Add quit game button to title.
  this._commandWindow.setHandler('quitGame', this.commandQuitGame.bind(this))
  this.addWindow(this._commandWindow)
}

Scene_Title.prototype.commandWindowRect = function () {
  const offsetX = window.$dataSystem.titleCommandWindow.offsetX
  const offsetY = window.$dataSystem.titleCommandWindow.offsetY
  const ww = this.mainCommandWidth()
  // EDIT: Increased from 3 -> 5 for the new controls and quit game button.
  const wh = this.calcWindowHeight(5, true)
  const wx = (Graphics.boxWidth - ww) / 2 + offsetX
  const wy = Graphics.boxHeight - wh - 96 + offsetY + 50
  return new Rectangle(wx, wy, ww, wh)
}

// EDIT: add command controls to title screen.
Scene_Title.prototype.commandControls = function () {
  SceneManager.push(Scene_Controls)
}

// ==========================================================
// EDIT: Add the quit game command, with a text window.
Scene_Title.prototype.commandQuitGame = function () {
  this.switchToConfirm()
}

// EDIT: Added confirm Yes / No command.
Scene_Title.prototype.commandConfirmYes = function () {
  this.commandQuitConfirmed()
}

Scene_Title.prototype.commandConfirmNo = function () {
  this.switchToCommand()
}

//==========================================================================
// SCENE_MENU EDITS

Scene_Menu.prototype.createCommandWindow = function () {
  const rect = this.commandWindowRect()
  const commandWindow = new Window_MenuCommand(rect)
  commandWindow.setHandler('item', this.commandItem.bind(this))
  commandWindow.setHandler('skill', this.commandPersonal.bind(this))
  commandWindow.setHandler('equip', this.commandPersonal.bind(this))
  commandWindow.setHandler('status', this.commandPersonal.bind(this))
  commandWindow.setHandler('formation', this.commandFormation.bind(this))
  commandWindow.setHandler('options', this.commandOptions.bind(this))
  // Edit: Add option for editting controls.
  commandWindow.setHandler('controls', this.commandControls.bind(this))
  commandWindow.setHandler('save', this.commandSave.bind(this))
  commandWindow.setHandler('gameEnd', this.commandGameEnd.bind(this))
  commandWindow.setHandler('cancel', this.popScene.bind(this))
  this.addWindow(commandWindow)
  this._commandWindow = commandWindow
}

// Edit: Add commandControls menu option.
Scene_Menu.prototype.commandControls = function () {
  SceneManager.push(Scene_Controls)
}

//==========================================================================
// SCENE_OPTIONS EDITS

// Edit: Add temp window min size to be compaired when config is saved..
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

//==========================================================================
// SCENE_GAMEEND EDITS

Scene_GameEnd.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
  this.switchToConfirm = switchToConfirm.bind(this)
  this.switchToCommand = switchToCommand.bind(this)
  this.commandQuitConfirmed = commandQuitConfirmed.bind(this)
}

Scene_GameEnd.prototype.createCommandWindow = function () {
  const rect = this.commandWindowRect()
  this._commandWindow = new Window_GameEnd(rect)
  this._commandWindow.setHandler('toTitle', this.commandToTitle.bind(this))
  // EDIT: Add command to quit the game from menu.
  this._commandWindow.setHandler('toQuit', this.commandQuitGame.bind(this))
  this._commandWindow.setHandler('cancel', this.popScene.bind(this))
  this.addWindow(this._commandWindow)
}

Scene_GameEnd.prototype.commandWindowRect = function () {
  const ww = this.mainCommandWidth()
  // EDIT: Change 2 -> 3 to include the new quit command.
  const wh = this.calcWindowHeight(3, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

// ==========================================================
// EDIT: Add the quit game command, with a text window.
Scene_GameEnd.prototype.commandQuitGame = function () {
  this.switchToConfirm()
}

// EDIT: Added confirm Yes / No command.
Scene_GameEnd.prototype.commandConfirmYes = function () {
  this.commandQuitConfirmed()
}

Scene_GameEnd.prototype.commandConfirmNo = function () {
  this.switchToCommand()
}

//=======================================================
// Edit and then re-export only the edited ones.
export { Scene_Boot, Scene_Title, Scene_Menu, Scene_Options, Scene_GameEnd }
