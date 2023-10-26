import { TouchInput } from '../../rmmz_core'

// EDIT: Removed these to let the Mouse.js handle it.
delete TouchInput.isCancelled
delete TouchInput._onMiddleButtonDown
delete TouchInput._onRightButtonDown

TouchInput._onMouseDown = function (event) {
  // EDIT: Leave only mouse 0 which is left mouse button
  // Basically buttons other than 0 are turned into Input._currentState
  if (event.button === 0) {
    this._onLeftButtonDown(event)
  }
}

export { TouchInput }
