import { Scene_MenuBase } from '../../../rmmz_scenes'
// Import edited
import { Scene_Base } from '../../../edits/editsIndex'
// Import custom
import { Window_EditMouse } from './windows/editMouse'
import {
  createInfoWindow,
  editWindowRect,
  exitEdit,
  terminateEdit,
  updateEditWindow
} from './common'

function Scene_EditMouse() {
  this.initialize(...arguments)
}

Scene_EditMouse.prototype = Object.create(Scene_MenuBase.prototype)
Scene_EditMouse.prototype.constructor = Scene_EditMouse

Scene_EditMouse.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
  this._tempCommands = window.Input._commands
  this.createInfoWindow = createInfoWindow.bind(this, 'Press any button.')
  this.editWindowRect = editWindowRect.bind(this)
  this.terminate = terminateEdit.bind(this)
  this.updateEditWindow = updateEditWindow.bind(this)
}

Scene_EditMouse.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)
  this.createEditWindow()
  this.createInfoWindow()
}

Scene_EditMouse.prototype.createEditWindow = function () {
  const rect = this.editWindowRect()
  this._editWindow = new Window_EditMouse(rect)
  this._editWindow.setHandler('cancel', exitEdit.bind(this))
  this.addWindow(this._editWindow)
}

Scene_EditMouse.prototype.update = function () {
  this.updateEditWindow()
  Scene_Base.prototype.update.call(this)
}

export { Scene_EditMouse }
