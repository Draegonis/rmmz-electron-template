import { Scene_Map } from '../../rmmz_scenes'
// Import edited
import { Input } from '../editsIndex'

// EDIT: Removed TouchInput.isCancelled(), can only open menu by the menu command.
Scene_Map.prototype.isMenuCalled = function () {
  return Input.isTriggered('menu')
}

export { Scene_Map }
