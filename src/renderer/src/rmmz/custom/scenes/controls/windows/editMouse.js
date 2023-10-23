import { Window_Command } from '../../../../rmmz_windows'
import { setWaitingForInput } from '../common'

function Window_EditMouse() {
  this.initialize(...arguments)
}

Window_EditMouse.prototype = Object.create(Window_Command.prototype)
Window_EditMouse.prototype.constructor = Window_EditMouse

Window_EditMouse.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
  this.waitingForInput = setWaitingForInput.bind(this)
}

Window_EditMouse.prototype.makeCommandList = function () {
  Object.entries(window.Input._commands).forEach(([key, obj]) => {
    if ('mouse' in obj) {
      this.addCommand(key, `${key}-mouse`)
    }
  })
}

Window_EditMouse.prototype.drawItem = function (index) {
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

Window_EditMouse.prototype.statusWidth = function () {
  return 120
}

Window_EditMouse.prototype.statusText = function (index) {
  const symbolKeys = this.commandSymbol(index).split('-')
  if (!window.Input._commands[symbolKeys[0]][symbolKeys[1]]) {
    return ''
  } else {
    return window.Input.displayInput.mouse[window.Input._commands[symbolKeys[0]][symbolKeys[1]]]
  }
}

Window_EditMouse.prototype.processOk = function () {
  this.waitingForInput()
}

export { Window_EditMouse }
