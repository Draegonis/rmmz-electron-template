import { Scene_GameEnd, Scene_MenuBase } from '../../rmmz_scenes'
import { Rectangle } from '../../rmmz_core'
// Edited
import { Window_GameEnd, Graphics } from '../editsIndex'
// Common
import { switchToCommand, switchToConfirm, commandQuitConfirmed } from './common'

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

export { Scene_GameEnd }
