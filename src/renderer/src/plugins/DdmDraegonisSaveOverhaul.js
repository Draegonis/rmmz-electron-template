import { CoreManager, fileExtension } from '../managers/coreManager'
import { addNewInput } from '../store/inputs/useInputStore'
import { parseBoolean, parseNumber } from '../helpers/gameParsers'
import { isEmpty as r_isEmpty } from 'ramda'

// ================================================
// Setup/Params

const pluginName = 'DdmDraegonisSaveOverhaul'

window.Imported = window.Imported || {}
window.Imported[pluginName] = 1.0

const emptySlotName = 'Empty Save Slot'

const params = window.PluginManager.parameters(pluginName)
const enableAutosave = parseBoolean(params.enable_Autosave)
const enableQuicksave = parseBoolean(params.enable_Quicksave)
const enableHardsave = parseBoolean(params.enable_Hardsave)
const allowOverwrites = parseBoolean(params.allowOverwrites)
const maxAutosaves = parseNumber(params.maxAutosaves, 5)
const maxQuicksaves = parseNumber(params.maxQuicksaves, 5)
const maxHardsaves = parseNumber(params.maxHardsaves, 20)

addNewInput({ quickload: { keyCode: 119 }, quicksave: { keyCode: 116 } })

// ************************************************
// ================================================

// ================================================
// DataManager

// New variables to hold saving data for quicksave/autosave/hardsave
window.DataManager.isQuicksaving = false
window.DataManager.isQuickloading = false

// ================================================
// Handle last save.

window.DataManager.lastAutosave = undefined
window.DataManager.lastQuicksave = undefined

/**
 * Function to set the last save number for autosaves or quicksaves.
 * @param {'Autosave' | 'Quicksave'} saveType the string used to switch between the save types.
 * @param {number} saveNumber the save id number of the last save to be set to.
 */
window.DataManager.setLastSave = function (saveType, saveNumber) {
  switch (saveType) {
    case 'Autosave':
      this.lastAutosave = saveNumber
      break
    case 'Quicksave':
      this.lastQuicksave = saveNumber
      break
  }
}

/**
 * Functions that gives the last save number of the given save type.
 * @param {'Autosave' | 'Quicksave'} saveType the type to retrieve the last save number for.
 * @returns {number}
 */
window.DataManager.returnLastSave = function (saveType) {
  switch (saveType) {
    case 'Autosave':
      return this.lastAutosave
    case 'Quicksave':
      return this.lastQuicksave
  }
}

// ================================================
// Handle current saves.

window.DataManager._numOfAutosaves = 0
window.DataManager._numOfQuicksaves = 0
window.DataManager._numOfHardsaves = 0

/**
 * Function that finds the next available hard save number. This is mostly for when a save is deleted it will find
 * the gaps and create a save on those empty spots.
 * @returns { number }
 */
window.DataManager.nextEmptyHardsave = function () {
  let saveTest = 1
  let returnNum = 0
  let testing = true
  do {
    const testInfo = this._globalInfo.find((info) => info.savefileId === `Hardsave-${saveTest}`)
    if (!testInfo) {
      returnNum = saveTest
      testing = false
    }
    saveTest++
  } while (testing)

  return returnNum > 0 ? returnNum : 1
}

/**
 * Function that returns the current number of saves of a type.
 * @param {'Autosave' | 'Quicksave' | 'Hardsave'} saveType the string key of the save type.
 * @returns { number } if this fails it returns -1.
 */
window.DataManager.returnSavesNum = function (saveType) {
  switch (saveType) {
    case 'Autosave':
      return this._numOfAutosaves
    case 'Quicksave':
      return this._numOfQuicksaves
    case 'Hardsave':
      return this._numOfHardsaves
    default:
      return -1
  }
}

/**
 * Function the adds 1 to the current save of the given save type.
 * @param {'Autosave' | 'Quicksave' | 'Hardsave'} saveType the string key of the save type.
 */
window.DataManager.incrementSavesNum = function (saveType) {
  switch (saveType) {
    case 'Autosave':
      this._numOfAutosaves++
      break
    case 'Quicksave':
      this._numOfQuicksaves++
      break
    case 'Hardsave':
      this._numOfHardsaves++
      break
  }
}

/**
 * Function that removes 1 from the current save of the given save type.
 * @param {'Autosave' | 'Quicksave' | 'Hardsave'} saveType the string key of the save type.
 */
window.DataManager.decrementSavesNum = function (saveType) {
  switch (saveType) {
    case 'Autosave':
      this._numOfAutosaves--
      break
    case 'Quicksave':
      this._numOfQuicksaves--
      break
    case 'Hardsave':
      this._numOfHardsaves--
      break
  }
}

/**
 * Function to get the current total of all the different save types.
 * @returns { number } the current total of all the different save types.
 */
window.DataManager.currentTotalSavesNum = function () {
  return this._numOfAutosaves + this._numOfQuicksaves + this._numOfHardsaves
}

// ================================================
// Handle max saves.

window.DataManager._maxAutoSaves = enableAutosave ? (maxAutosaves > 0 ? maxAutosaves : 1) : 0
window.DataManager._maxQuicksaves = enableQuicksave ? (maxQuicksaves > 0 ? maxQuicksaves : 1) : 0
window.DataManager._maxHardsaves = enableHardsave ? (maxHardsaves > 0 ? maxHardsaves : 1) : 0

/**
 * Function that returns the max amount of save files.
 * @returns { number }
 */
window.DataManager.maxSavefiles = function () {
  return (
    this.returnMaxSavesOf('Autosave') +
    this.returnMaxSavesOf('Quicksave') +
    this.returnMaxSavesOf('Hardsave')
  )
}

/**
 * Function to get the max saves of the different save types.
 * @param {'Autosave' | 'Quicksave' | 'Hardsave'} saveType the string key of the save type.
 * @returns { number }
 */
window.DataManager.returnMaxSavesOf = function (saveType) {
  switch (saveType) {
    case 'Autosave':
      return this._maxAutoSaves
    case 'Quicksave':
      return this._maxQuicksaves
    case 'Hardsave':
      return this._maxHardsaves
    default:
      return -1
  }
}

// These are no longer used.
delete window.DataManager.makeSavename
delete window.DataManager.earliestSavefileId
delete window.DataManager.selectSavefileForNewGame
delete window.DataManager.emptySavefileId

// ======================================
// Handle GlobalInfo

/**
 * Function that checks for the saveId then if it is found places it in front of the globalInfo array.
 * @param {*} saveId the save file id to be checked for within globalInfo.
 * @param {*} dataManager a reference to the DataManager class.
 */
const makeGlobalInfoSave = function (saveId, dataManager) {
  const fileIndex = dataManager._globalInfo.findIndex((file) => file.savefileId === saveId)

  const newInfo = dataManager.makeSavefileInfo(saveId)

  if (fileIndex > 0) {
    // if fileIndex is > 0, remove it from the globalInfo array and place a new entry at the front
    // of the array.
    dataManager._globalInfo.splice(fileIndex, 1)
    dataManager._globalInfo.unshift(newInfo)
  } else if (fileIndex === 0) {
    // if fileIndex is 0, update the first entry.
    dataManager._globalInfo[0] = newInfo
  } else {
    // if fileIndex = -1 only add the new entry in front of the globalInfo array.
    dataManager._globalInfo.unshift(newInfo)
  }

  if (newInfo.saveType === 'Autosave' || newInfo.saveType === 'Quicksave') {
    dataManager.setLastSave(newInfo.saveType, newInfo.saveNumber)
  }

  dataManager.saveGlobalInfo()
}

/**
 * Function that checks each member of the globalInfo array and sends the savefileId to electron
 * to check if it exists. If it doesn't exists it will be removed from the globalInfo array.
 */
window.DataManager.removeInvalidGlobalInfo = async function () {
  // An array that collects invalid globalInfos to be removed after it checks each one.
  const removeIndex = []

  for await (const info of this._globalInfo) {
    // savefileId is the same as the saveFileName
    const savefileId = info.savefileId
    const saveFolder = CoreManager.saveAsFolder ? `save/${savefileId}` : 'save'
    // Changed logic to make sure it runs in order.
    const isSave = await CoreManager.fileExists(saveFolder, savefileId + '.' + fileExtension)

    const infoIndex = this._globalInfo.findIndex((file) => file.savefileId === savefileId)

    if (!isSave) {
      removeIndex.push(infoIndex)
    } else {
      if (info.saveType === 'Autosave' || info.saveType === 'Quicksave') {
        const lastSave = this.returnLastSave(info.saveType)
        if (!lastSave) this.setLastSave(info.saveType, info.saveNumber)
      }
      // this is to track the number of saves of a type.
      this.incrementSavesNum(info.saveType)
    }
  }

  if (removeIndex.length > 0) {
    // filters based on indexes.
    const filteredGlobalInfo = this._globalInfo.filter((_, index) => {
      let keep = true
      removeIndex.forEach((toRemove) => {
        if (toRemove === index) keep = false
      })
      return keep
    })
    // clear globalInfo array and set the new filtered one.
    this._globalInfo.length = 0
    this._globalInfo = filteredGlobalInfo
    // save the new global info.
    window.DataManager.saveGlobalInfo()
  }
}

// ======================================
// Handle NewGame/saveGame/loadGame

// removed selectSavefileForNewGame as it is no longer needed.
// New saves are automatically added in front of the globalInfo array.
window.DataManager.setupNewGame = function () {
  this.createGameObjects()
  window.$gameParty.setupStartingMembers()
  window.$gamePlayer.setupForNewGame()
  window.Graphics.frameCount = 0
}

window.DataManager.saveGame = function (savefileId) {
  const contents = this.makeSaveContents()

  const dataTask = {
    savefileId,
    extension: fileExtension,
    contents,
    task: 'save'
  }

  CoreManager.registerDataTask(dataTask)

  return CoreManager.executeDataTasks('save').then(() => {
    makeGlobalInfoSave(savefileId, window.DataManager)
    return true
  })
}

window.DataManager.loadGame = function (savefileId) {
  const dataTask = {
    savefileId,
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
    .catch(() => {
      return false
    })
}

// ======================================
// Handle savefileId and save file info.

// latest save is always index 0 savefileId.
window.DataManager.latestSavefileId = function () {
  return this._globalInfo[0].savefileId
}

window.DataManager.savefileInfo = function (savefileId) {
  const globalInfo = this._globalInfo
  // change because savefileId is no longer an int to index globalInfo.
  const saveInfo = globalInfo.find((info) => info.savefileId === savefileId)
  return saveInfo ? saveInfo : null
}

/**
 * Function that cycles the save number of an autosave or quicksave.
 * @param {'Autosave' | 'Hardsave'} saveType the string key of the save type.
 * @returns {string} a new savefileId string.
 */
const makeSavefileId = function (saveType) {
  const dataManager = window.DataManager
  let savefileId = ''

  const lastSave = dataManager.returnLastSave(saveType)
  const currentSaveNum = dataManager.returnSavesNum(saveType)
  const maxSaves = dataManager.returnMaxSavesOf(saveType)

  if (lastSave === maxSaves) {
    savefileId = `${saveType}-1`
  } else if (!lastSave) {
    savefileId = `${saveType}-1`
    dataManager.incrementSavesNum(saveType)
  } else {
    const saveNumber = lastSave + 1
    if (currentSaveNum < maxSaves) dataManager.incrementSavesNum(saveType)
    savefileId = `${saveType}-${saveNumber}`
  }

  return savefileId
}

// add new entries into the info saved to globalInfo array.
// saveType === 'Autosave' | 'Quicksave' | 'Hardsave'
// savefileId is used to find the index/info in globalInfo array.
window.DataManager.makeSavefileInfo = function (savefileId) {
  const [saveType, saveNumber] = savefileId.split('-')
  const info = {}
  info.title = window.$dataSystem.gameTitle
  info.characters = window.$gameParty.charactersForSavefile()
  info.faces = window.$gameParty.facesForSavefile()
  info.playtime = window.$gameSystem.playtimeText()
  info.timestamp = Date.now()
  info.saveType = saveType
  info.saveNumber = Number(saveNumber)
  info.savefileId = savefileId
  return info
}

// ************************************************
// ================================================

// ================================================
// Window_MenuCommand

// Overwrite if hardsaves are disabled make it so you can't
// open Scene_Save in the menu.
window.Window_MenuCommand.prototype.addSaveCommand = function () {
  if (this.needsCommand('save')) {
    const enabled = this.isSaveEnabled()
    if (enableHardsave || allowOverwrites) this.addCommand(window.TextManager.save, 'save', enabled)
  }
}

// ================================================
// Window_SavefileList

// EDIT: overwrite -> removes this._autosave in initialize and setMode.
window.Window_SavefileList.prototype.initialize = function (rect) {
  window.Window_Selectable.prototype.initialize.call(this, rect)
  this.activate()
  this._mode = null
}
window.Window_SavefileList.prototype.setMode = function (mode) {
  this._mode = mode
  this.refresh()
}

// EDIT: change to the currentTotalSaves (autosave doesn't effect index anymore)
window.Window_SavefileList.prototype.maxItems = function () {
  if (window.DataManager._numOfHardsaves === window.DataManager.maxHardsaves() || !enableHardsave) {
    // Prevent adding hard saves if the max is reached or hard saves are not enabled.
    return window.DataManager.currentTotalSavesNum()
  } else {
    // the + 1 should show as Empty Save Slot.
    if (this._mode === 'save' && enableHardsave)
      return window.DataManager.currentTotalSavesNum() + 1
    if (this._mode === 'load') return window.DataManager.currentTotalSavesNum()
  }
}

// EDIT: overwrite -> adds the emptySlotName instead of the old check for
// this._autosave.
window.Window_SavefileList.prototype.indexToSavefileId = function (index) {
  if (window.DataManager.currentTotalSavesNum() > index) {
    return window.DataManager._globalInfo[index].savefileId
  } else {
    return emptySlotName
  }
}

// Make it so you can't save over autosaves and quicksaves manually.
window.Window_SavefileList.prototype.isEnabled = function (savefileId) {
  if (this._mode === 'save') {
    if (allowOverwrites) return true

    if (savefileId.includes('Autosave') || savefileId.includes('Quicksave')) {
      return false
    }

    return true
  } else {
    return !!window.DataManager.savefileInfo(savefileId)
  }
}

// This is no longer used, because it never converts back to an index.
delete window.Window_SavefileList.savefileIdToIndex

// No longer has to factor in autosaves, since the most recent is always index 0.
window.Window_SavefileList.prototype.selectSavefile = function (index) {
  this.select(index)
  this.setTopRow(index - 2)
}

// EDIT: removes check for savefileId 0 since it is no longer the autosave slot.
window.Window_SavefileList.prototype.drawTitle = function (savefileId, x, y) {
  this.drawText(savefileId, x, y, 180)
}

// ************************************************
// ================================================

// ================================================
// Scene_Base

// EDIT: adds a check for the enableAutosave and the window.ConfigManager.enableAutosaving.
window.Scene_Base.prototype.isAutosaveEnabled = function () {
  return (
    !window.DataManager.isBattleTest() &&
    !window.DataManager.isEventTest() &&
    enableAutosave &&
    window.$gameSystem.isSaveEnabled() &&
    window.ConfigManager.enableAutosaving
  )
}

// EDIT: changes the way the autosaves are saved.
window.Scene_Base.prototype.executeAutosave = function () {
  const autosaveId = makeSavefileId('Autosave')

  window.DataManager.lastAutosave = autosaveId

  window.$gameSystem.onBeforeSave()
  window.DataManager.saveGame(autosaveId)
    .then((resp) => {
      if (resp) {
        this.onAutosaveSuccess()
      } else {
        window.DataManager.decrementSavesNum('Autosave')
        this.onAutosaveFailure()
      }
    })
    .catch(() => {
      window.DataManager.decrementSavesNum('Autosave')
      this.onAutosaveFailure()
    })
}

// ************************************************
// ================================================

// ================================================
// ConfigManager

// EDIT: Add two new options into the ConfigManager.
window.ConfigManager.enableAutosaving = true
window.ConfigManager.enableQuicksaving = true

// EDIT: Add a player option to enable or disable autosaving and quicksaving.
const DDM_ALIAS_CONFIGMANAGER_MAKEDATA = window.ConfigManager.makeData
window.ConfigManager.makeData = function () {
  const config = DDM_ALIAS_CONFIGMANAGER_MAKEDATA.call(this)

  if (enableAutosave) config.enableAutosaving = this.enableAutosaving
  if (enableQuicksave) config.enableQuicksaving = this.enableQuicksaving

  return config
}

const DDM_ALIAS_CONFIGMANAGER_APPLYDATA = window.ConfigManager.applyData
window.ConfigManager.applyData = function (config) {
  DDM_ALIAS_CONFIGMANAGER_APPLYDATA.call(this, config)

  if (!r_isEmpty(config)) {
    if (enableAutosave) this.enableAutosaving = config.enableAutosaving
    if (enableQuicksave) this.enableQuicksaving = config.enableQuicksaving
  }
}

// ================================================
// Window_Options

// EDIT: Add in autosave and quicksave options if players don't want to use them.
const DDM_ALIAS_WINDOW_OPTIONS_MAKECOMMANDLIST = window.Window_Options.prototype.makeCommandList
window.Window_Options.prototype.makeCommandList = function () {
  DDM_ALIAS_WINDOW_OPTIONS_MAKECOMMANDLIST.call(this)
  if (enableAutosave) this.addCommand('Enable Autosaving', 'enableAutosaving')
  if (enableQuicksave) this.addCommand('Enable Quicksaving', 'enableQuicksaving')
}

// ================================================
// Scene_File

// EDIT: Removes this.needsAutosave from setMode.
window.Scene_File.prototype.createListWindow = function () {
  const rect = this.listWindowRect()
  this._listWindow = new window.Window_SavefileList(rect)
  this._listWindow.setHandler('ok', this.onSavefileOk.bind(this))
  this._listWindow.setHandler('cancel', this.popScene.bind(this))
  this._listWindow.setMode(this.mode())
  this._listWindow.selectSavefile(this.firstSavefileId())
  this._listWindow.refresh()
  this.addWindow(this._listWindow)
}

// This isn't needed as it is handled by another method.
delete window.Scene_File.prototype.needsAutosave

// ************************************************
// ================================================

// ================================================
// Scene_Save

// EDIT: index 0 is always the most recent save.
window.Scene_Save.prototype.firstSavefileId = function () {
  return 0
}

// EDIT: changes the way a normal hard save is saved.
window.Scene_Save.prototype.executeSave = function (savefileId) {
  let saveId = savefileId
  if (savefileId === emptySlotName) {
    const nextNumber = window.DataManager.nextEmptyHardsave()
    window.DataManager.incrementSavesNum('Hardsave')
    saveId = `Hardsave-${nextNumber}`
  }

  window.$gameSystem.onBeforeSave()
  window.DataManager.saveGame(saveId)
    .then((resp) => {
      if (resp) {
        this.onSaveSuccess()
      } else {
        window.DataManager.decrementSavesNum('Hardsave')
        this.onSaveFailure()
      }
    })
    .catch(() => {
      window.DataManager.decrementSavesNum('Hardsave')
      this.onSaveFailure()
    })
}

// ************************************************
// ================================================

// ================================================
// Scene_Load

// EDIT: 0 is always the most recent save.
window.Scene_Load.prototype.firstSavefileId = function () {
  return 0
}

// ************************************************
// ================================================

// ================================================
// Scene_Map

// EDIT: Reset isQuickloading when the scene starts,
// so it will autosave on other transitions.
const DDM_ALIAS_SCENE_MAP_START = window.Scene_Map.prototype.start
window.Scene_Map.prototype.start = function () {
  DDM_ALIAS_SCENE_MAP_START.call(this)
  if (window.DataManager.isQuickloading) window.DataManager.isQuickloading = false
}

// EDIT: Prevent autosaving when quickloading.
window.Scene_Map.prototype.shouldAutosave = function () {
  return !this._lastMapWasNull && !window.DataManager.isQuickloading
}

// New function that does the fading out when a quick load is called.
window.Scene_Map.prototype.quickloadFade = function () {
  window.Graphics.screenTransition()
  const time = 0
  window.AudioManager.fadeOutBgm(time)
  window.AudioManager.fadeOutBgs(time)
  window.AudioManager.fadeOutMe(time)
}

// New to be able to hook into quicksave success.
window.Scene_Map.prototype.onQuicksaveSuccess = function () {
  window.SoundManager.playSave()
}

window.Scene_Map.prototype.onQuickloadSuccess = function () {
  window.SoundManager.playLoad()
}

// New function for the Scene_Map to perform quicksaves.
window.Scene_Map.prototype.quickSave = async function () {
  const quicksaveId = makeSavefileId('Quicksave')

  window.DataManager.lastQuicksave = quicksaveId

  window.$gameSystem.onBeforeSave()

  window.DataManager.saveGame(quicksaveId).then((resp) => {
    window.DataManager.isQuicksaving = false
    if (resp) {
      this.onQuicksaveSuccess()
      return true
    }
    return false
  })
}

// New function for Scene_Map to perform quick loads.
window.Scene_Map.prototype.quickload = function () {
  if (window.DataManager.lastQuicksave === undefined) return

  const savefileId = `Quicksave-${window.DataManager.lastQuicksave}`

  this.quickloadFade()

  window.DataManager.loadGame(savefileId).then((resp) => {
    if (resp) {
      const mapId = window.$gameMap.mapId()
      const x = window.$gamePlayer.x
      const y = window.$gamePlayer.y
      const d = window.$gamePlayer.direction()
      window.$gamePlayer.reserveTransfer(mapId, x, y, d, 0)
      if (window.$gameSystem.versionId() !== window.$dataSystem.versionId) {
        window.$gamePlayer.requestMapReload()
      }
      this.onQuickloadSuccess()
      return true
    }
    return false
  })
}

// ================================================
// Add to updateScene in Scene_Map + add functions
// to get the quickload and quicksave working.

const DDM_ALIAS_SCENE_MAP_UPDATESCENE = window.Scene_Map.prototype.updateScene
window.Scene_Map.prototype.updateScene = function () {
  DDM_ALIAS_SCENE_MAP_UPDATESCENE.call(this)
  if (!window.SceneManager.isSceneChanging()) {
    if (enableQuicksave && window.ConfigManager.enableQuicksaving) this.updateQuicksave()
  }
  if (!window.SceneManager.isSceneChanging()) {
    if (enableQuicksave && window.ConfigManager.enableQuicksaving) this.updateQuickload()
  }
}

window.Scene_Map.prototype.updateQuicksave = function () {
  if (window.$gameSystem.isSaveEnabled() && !window.DataManager.isQuicksaving) {
    if (this.isQuicksaveCalled()) {
      window.DataManager.isQuicksaving = true
      this.quickSave()
    }
  }
}

window.Scene_Map.prototype.isQuicksaveCalled = function () {
  return window.Input.isTriggered('quicksave') && !this.isBusy()
}

window.Scene_Map.prototype.updateQuickload = function () {
  if (window.$gameSystem.isSaveEnabled() && !window.DataManager.isQuicksaving) {
    if (this.isQuickloadCalled()) {
      window.DataManager.isQuickloading = true
      this.quickload()
    }
  }
}

window.Scene_Map.prototype.isQuickloadCalled = function () {
  return window.Input.isTriggered('quickload') && !this.isBusy()
}

// ************************************************
// ================================================

// ================================================
// PLUGIN COMMANDS

window.PluginManager.registerCommand(pluginName, 'triggerAutosave', () => {
  if (enableAutosave && window.ConfigManager.enableAutosaving)
    window.Scene_Base.prototype.executeAutosave()
})
