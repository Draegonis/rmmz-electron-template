import { Window_GameEnd } from '../../rmmz_windows'
import { TextManager } from '../../rmmz_managers'

Window_GameEnd.prototype.makeCommandList = function () {
  this.addCommand(TextManager.toTitle, 'toTitle')
  // EDIT: Add quit command to menu.
  this.addCommand('Quit Game', 'toQuit')
  this.addCommand(TextManager.cancel, 'cancel')
}

export { Window_GameEnd }
