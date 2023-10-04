import { Scene_Base, Scene_MenuBase } from '../../../rmmz_scenes'
import { Rectangle } from '../../../rmmz_core'
// Import edited ones not the originals.
import { Graphics } from '../../../edits/core_edits'
// Import custom
import { Window_EditGamepad } from './windows/editGamepad'
import { Window_Text } from '../../windows/utility/text'

function Scene_EditGamepad() {
  this.initialize(...arguments)
}

Scene_EditGamepad.prototype = Object.create(Scene_MenuBase.prototype)
Scene_EditGamepad.prototype.constructor = Scene_EditGamepad

Scene_EditGamepad.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
}

Scene_EditGamepad.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)
  this.createOptionsWindow()
  this.createInfoWindow()
}

Scene_EditGamepad.prototype.terminate = function () {
  Scene_MenuBase.prototype.terminate.call(this)
}

Scene_EditGamepad.prototype.createOptionsWindow = function () {
  const rect = this.optionsWindowRect()
  this._optionsWindow = new Window_EditGamepad(rect)
  this._optionsWindow.setHandler('cancel', this.exitScene.bind(this))
  this.addWindow(this._optionsWindow)
}

Scene_EditGamepad.prototype.optionsWindowRect = function () {
  const ww = 450
  const wh = this.calcWindowHeight(4, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

Scene_EditGamepad.prototype.createInfoWindow = function () {
  const ww = 400
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = 0
  this._infoWindow = new Window_Text(new Rectangle(wx, wy, ww, 56), 'Press any gamepad input.')
  this.addWindow(this._infoWindow)
  this._infoWindow.hide()
}

Scene_EditGamepad.prototype.exitScene = function () {
  window.Input.saveInputs(false)
  this.popScene()
}

Scene_EditGamepad.prototype.update = function () {
  if (window.Input.waitingForInput) {
    this._infoWindow.show()
  } else {
    if (this._infoWindow.visible) {
      this._infoWindow.hide()
      // redraw old input
      if (window.Input.tempInput.oldCommand) {
        const index = this._optionsWindow.findSymbol(window.Input.tempInput.oldCommand)
        this._optionsWindow.redrawItem(index)
      }
      // redraw new input
      this._optionsWindow.redrawItem(window.Input.tempInput.index)
    }
  }

  Scene_Base.prototype.update.call(this)
}

export { Scene_EditGamepad }
