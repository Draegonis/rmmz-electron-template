import { ConfigManager } from '../../rmmz_managers'

// Add temp to determine if window needs resize on save.
ConfigManager.tempWindowSize = [0, 0]
ConfigManager.tempFullScreen = false

// EDIT: Get window setting from electron.
ConfigManager.window = await window.electron.ipcRenderer.invoke('load-window')

// EDIT: ConfigManager uses electron store on the electron side of
// the game. Saves data in user data folder as config.json.
ConfigManager.load = function () {
  window.electron.ipcRenderer.invoke('load-config').then((res) => {
    if (res.alwaysDash === undefined) {
      this.save()
      this._isLoaded = true
    } else {
      this.applyData(res || {})
      this._isLoaded = true
    }
  })
}
ConfigManager.save = function () {
  window.electron.ipcRenderer.send('save-config', this.makeData())
}

ConfigManager.makeData = function () {
  const config = {}
  config.alwaysDash = this.alwaysDash
  config.commandRemember = this.commandRemember
  config.touchUI = this.touchUI
  config.bgmVolume = this.bgmVolume
  config.bgsVolume = this.bgsVolume
  config.meVolume = this.meVolume
  config.seVolume = this.seVolume

  // EDIT: Add window to makeData
  config.window = this.window

  return config
}

ConfigManager.applyData = function (config) {
  this.alwaysDash = this.readFlag(config, 'alwaysDash', false)
  this.commandRemember = this.readFlag(config, 'commandRemember', false)
  this.touchUI = this.readFlag(config, 'touchUI', true)
  this.bgmVolume = this.readVolume(config, 'bgmVolume')
  this.bgsVolume = this.readVolume(config, 'bgsVolume')
  this.meVolume = this.readVolume(config, 'meVolume')
  this.seVolume = this.readVolume(config, 'seVolume')

  // EDIT: Set window data.
  this.window = config.window
}

// Edit: Add function to convert sizes to ratios.
ConfigManager.getScreenRatio = function (width, height) {
  switch ((width, height)) {
    case (1000, 800):
      return 1.25
    case (1024, 768):
      return 1.33
    case (1024, 576):
      return 1.78
    case (1280, 540):
      return 2.37
    default:
      return 0
  }
}

// Edit: Add function to get screen size by ratio.
ConfigManager.getSizeByRatio = function (ratio) {
  switch (ratio) {
    case 1.25:
      return [1000, 800]
    case 1.33:
      return [1024, 768]
    case 1.78:
      return [1024, 576]
    case 2.37:
      return [1280, 540]
    default:
      return [1, 1]
  }
}

// Edit: Add a ratio index.
ConfigManager.ratioIndex = [1.25, 1.33, 1.78, 2.37]

export { ConfigManager }
