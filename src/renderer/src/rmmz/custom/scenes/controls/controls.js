import { Scene_MenuBase } from '../../../rmmz_scenes'
import { Rectangle } from '../../../rmmz_core'
import { SceneManager } from '../../../rmmz_managers'
// Import edited ones not the originals.
import { Graphics } from '../../../edits/editsIndex'
// Import custom
import { Window_ConfirmCommand } from '../../windows/utility/confirmCommand'
import { Window_Text } from '../../windows/utility/text'
import { Window_Controls } from './windows/controls'
import { Scene_EditKeys } from './editKeys'
import { Scene_EditGamepad } from './editGamepad'

function Scene_Controls() {
  this.initialize(...arguments)
}

Scene_Controls.prototype = Object.create(Scene_MenuBase.prototype)
Scene_Controls.prototype.constructor = Scene_Controls

Scene_Controls.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
}

Scene_Controls.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)
  this.createControlsWindow()
}

Scene_Controls.prototype.terminate = function () {
  Scene_MenuBase.prototype.terminate.call(this)
}

Scene_Controls.prototype.controlsWindowRect = function () {
  const ww = 450
  const wh = this.calcWindowHeight(4, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

Scene_Controls.prototype.createControlsWindow = function () {
  const rect = this.controlsWindowRect()
  this._controlsWindow = new Window_Controls(rect)
  this._controlsWindow.setHandler('editKeys', this.editKeys.bind(this))
  this._controlsWindow.setHandler('editGamepad', this.editGamepad.bind(this))
  this._controlsWindow.setHandler('resetInput', this.resetInput.bind(this))
  this._controlsWindow.setHandler('cancel', this.popScene.bind(this))
  this.addWindow(this._controlsWindow)
}

Scene_Controls.prototype.editKeys = function () {
  SceneManager.push(Scene_EditKeys)
}

Scene_Controls.prototype.editGamepad = function () {
  SceneManager.push(Scene_EditGamepad)
}

Scene_Controls.prototype.confirmCommandRect = function () {
  const ww = this.mainCommandWidth()
  const wh = this.calcWindowHeight(2, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = Graphics.boxHeight - wh - 96
  return new Rectangle(wx, wy, ww, wh)
}

Scene_Controls.prototype.createConfirmCommand = function () {
  const rect = this.confirmCommandRect()
  this._controlsWindow = new Window_ConfirmCommand(rect)
  this._controlsWindow.setBackgroundType(window.$dataSystem.titleCommandWindow.background)
  this._controlsWindow.setHandler('confirmYes', this.commandConfirmYes.bind(this))
  this._controlsWindow.setHandler('confirmNo', this.commandConfirmNo.bind(this))
  this._controlsWindow.setHandler('cancel', this.commandConfirmNo.bind(this))
  this.addWindow(this._controlsWindow)
}

Scene_Controls.prototype.createInfoWindow = function () {
  if (!this._confirmText) {
    const ww = this.mainCommandWidth()
    const wh = this.calcWindowHeight(1, true)
    const wx = (Graphics.boxWidth - ww) / 2 - 50
    const wy = Graphics.boxHeight - wh - 250
    this._confirmText = new Window_Text(
      new Rectangle(wx, wy, 350, 60),
      'Reset inputs to default?',
      'center'
    )
    this.addWindow(this._confirmText)
  }
}

Scene_Controls.prototype.resetInput = function () {
  this._controlsWindow.close()
  // free up old command window for garbage collection
  this._controlsWindow = null

  this.createInfoWindow()
  this.createConfirmCommand()
  this._confirmText.open()
  this._controlsWindow.open()
}

Scene_Controls.prototype.switchControlsWindow = function () {
  this._controlsWindow.close()
  this._controlsWindow = null
  this._confirmText.close()
  this.createControlsWindow()
}

// EDIT: Added confirm Yes / No command.
Scene_Controls.prototype.commandConfirmYes = function () {
  this.switchControlsWindow()
  window.Input.saveInputs(true)
  this.playCursorSound()
}

Scene_Controls.prototype.commandConfirmNo = function () {
  this.switchControlsWindow()
}

export { Scene_Controls }
