import { Window_Command } from '../../../../rmmz_windows'

function Window_Controls() {
  this.initialize(...arguments)
}

Window_Controls.prototype = Object.create(Window_Command.prototype)
Window_Controls.prototype.constructor = Window_Controls

Window_Controls.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
}

Window_Controls.prototype.makeCommandList = function () {
  // keyboard -> go to edit key bindings
  this.addCommand('Change key bindings', 'editKeys')
  // gamepad -> go to edit gamepad input
  this.addCommand('Change gamepad bindings', 'editGamepad')
  // reset -> select keyboard or gamepad or cancel
  this.addCommand('Reset key/gamepad bindings', 'resetInput')
  // exit -> exit scene.
  this.addCommand('exit', 'cancel')
}

Window_Controls.prototype.drawItem = function (index) {
  const title = this.commandName(index)
  const rect = this.itemLineRect(index)
  const titleWidth = rect.width
  this.resetTextColor()
  this.changePaintOpacity(this.isCommandEnabled(index))
  this.drawText(title, rect.x, rect.y, titleWidth, 'center')
}

Window_Controls.prototype.processOk = function () {
  Window_Command.prototype.processOk.call(this)
}

export { Window_Controls }
