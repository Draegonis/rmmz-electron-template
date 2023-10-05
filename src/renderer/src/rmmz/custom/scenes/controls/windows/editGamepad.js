import { Window_Command } from '../../../../rmmz_windows'
import { setWaitingForInput } from '../common'

function Window_EditGamepad() {
  this.initialize(...arguments)
}

Window_EditGamepad.prototype = Object.create(Window_Command.prototype)
Window_EditGamepad.prototype.constructor = Window_EditGamepad

Window_EditGamepad.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
  this.waitingForInput = setWaitingForInput.bind(this)
}

Window_EditGamepad.prototype.makeCommandList = function () {
  Object.entries(window.Input._commands).forEach(([key, obj]) => {
    if ('button' in obj) {
      this.addCommand(key, `${key}-button`)
    }
  })
  Object.entries(window.Input._commands).forEach(([key, obj]) => {
    if ('axis' in obj) {
      this.addCommand(key, `${key}-axis`)
    }
  })
}

Window_EditGamepad.prototype.drawItem = function (index) {
  const title = this.commandName(index)
  const status = this.statusText(index)
  const rect = this.itemLineRect(index)
  const statusWidth = this.statusWidth()
  const titleWidth = rect.width - statusWidth
  this.resetTextColor()
  this.changePaintOpacity(this.isCommandEnabled(index))
  this.drawText(title, rect.x, rect.y, titleWidth, 'left')
  this.drawText(status, rect.x + titleWidth, rect.y, statusWidth, 'right')
}

Window_EditGamepad.prototype.statusWidth = function () {
  return 120
}

Window_EditGamepad.prototype.statusText = function (index) {
  const symbolKeys = this.commandSymbol(index).split('-')
  if (window.Input._commands[symbolKeys[0]][symbolKeys[1]] === undefined) {
    return ''
  } else {
    return window.Input._commands[symbolKeys[0]][symbolKeys[1]]
  }
}

Window_EditGamepad.prototype.processOk = function () {
  if (window.Input.gamepadConnected && !window.Input.waitingForInput) {
    this.waitingForInput()
  } else {
    this.playBuzzerSound()
  }
}

export { Window_EditGamepad }
