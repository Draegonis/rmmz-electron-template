import { Sprite_Battleback } from '../../rmmz_sprites'
// Import edited
import { Graphics, ConfigManager } from '../editsIndex'

Sprite_Battleback.prototype.adjustPosition = function () {
  this.width = Math.floor((1000 * Graphics.width) / 816)
  this.height = Math.floor((740 * Graphics.height) / 624)
  this.x = (Graphics.width - this.width) / 2
  if (window.$gameSystem.isSideView()) {
    this.y = Graphics.height - this.height
  } else {
    this.y = 0
  }
  const ratioX = this.width / this.bitmap.width
  const ratioY = this.height / this.bitmap.height
  const scale = Math.max(ratioX, ratioY, 1.0)
  this.scale.x = scale
  this.scale.y = ConfigManager.window.ratio === 2.37 ? 1 : scale
}

export { Sprite_Battleback }
