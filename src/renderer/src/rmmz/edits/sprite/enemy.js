import { Sprite_Battler, Sprite_Enemy } from '../../rmmz_sprites'
// Import Edited
import { ConfigManager } from '../editsIndex'

// EDIT: Adjust the home position of enemies based on the difference
// from the editor and the actual.
Sprite_Enemy.prototype.setBattler = function (battler) {
  Sprite_Battler.prototype.setBattler.call(this, battler)
  this._enemy = battler
  const battleAreaWidth = ConfigManager.window.minWidth
  const battleAreaHeight = ConfigManager.window.minHeight
  const baseWidth = window.$dataSystem.advanced.screenWidth
  const baseHeight = window.$dataSystem.advanced.screenHeight
  const adjustedX = (battleAreaWidth / baseWidth) * battler.screenX()
  const adjustedY = (battleAreaHeight / baseHeight) * battler.screenY()
  this.setHome(adjustedX, adjustedY)
  this._stateIconSprite.setup(battler)
}

export { Sprite_Enemy }
