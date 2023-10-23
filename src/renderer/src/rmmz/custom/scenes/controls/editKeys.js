import { Scene_MenuBase } from '../../../rmmz_scenes'
// Import edited
import { Scene_Base } from '../../../edits/editsIndex'
// Import custom
import { Window_EditKeys } from './windows/editKeys'
import {
  createInfoWindow,
  editWindowRect,
  exitEdit,
  terminateEdit,
  updateEditWindow
} from './common'

function Scene_EditKeys() {
  this.initialize(...arguments)
}

Scene_EditKeys.prototype = Object.create(Scene_MenuBase.prototype)
Scene_EditKeys.prototype.constructor = Scene_EditKeys

Scene_EditKeys.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
  this._tempCommands = window.Input._commands
  this.createInfoWindow = createInfoWindow.bind(this, 'Press any key.')
  this.editWindowRect = editWindowRect.bind(this)
  this.terminate = terminateEdit.bind(this)
  this.updateEditWindow = updateEditWindow.bind(this)
}

Scene_EditKeys.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)
  this.createEditWindow()
  this.createInfoWindow()
}

Scene_EditKeys.prototype.createEditWindow = function () {
  const rect = this.editWindowRect()
  this._editWindow = new Window_EditKeys(rect)
  this._editWindow.setHandler('cancel', exitEdit.bind(this))
  this.addWindow(this._editWindow)
}

Scene_EditKeys.prototype.update = function () {
  this.updateEditWindow()
  Scene_Base.prototype.update.call(this)
}

export { Scene_EditKeys }
