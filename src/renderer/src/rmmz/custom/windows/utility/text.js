import { Window_Base } from '../../../rmmz_windows'

function Window_Text() {
  this.initialize(...arguments)
}

Window_Text.prototype = Object.create(Window_Base.prototype)
Window_Text.prototype.constructor = Window_Text

Window_Text.prototype.initialize = function (rect, text) {
  Window_Base.prototype.initialize.call(this, rect)
  this._text = text
  this.refresh()
}

Window_Text.prototype.refresh = function () {
  const rect = this.baseTextRect()
  this.contents.clear()
  this.drawTextEx(this._text, rect.x, rect.y, rect.width)
}

export { Window_Text }
