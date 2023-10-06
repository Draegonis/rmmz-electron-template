import { Scene_Base, Scene_MenuBase } from '../../../rmmz_scenes'
// Import custom
import { Window_EditGamepad } from './windows/editGamepad'
import {
  createInfoWindow,
  editWindowRect,
  exitEdit,
  updateEditWindow,
  terminateEdit
} from './common'

function Scene_EditGamepad() {
  this.initialize(...arguments)
}

Scene_EditGamepad.prototype = Object.create(Scene_MenuBase.prototype)
Scene_EditGamepad.prototype.constructor = Scene_EditGamepad

Scene_EditGamepad.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
  this._tempCommands = window.Input._commands
  this.createInfoWindow = createInfoWindow.bind(this)
  this.editWindowRect = editWindowRect.bind(this)
  this.terminate = terminateEdit.bind(this)
  this.updateEditWindow = updateEditWindow.bind(this)
}

Scene_EditGamepad.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)
  this.createEditWindow()
  this.createInfoWindow()
}

Scene_EditGamepad.prototype.createEditWindow = function () {
  const rect = this.editWindowRect()
  this._editWindow = new Window_EditGamepad(rect)
  this._editWindow.setHandler('cancel', exitEdit.bind(this))
  this.addWindow(this._editWindow)
}

Scene_EditGamepad.prototype.update = function () {
  this.updateEditWindow()
  Scene_Base.prototype.update.call(this)
}

export { Scene_EditGamepad }
