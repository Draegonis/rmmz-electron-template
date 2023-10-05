import { Scene_MenuBase } from '../../../rmmz_scenes'
import { Rectangle } from '../../../rmmz_core'
import { SceneManager } from '../../../rmmz_managers'
// Import edited ones not the originals.
import { Graphics } from '../../../edits/core_edits'
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
  this.createOptionsWindow()
}

Scene_Controls.prototype.terminate = function () {
  Scene_MenuBase.prototype.terminate.call(this)
}

Scene_Controls.prototype.createOptionsWindow = function () {
  const rect = this.optionsWindowRect()
  this._optionsWindow = new Window_Controls(rect)
  this._optionsWindow.setHandler('editKeys', this.editKeys.bind(this))
  this._optionsWindow.setHandler('editGamepad', this.editGamepad.bind(this))
  this._optionsWindow.setHandler('resetInput', this.resetInput.bind(this))
  this._optionsWindow.setHandler('cancel', this.popScene.bind(this))
  this.addWindow(this._optionsWindow)
}

Scene_Controls.prototype.optionsWindowRect = function () {
  const ww = 450
  const wh = this.calcWindowHeight(4, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

Scene_Controls.prototype.editKeys = function () {
  SceneManager.push(Scene_EditKeys)
}

Scene_Controls.prototype.editGamepad = function () {
  SceneManager.push(Scene_EditGamepad)
}

Scene_Controls.prototype.resetInput = function () {
  this._optionsWindow.close()
  // free up old command window for garbage collection
  this._optionsWindow = null

  const ww = this.mainCommandWidth()
  const wh = this.calcWindowHeight(2, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = Graphics.boxHeight - wh - 96

  const background = window.$dataSystem.titleCommandWindow.background
  const rect = new Rectangle(wx, wy, ww, wh)

  this._optionsWindow = new Window_ConfirmCommand(rect)
  this._optionsWindow.setBackgroundType(background)

  this._optionsWindow.setHandler('confirmYes', this.commandConfirmYes.bind(this))
  this._optionsWindow.setHandler('confirmNo', this.commandConfirmNo.bind(this))
  this._optionsWindow.setHandler('cancel', this.commandConfirmNo.bind(this))

  if (!this._confirmText) {
    this._confirmText = new Window_Text(
      new Rectangle(wx + 20, wy - 75, 500, 60),
      'Reset inputs to default?'
    )

    this.addWindow(this._confirmText)
  }
  this._confirmText.open()

  this.addWindow(this._optionsWindow)
  this._optionsWindow.open()
}

// EDIT: Added confirm Yes / No command.
Scene_Controls.prototype.commandConfirmYes = function () {
  this._optionsWindow.close()
  this._optionsWindow = null
  this._confirmText.close()
  window.Input.saveInputs(true)
  this.createOptionsWindow()
}

Scene_Controls.prototype.commandConfirmNo = function () {
  this._optionsWindow.close()
  this._optionsWindow = null
  this._confirmText.close()
  this.createOptionsWindow()
}

export { Scene_Controls }
