import { Window_Command } from '../../../../rmmz_windows'

function Window_EditKeys() {
  this.initialize(...arguments)
}

Window_EditKeys.prototype = Object.create(Window_Command.prototype)
Window_EditKeys.prototype.constructor = Window_EditKeys

Window_EditKeys.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
}

Window_EditKeys.prototype.makeCommandList = function () {
  Object.entries(window.Input._commands).forEach(([key, obj]) => {
    if ('keyCode' in obj) {
      this.addCommand(key, `${key}-keyCode`)
    }
  })
}

Window_EditKeys.prototype.drawItem = function (index) {
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

Window_EditKeys.prototype.statusWidth = function () {
  return 120
}

Window_EditKeys.prototype.statusText = function (index) {
  const symbolKeys = this.commandSymbol(index).split('-')
  const lang = 'en'
  if (!window.Input._commands[symbolKeys[0]][symbolKeys[1]]) {
    return ''
  } else {
    return window.Input.keyboardMap[lang][window.Input._commands[symbolKeys[0]][symbolKeys[1]]]
  }
}

Window_EditKeys.prototype.processOk = function () {
  const symbolKeys = this.commandSymbol(this._index).split('-')

  // clear the input and waitForInput will be set to false in Keyboard.js after a keydown.
  window.Input.clear()
  window.Input.waitingForInput = true

  // set command/type of input
  window.Input.tempInput.command = symbolKeys[0]
  window.Input.tempInput.type = symbolKeys[1]

  // set index for redraw when window.Input.waitingForInput = false at the update in the scene.
  window.Input.tempInput.index = this.findSymbol(this.commandSymbol(this._index))

  this.playCursorSound()
}

export { Window_EditKeys }
