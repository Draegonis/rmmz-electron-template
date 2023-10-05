const setWaitingForInput = function () {
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

export { setWaitingForInput }
