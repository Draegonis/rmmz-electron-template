import { addNewInput } from '../store/inputs/useInputStore'

const pluginName = 'DdmDraegonisSaveOverhaul'

window.Imported = window.Imported || {}
window.Imported.DdmDraegonis = window.Imported.DdmDraegonis || {}
window.Imported.DdmDraegonis.SaveOverhaul = true

const emptySlotName = 'Empty Save Slot'

const params = window.PluginManager.parameters(pluginName)
const enableAutosave = params.enable_autosave === 'true'
const maxAutoSaves = Number(params.maxAutosaves || 5)
const maxQuicksaves = Number(params.maxQuicksaves || 5)

addNewInput({ quickload: { keyCode: 119 }, quicksave: { keyCode: 116 } })

//============
// DataManager

// New variables to hold saving data for quicksave/autosave/hardsave
window.DataManager.earliestQuicksave = ''
window.DataManager.earliestAutosave = ''

window.DataManager._numOfAutosaves = 0
window.DataManager._numOfQuicksaves = 0
window.DataManager._numOfHardsaves = 0

window.DataManager._maxAutoSaves = maxAutoSaves > 0 ? maxAutoSaves : 1
window.DataManager._maxQuicksaves = maxQuicksaves > 0 ? maxQuicksaves : 1
window.DataManager._maxHardsaves = 20

// This is no longer used.
delete window.DataManager.makeSavename

// Have to send the filename to the electron side and
// the return if it fails triggers the delete globalInfo.
// Changed to async / for await to await the invoke in case the array
// array changes overlap/out of sync. Might not be needed.
window.DataManager.removeInvalidGlobalInfo = async function () {
  const removeIndex = []
  for await (const info of this._globalInfo) {
    // savefileId is the same as the saveFileName
    const savefileId = info.savefileId
    // Changed logic to make sure it runs in order.
    const isSave = await window.electron.ipcRenderer.invoke(
      'file-exists',
      'save',
      `${savefileId}.rmmzsave`
    )
    const infoIndex = this._globalInfo.findIndex((file) => file.savefileId === savefileId)

    if (!isSave) {
      removeIndex.push(infoIndex)
    } else {
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

  // Set the earliest save for the autosave/quicksave rotation after the invalid globalInfo's are removed.
  const earliestQuicksave = this.earliestSavefileId('Quicksave')
  this.earliestQuicksave = earliestQuicksave ? earliestQuicksave : ''
  const earliestAutosave = this.earliestSavefileId('Autosave')
  this.earliestAutosave = earliestAutosave ? earliestAutosave : ''
}

window.DataManager.isAnySavefileExists = function () {
  return this._globalInfo.some((x) => x)
}

// lastest save is always index 0 savefileId.
window.DataManager.latestSavefileId = function () {
  return this._globalInfo[0].savefileId
}

// returns the safefileId of the earliest instead of an int.
window.DataManager.earliestSavefileId = function (saveType) {
  const globalInfo = saveType
    ? this._globalInfo.filter((info) => info.saveType === saveType)
    : this._globalInfo
  if (globalInfo.length > 0) {
    const earliest = Math.min(...globalInfo.map((x) => x.timestamp))
    if (earliest.length > 0) {
      const info = globalInfo.find((x) => x && x.timestamp === earliest)
      return info.savefileId
    }
    return undefined
  }
  return undefined
}

// removed selectSavefileForNewGame as it is no longer needed.
// New saves are automatically added in front of the globalInfo array.
window.DataManager.setupNewGame = function () {
  this.createGameObjects()
  window.$gameParty.setupStartingMembers()
  window.$gamePlayer.setupForNewGame()
  window.Graphics.frameCount = 0
}
delete window.DataManager.selectSavefileForNewGame
delete window.DataManager.emptySavefileId

// Add in the max autosaves + quicksaves.
window.DataManager.maxSavefiles = function () {
  return this.maxHardsaves() + this.maxAutoSaves() + this.maxQuickSaves()
}

// new function to return the max saves based on the type given.
window.DataManager.returnMaxSaves = function (saveType) {
  switch (saveType) {
    case 'Autosave':
      return this.maxAutoSaves()
    case 'Quicksave':
      return this.maxQuickSaves()
    case 'Hardsave':
      return this.maxHardsaves()
    default:
      return -1
  }
}

// new, the amount of autosaves in the rotation.
window.DataManager.maxAutoSaves = function () {
  return enableAutosave ? this._maxAutoSaves : 0
}

// new, the amount of quicksaves in the rotation.
window.DataManager.maxQuickSaves = function () {
  return this._maxQuicksaves
}

// new, the max amount of hardsaves.
window.DataManager.maxHardsaves = function () {
  return this._maxHardsaves
}

// new function to get the current total of saves.
window.DataManager.currentTotalSavesNum = function () {
  const autoSaveCount = enableAutosave ? this._numOfAutosaves : 0
  return autoSaveCount + this._numOfQuicksaves + this._numOfHardsaves
}

window.DataManager.nextEmptySaveNumber = function (saveType) {
  let saveTest = 1
  let returnNum = 0
  let testing = true
  do {
    const testInfo = this._globalInfo.find((info) => info.savefileId === `${saveType}-${saveTest}`)
    if (!testInfo) {
      returnNum = saveTest
      testing = false
    }
    saveTest++
  } while (testing)

  return returnNum > 0 ? returnNum : 1
}

// new function to return the amount of certain type of save.
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

// new function to increase the countOf of the different types.
window.DataManager.incrementSavesNum = function (saveType) {
  switch (saveType) {
    case 'Autosave':
      return this._numOfAutosaves++
    case 'Quicksave':
      return this._numOfQuicksaves++
    case 'Hardsave':
      return this._numOfHardsaves++
  }
}

// new function to decrease the countOf of the different types.
window.DataManager.decrementSavesNum = function (saveType) {
  switch (saveType) {
    case 'Autosave':
      return this._numOfAutosaves--
    case 'Quicksave':
      return this._numOfQuicksaves--
    case 'Hardsave':
      return this._numOfHardsaves--
  }
}

window.DataManager.savefileInfo = function (savefileId) {
  const globalInfo = this._globalInfo
  // change because savefileId is no longer an int to index globalInfo.
  const saveInfo = globalInfo.find((info) => info.savefileId === savefileId)
  return saveInfo ? saveInfo : null
}

// WIP - when saving add a new empty object at the end of the array unless
// the array length is too long.
window.DataManager.saveGame = function (savefileId) {
  const contents = this.makeSaveContents()
  const saveName = savefileId
  return StorageManager.saveObject(saveName, contents).then(() => {
    // since savefileId is no longer an index in globalInfo array, need to find the index
    // in order to update the globalInfo array. Makes the new save the first entry into the array
    // so it should appear at the top of the save file list.

    const fileIndex = this._globalInfo.findIndex((file) => file.savefileId === savefileId)

    const newInfo = this.makeSavefileInfo(savefileId)

    if (fileIndex > 0) {
      // if fileIndex is > 0, remove it from the globalInfo array and place a new entry at the front
      // of the array.
      this._globalInfo.splice(fileIndex, 1)
      this._globalInfo.unshift(newInfo)
    } else if (fileIndex === 0) {
      // if fileIndex is 0, update the first entry.
      this._globalInfo[0] = newInfo
    } else {
      // if fileIndex = -1 only add the new entry in front of the globalInfo array.
      this._globalInfo.unshift(newInfo)
    }

    this.saveGlobalInfo()
    return true
  })
}

window.DataManager.loadGame = function (savefileId) {
  const saveName = savefileId
  return StorageManager.loadObject(saveName).then((contents) => {
    this.createGameObjects()
    this.extractSaveContents(contents)
    this.correctDataErrors()
    return true
  })
}

// add new entries into the info saved to globalInfo array.
// saveType === 'Autosave' | 'Quicksave' | 'Hardsave'
// savefileId is used to find the index/info in globalInfo array.
window.DataManager.makeSavefileInfo = function (savefileId) {
  const saveType = savefileId.split('-')[0]
  const info = {}
  info.title = window.$dataSystem.gameTitle
  info.characters = window.$gameParty.charactersForSavefile()
  info.faces = window.$gameParty.facesForSavefile()
  info.playtime = window.$gameSystem.playtimeText()
  info.timestamp = Date.now()
  info.saveType = saveType
  info.savefileId = savefileId
  return info
}

//*********/
//==========

//====================
// Window_SavefileList

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
  if (window.DataManager._numOfHardsaves === window.DataManager.maxHardsaves()) {
    // Prevent adding hard saves if the max is reached.
    return window.DataManager.currentTotalSavesNum()
  } else {
    // the + 1 should show as Empty Save Slot.
    if (this._mode === 'save') return window.DataManager.currentTotalSavesNum() + 1
    if (this._mode === 'load') return window.DataManager.currentTotalSavesNum()
  }
}

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
    if (savefileId.includes('Autosave') || savefileId.includes('Quicksave')) {
      return false
    }
    return true
  } else {
    return !!window.DataManager.savefileInfo(savefileId)
  }
}

delete window.Window_SavefileList.savefileIdToIndex

window.Window_SavefileList.prototype.selectSavefile = function (index) {
  this.select(index)
  this.setTopRow(index - 2)
}

window.Window_SavefileList.prototype.drawTitle = function (savefileId, x, y) {
  this.drawText(savefileId, x, y, 180)
}

//******************/
//==================

//===========
// Scene_Base

window.Scene_Base.prototype.isAutosaveEnabled = function () {
  return (
    !window.DataManager.isBattleTest() &&
    !window.DataManager.isEventTest() &&
    enableAutosave &&
    window.$gameSystem.isSaveEnabled()
  )
}

window.Scene_Base.prototype.executeAutosave = function () {
  const maxNumAutosaves = window.DataManager.maxAutoSaves()
  const currentNumAutoSaves = window.DataManager.returnSavesNum('Autosave')

  let autosaveId = ''

  if (window.DataManager.earliestAutosave === `Autosave-${maxNumAutosaves}`) {
    autosaveId = 'Autosave-1'
  } else if (window.DataManager.earliestAutosave === '') {
    autosaveId = 'Autosave-1'
  } else {
    let saveNumber = Number(window.DataManager.earliestAutosave.split('-')[1])
    saveNumber++
    if (currentNumAutoSaves < maxNumAutosaves) window.DataManager.incrementSavesNum('Autosave')
    autosaveId = `Autosave-${saveNumber}`
  }

  window.DataManager.earliestAutosave = autosaveId

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

//===========
// Scene_File

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

delete window.Scene_File.prototype.needsAutosave

//===========
// Scene_Save

window.Scene_Save.prototype.helpWindowText = function () {
  return window.TextManager.saveMessage
}

window.Scene_Save.prototype.firstSavefileId = function () {
  return 0
}

window.Scene_Save.prototype.executeSave = function (savefileId) {
  let saveId = savefileId
  if (savefileId === emptySlotName) {
    const nextNumber = window.DataManager.nextEmptySaveNumber('Hardsave')
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

//===========
// Scene_Load

window.Scene_Load.prototype.firstSavefileId = function () {
  return 0
}
