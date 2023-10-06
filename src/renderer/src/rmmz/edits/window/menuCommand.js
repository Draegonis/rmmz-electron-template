import { Window_MenuCommand } from '../../rmmz_windows'

Window_MenuCommand.prototype.makeCommandList = function () {
  this.addMainCommands()
  this.addFormationCommand()
  this.addOriginalCommands()
  this.addOptionsCommand()
  // Edit: Add in new Controls in menu.
  this.addControlsCommand()
  this.addSaveCommand()
  this.addGameEndCommand()
}

// Edit: add Controls to main menu.
Window_MenuCommand.prototype.addControlsCommand = function () {
  this.addCommand('Controls', 'controls', true)
}

export { Window_MenuCommand }
