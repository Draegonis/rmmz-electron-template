import { Utils } from './core_edits'
import {
  DataManager,
  BattleManager,
  ConfigManager,
  StorageManager,
  PluginManager
} from '../rmmz_managers'

//==========================================================================
// DATAMANAGER EDITS

// EDIT: Have to send the filename to the electron side and
// the return if it fails triggers the delete globalInfo.
DataManager.removeInvalidGlobalInfo = function () {
  const globalInfo = this._globalInfo
  for (const info of globalInfo) {
    const savefileId = globalInfo.indexOf(info)
    const saveFileName = this.makeSavename(savefileId)
    window.electron.ipcRenderer
      .invoke('file-exists', 'save', StorageManager.fileName(saveFileName))
      .catch(() => {
        delete globalInfo[savefileId]
      })
  }
}

// EDIT: Removed the TEST_ prefix.
DataManager.loadDatabase = function () {
  for (const databaseFile of this._databaseFiles) {
    this.loadDataFile(databaseFile.name, databaseFile.src)
  }
  if (this.isEventTest()) {
    this.loadDataFile('$testEvent', 'Event.json')
  }
}

DataManager.isBattleTest = function () {
  // EDIT: Changed to a variable loaded from .env.development
  return window.$TEST.ENV === 'battle'
}

DataManager.isEventTest = function () {
  // EDIT: Changed to false as there is no event testing at the moment.
  return false
}

DataManager.isTitleSkip = function () {
  // EDIT: Changed to a variable loaded from .env.development
  return window.$TEST.ENV === 'skiptitle'
}

DataManager.setupBattleTest = function () {
  this.createGameObjects()
  window.$gameParty.setupBattleTest()
  // EDIT: Changed to load a troop id set in .env.development
  BattleManager.setup(window.$TEST.TROOPID, true, false)
  BattleManager.setBattleTest(true)
  BattleManager.playBattleBgm()
}

// EDIT: This is not used.
delete DataManager.savefileExists

// EDIT: When saving the classes are stripped from the contents,
// so the classes need to be re-init from content data.
DataManager.extractSaveContents = function (contents) {
  window.$gameSystem.loadContents(contents.system)
  window.$gameScreen.loadContents(contents.screen)
  window.$gameTimer.loadContents(contents.timer)
  window.$gameSwitches.loadContents(contents.switches)
  window.$gameVariables.loadContents(contents.variables)
  window.$gameSelfSwitches.loadContents(contents.selfSwitches)
  window.$gameActors.loadContents(contents.actors)
  window.$gameParty.loadContents(contents.party)
  window.$gameMap.loadContents(contents.map)
  window.$gamePlayer.loadContents(contents.player)
}

//==========================================================================
// CONFIGMANAGER EDITS

// Add temp to determine if window needs resize on save.
ConfigManager.tempWindowSize = [0, 0]
ConfigManager.tempFullScreen = false

// EDIT: Get window setting from electron.
ConfigManager.window = await window.electron.ipcRenderer.invoke('load-window')

// EDIT: ConfigManager uses electron store on the electron side of
// the game. Saves data in user data folder as config.json.
ConfigManager.load = function () {
  window.electron.ipcRenderer.invoke('load-config').then((res) => {
    this.applyData(res || {})
    this._isLoaded = true
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
    case (1280, 1024):
      return 1.25
    case (1024, 768):
      return 1.33
    case (1280, 720):
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
      return [1280, 1024]
    case 1.33:
      return [1024, 768]
    case 1.78:
      return [1280, 720]
    case 2.37:
      return [1280, 540]
    default:
      return [1, 1]
  }
}

// Edit: Add a ratio index.
ConfigManager.ratioIndex = [1.25, 1.33, 1.78, 2.37]

//==========================================================================
// STORAGEMANAGER EDITS

// EDIT: StorageManager is mostly done on the electron side, only really need
// saveObject, loadObject and filepath.
StorageManager.saveObject = function (saveName, object) {
  return window.electron.ipcRenderer.invoke(
    'save-object',
    'save',
    this.fileName(saveName),
    object,
    true
  )
}

StorageManager.loadObject = function (saveName) {
  return window.electron.ipcRenderer.invoke('read-object', 'save', this.fileName(saveName), true)
}

StorageManager.fileName = function (saveName) {
  return saveName + '.rmmzsave'
}

//==========================================================================
// PLUGINMANAGER EDITS

PluginManager.setup = function (plugins) {
  for (const plugin of plugins) {
    const pluginName = Utils.extractFileName(plugin.name)
    if (plugin.status && !this._scripts.includes(pluginName)) {
      this.setParameters(pluginName, plugin.parameters)
      // EDIT: to allow imports as modules for top level await.
      this.loadScript(plugin.name, plugin.parameters.IMPORT_AS_MODULE)
      this._scripts.push(pluginName)
    }
  }
}

// EDIT: to allow imports as modules for top level await.
PluginManager.loadScript = function (filename, moduleImport) {
  const importType = moduleImport === 'true' ? 'module' : 'text/javascript'

  const url = this.makeUrl(filename)
  const script = document.createElement('script')
  script.type = importType
  script.src = url
  script.async = false
  script.defer = true
  script.onerror = this.onError.bind(this)
  script._url = url
  document.body.appendChild(script)
}

//=======================================================
// Edit and then re-export only the edited ones.
export { DataManager, ConfigManager, StorageManager, PluginManager }
