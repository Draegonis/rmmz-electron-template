import { Rectangle } from '../../rmmz_core'
import { Scene_Title } from '../../rmmz_scenes'
import { SceneManager } from '../../rmmz_managers'
// Edited
import { Graphics, Window_TitleCommand, Scene_Base } from '../editsIndex'
// Custom
import { Scene_Controls } from '../../custom/scenes/controls/controls'
// Common
import { switchToCommand, switchToConfirm, commandQuitConfirmed } from './common'

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
  // EDIT: changed to window.$APP._name to create a single source of truth for the game name.
  const text = window.$APP._name
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

export { Scene_Title }
