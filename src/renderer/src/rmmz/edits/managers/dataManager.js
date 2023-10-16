import { DataManager, BattleManager } from '../../rmmz_managers'
// Custom
import { CoreManager, fileExtension } from '../../../managers/coreManager'

// EDIT: globalInfo returned from electron can be false, since it is not rejected on electron side.
DataManager.loadGlobalInfo = function () {
  StorageManager.loadObject('global')
    .then((globalInfo) => {
      if (globalInfo) {
        this._globalInfo = globalInfo
        this.removeInvalidGlobalInfo()
        return true
      } else {
        this._globalInfo = []
      }
    })
    .catch(() => {
      this._globalInfo = []
    })
}

DataManager.saveGame = function (savefileId) {
  const contents = this.makeSaveContents()
  const saveName = this.makeSavename(savefileId)

  const dataTask = {
    savefileId: saveName,
    extension: fileExtension,
    contents,
    task: 'save'
  }

  CoreManager.registerDataTask(dataTask)

  return CoreManager.executeDataTasks('save').then(() => {
    this._globalInfo[savefileId] = this.makeSavefileInfo()
    this.saveGlobalInfo()
    return true
  })
}

DataManager.loadGame = function (savefileId) {
  const saveName = this.makeSavename(savefileId)

  const dataTask = {
    savefileId: saveName,
    extension: fileExtension,
    task: 'load',
    thenCallback: (contents) => {
      window.DataManager.createGameObjects()
      window.DataManager.extractSaveContents(contents)
      window.DataManager.correctDataErrors()
      return true
    }
  }

  CoreManager.registerDataTask(dataTask)

  return CoreManager.executeDataTasks('load')
    .then((resp) => {
      if (resp) return true
      return false
    })
    .catch((e) => {
      console.log(e)
      return false
    })
}

// EDIT: Have to send the filename to the electron side and
// the return if it fails triggers the delete globalInfo.
DataManager.removeInvalidGlobalInfo = function () {
  const globalInfo = this._globalInfo
  for (const info of globalInfo) {
    const savefileId = globalInfo.indexOf(info)
    const saveFileName = this.makeSavename(savefileId)
    const saveFolder = CoreManager.saveAsFolder ? `save/${saveFileName}` : 'save'
    CoreManager.fileExists(saveFolder, saveFileName + '.' + fileExtension)
      .then((resp) => {
        if (!resp) {
          delete globalInfo[savefileId]
        }
      })
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

export { DataManager }
