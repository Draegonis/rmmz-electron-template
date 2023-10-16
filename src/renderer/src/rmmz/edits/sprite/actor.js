import { Sprite_Actor } from '../../rmmz_sprites'
// Import edited
import { ConfigManager } from '../editsIndex'

// EDIT: new function to calculate the adjusted and offset positions.
const adjustPosition = (index) => {
  const currentWidth = ConfigManager.window.minWidth
  const currentHeight = ConfigManager.window.minHeight
  const ratio = ConfigManager.window.ratio

  switch (ratio) {
    case 1.25: {
      return [currentWidth - 125, currentHeight - 500, 0, index * 100]
    }
    case 1.33: {
      return [currentWidth - 150, currentHeight - 425, 0, index * 75]
    }
    case 1.78: {
      return [currentWidth - 175, currentHeight - 340, index * 32, index * 48]
    }
    case 2.37: {
      return [currentWidth - 200, currentHeight - 350, index * 32, index * 48]
    }
    default: {
      throw new Error(`Cannot set home position of actors with a ratio of ${ratio} in actors.js.`)
    }
  }
}

// EDIT: adjust x and y by factoring in minWidth and minHeight.
// You may need to change the values based on your game.
Sprite_Actor.prototype.setActorHome = function (index) {
  const [adjustedX, adjustedY, offsetX, offsetY] = adjustPosition(index)
  console.log(adjustedX, adjustedY, offsetX, offsetY)
  this.setHome(adjustedX + offsetX, adjustedY + offsetY)
}

export { Sprite_Actor }
