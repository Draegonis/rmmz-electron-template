import { Scene_Menu } from '../../rmmz_scenes'
import { SceneManager } from '../../rmmz_managers'
// Edited
import { Window_MenuCommand } from '../editsIndex'
// Custom
import { Scene_Controls } from '../../custom/scenes/controls/controls'

Scene_Menu.prototype.createCommandWindow = function () {
  const rect = this.commandWindowRect()
  const commandWindow = new Window_MenuCommand(rect)
  commandWindow.setHandler('item', this.commandItem.bind(this))
  commandWindow.setHandler('skill', this.commandPersonal.bind(this))
  commandWindow.setHandler('equip', this.commandPersonal.bind(this))
  commandWindow.setHandler('status', this.commandPersonal.bind(this))
  commandWindow.setHandler('formation', this.commandFormation.bind(this))
  commandWindow.setHandler('options', this.commandOptions.bind(this))
  // Edit: Add option for editing controls.
  commandWindow.setHandler('controls', this.commandControls.bind(this))
  commandWindow.setHandler('save', this.commandSave.bind(this))
  commandWindow.setHandler('gameEnd', this.commandGameEnd.bind(this))
  commandWindow.setHandler('cancel', this.popScene.bind(this))
  this.addWindow(commandWindow)
  this._commandWindow = commandWindow
}

// Edit: Add commandControls menu option.
Scene_Menu.prototype.commandControls = function () {
  SceneManager.push(Scene_Controls)
}

export { Scene_Menu }
