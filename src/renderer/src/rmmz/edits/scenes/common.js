import { Rectangle } from '../../rmmz_core'
import { AudioManager } from '../../rmmz_managers'
// Edited
import { Graphics } from '../editsIndex'
// Custom
import { Window_ConfirmCommand } from '../../custom/windows/utility/confirmCommand'
import { Window_Text } from '../../custom/windows/utility/text'

//=====================================================================
// Window_ConfirmCommand functionality in Scene_Title and Scene_GameEnd

export const switchToConfirm = function () {
  this._commandWindow.close()
  // free up old command window for garbage collection
  this._commandWindow = null

  const ww = this.mainCommandWidth()
  const wh = this.calcWindowHeight(2, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = Graphics.boxHeight - wh - 96

  const rect = new Rectangle(wx, wy, ww, wh)

  this._commandWindow = new Window_ConfirmCommand(rect)
  this._commandWindow.setBackgroundType(0)

  this._commandWindow.setHandler('confirmYes', this.commandConfirmYes.bind(this))
  this._commandWindow.setHandler('confirmNo', this.commandConfirmNo.bind(this))
  this._commandWindow.setHandler('cancel', this.commandConfirmNo.bind(this))

  if (!this._confirmText) {
    this._confirmText = new Window_Text(
      new Rectangle(wx + 20, wy - 75, 200, 60),
      'Are you sure?',
      'center'
    )
    this.addWindow(this._confirmText)
  }
  this._confirmText.open()

  this.addWindow(this._commandWindow)
  this._commandWindow.open()
}

export const switchToCommand = function () {
  this._commandWindow.close()
  this._confirmText.close()
  this.createCommandWindow()
}

export const commandQuitConfirmed = function () {
  this._commandWindow.close()
  this._confirmText.close()
  AudioManager.stopBgm()
  AudioManager.stopBgs()
  window.electron.ipcRenderer.send('quit-game')
}

//****************************************************************** */
//=====================================================================
