import { Window_Command } from '../../../rmmz_windows'

function Window_ConfirmCommand() {
  this.initialize(...arguments)
}

Window_ConfirmCommand.prototype = Object.create(Window_Command.prototype)
Window_ConfirmCommand.prototype.constructor = Window_ConfirmCommand

Window_ConfirmCommand.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
  this.selectLast()
  this.openness = 0
}

Window_ConfirmCommand.prototype.makeCommandList = function () {
  this.addCommand('Yes', 'confirmYes')
  this.addCommand('No', 'confirmNo')
}

Window_ConfirmCommand.prototype.processOk = function () {
  Window_Command.prototype.processOk.call(this)
}

Window_ConfirmCommand.prototype.selectLast = function () {
  this.selectSymbol('confirmNo')
}

export { Window_ConfirmCommand }
