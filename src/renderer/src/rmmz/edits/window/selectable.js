import { Window_Selectable } from '../../rmmz_windows'
// Import edited
import { TouchInput } from '../editsIndex'

// EDIT: remove TouchInput.isCancelled, it is handled by Mouse.js
Window_Selectable.prototype.processTouch = function () {
  if (this.isOpenAndActive()) {
    if (this.isHoverEnabled() && TouchInput.isHovered()) {
      this.onTouchSelect(false)
    } else if (TouchInput.isTriggered()) {
      this.onTouchSelect(true)
    }
    if (TouchInput.isClicked()) {
      this.onTouchOk()
    }
  }
}

export { Window_Selectable }
