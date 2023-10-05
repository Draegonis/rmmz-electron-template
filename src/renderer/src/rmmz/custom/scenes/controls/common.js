// original rmmz
import { Rectangle } from '../../../rmmz_core'
import { Scene_MenuBase } from '../../../rmmz_scenes'
// edited rmmz
import { Graphics } from '../../../edits/core_edits'
// custom
import { Window_Text } from '../../windows/utility/text'
// helpers
import { equals as r_equals } from 'ramda'

//=========================================
// Window_EditKeys/Window_EditGamepad

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

//=========================================
// Scene_EditKeys/Scene_EditGamepad

const createInfoWindow = function () {
  const ww = 400
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = Graphics.boxHeight / 2 - 50
  this._infoWindow = new Window_Text(new Rectangle(wx, wy, ww, 56), 'Press any key.', 'center')
  this.addWindow(this._infoWindow)
  this._infoWindow.hide()
}

const editWindowRect = function () {
  const ww = 450
  const wh = this.calcWindowHeight(10, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

const exitEdit = function () {
  if (window.Input.waitingForInput) {
    // reset waiting for input if scene is cancelled by other input type.
    window.Input.waitingForInput = false
  }
  this.popScene()
}

const terminateEdit = function () {
  if (!r_equals(this._tempCommands, window.Input._commands)) {
    console.log('Saving inputs.')
    window.Input.saveInputs(false)
  } else {
    console.log('NOT saving inputs.')
  }
  Scene_MenuBase.prototype.terminate.call(this)
}

const updateEditWindow = function () {
  if (window.Input.waitingForInput) {
    this._infoWindow.show()
  } else {
    if (this._infoWindow.visible) {
      this._infoWindow.hide()
      // redraw old input
      if (window.Input.tempInput.oldCommand !== window.Input.tempInput.command) {
        const index = this._editWindow.findSymbol(window.Input.tempInput.oldCommand)
        this._editWindow.redrawItem(index)
      }
      // redraw new input
      this._editWindow.redrawItem(window.Input.tempInput.index)
    }
  }
}

export {
  setWaitingForInput,
  createInfoWindow,
  editWindowRect,
  exitEdit,
  updateEditWindow,
  terminateEdit
}
