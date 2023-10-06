import { Window_TitleCommand } from '../../rmmz_windows'
import { TextManager } from '../../rmmz_managers'

Window_TitleCommand.prototype.makeCommandList = function () {
  const continueEnabled = this.isContinueEnabled()
  this.addCommand(TextManager.newGame, 'newGame')
  this.addCommand(TextManager.continue_, 'continue', continueEnabled)
  this.addCommand(TextManager.options, 'options')
  // EDIT: Add controls button
  this.addCommand('Controls', 'controls')
  // EDIT: Add quit button.
  this.addCommand('Quit Game', 'quitGame')
}

export { Window_TitleCommand }
