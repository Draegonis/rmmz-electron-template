import DdmNodeWorker from './workers/nodeHandler?worker'
// Managers
import { CoreManager } from '../managers/coreManager'
// Helpers
import { isEmpty } from 'ramda'
import { setGameVars } from '../helpers/gameFuncs'
import { parseBoolean, parseNumber, parseSelfSW } from '../helpers/gameParsers'
import { v4 as uuidV4 } from 'uuid'

const fileExtension = 'nodeData'

// ==============================================================
// PLUGIN SETUP

const pluginName = 'DdmDraegonisNodeManager'

window.Imported = window.Imported || {}
window.Imported[pluginName] = 1.0

const params = window.PluginManager.parameters(pluginName)
const secondsPerTick = parseNumber(params.secondsPerTick)

// ==============================================================
// HELPERS

const isNodeSwitch = (data) => {
  return data.type === 'switch'
}

const isNodeVariable = (data) => {
  return data.type === 'var'
}

const isNodeSelfSW = (data) => {
  return data.type === 'selfSW'
}

// ===================================================
// Unique Parsers

const parseBaseEvent = (nodeEvent) => {
  return { tick: parseNumber(nodeEvent.tick), isTrackable: parseBoolean(nodeEvent.isTrackable) }
}

const parseSwitchEvent = (switchEvent) => {
  const { id } = switchEvent
  const switchId = parseNumber(switchEvent.switchId)
  const newValue = parseBoolean(switchEvent.newValue)
  const type = 'switch'
  return { ...parseBaseEvent(switchEvent), switchId, newValue, id, type }
}

const parseVariableEvent = (variableEvent) => {
  const { id } = variableEvent
  const variableId = parseNumber(variableEvent.variableId)
  const type = 'var'

  let newValue = undefined

  if (variableEvent.newNumber) newValue = parseNumber(variableEvent.newNumber)
  if (variableEvent.newNumberArray && !newValue) {
    const newNumberArray = JSON.parse(variableEvent.newNumberArray)
    newValue = newNumberArray.map(parseNumber)
  }
  if (variableEvent.newString && !newValue) newValue = variableEvent.newString
  if (variableEvent.newStringArray && !newValue) newValue = JSON.parse(variableEvent.newStringArray)

  return { ...parseBaseEvent(variableEvent), variableId, newValue, id, type }
}

const parseSelfSW_Event = (selfSW_Event) => {
  const { id } = selfSW_Event
  const key = parseSelfSW(selfSW_Event.key)
  const type = 'selfSW'
  const newValue = parseBoolean(selfSW_Event.newValue)

  return { ...parseBaseEvent(selfSW_Event), key, newValue, id, type }
}

// ===================================================
//                MANAGER

class DdmNodeManager {
  #savePath = () => {
    return ['save', `${window.DataManager.currentSave}.nodeData`]
  }

  #worker
  #workInProgress = false

  #interval = undefined
  #seconds = 0
  #secondsPerTick

  #autoTick = true
  get _isPaused() {
    return !this.#autoTick
  }

  #tick = 0
  get _tick() {
    return this.#tick
  }

  #tickEvents = []
  get _tickEvents() {
    return this.#tickEvents
  }
  #trackedEvents = {}
  get _trackedEvents() {
    return this.#trackedEvents
  }

  #eventCache = []

  constructor(secondsPerTick) {
    this.#secondsPerTick = secondsPerTick
    this.#worker = undefined
  }

  /**
   * The method to start the game tick.
   */
  start() {
    if (!this.#worker) this.#initWorker()
    if (!this.#autoTick) this.#autoTick = true
    if (!this.#interval) {
      this.#interval = window.setInterval(() => {
        if (!this.#autoTick) return
        this.#seconds++
        if (this.#seconds === this.#secondsPerTick) {
          this.#seconds = 0
          this.#tick++
          this.#incrementTick()
        }
      }, 1000)
    }
  }
  /**
   * The method to stop game tick.
   */
  stop() {
    if (this.#worker) this.#terminateWorker()

    if (this.#interval) {
      clearInterval(this.#interval)
      this.#interval = undefined
    }
  }
  /**
   * A method to resume the automatic start/stop of the tick when switching scenes.
   */
  resumeTick() {
    if (!this.#worker) this.start()
    this.#autoTick = true
  }
  /**
   * A method to pause the automatic start/stop of the tick when switching scenes.
   */
  pauseTick() {
    this.#autoTick = false
  }
  /**
   * The method called to setup the save data for the save file.
   */
  onSave() {
    const saveData = {
      nodeEvents: this.#tickEvents,
      nodeTracked: this.#trackedEvents
    }
    saveData.nodeEvents.push({
      id: 'storeTick',
      type: 'custom',
      tick: this.#tick
    })

    return saveData
  }
  /**
   * The method called to load data from the save file.
   */
  onLoad(savedData) {
    this.clearEvents()

    const { nodeEvents, nodeTracked } = savedData

    const gameTick = nodeEvents.pop()
    if (gameTick) {
      const { tick } = gameTick
      this.#tick = tick
    } else {
      this.#tick = 0
    }

    this.#setEventData(nodeEvents, nodeTracked)
  }
  /**
   * The method to add an event to the tick que.
   * @param {DdmNodeEvent} eventObj - the event object with id, type and function to call.
   */
  scheduleEvent(eventObj) {
    if (this.#workInProgress) {
      this.#eventCache.push(eventObj)
      return
    }

    if (eventObj.tick < 1) return

    this.#tickEvents.push(eventObj)
  }
  /**
   * The method to clear then entire tick que.
   */
  clearEvents() {
    this.#tickEvents.length = 0
    Object.keys(this.#trackedEvents).forEach((key) => {
      delete this.#trackedEvents[key]
    })
  }
  /**
   * A method to create a new worker instance.
   */
  #initWorker() {
    this.#worker = new DdmNodeWorker()

    this.#worker.onmessage = async ({ data }) => {
      const { eventsToFire, newEvents, newTracked } = data

      this.#workInProgress = false
      this.#setEventData(newEvents, newTracked)
      if (!isEmpty(eventsToFire)) this.#onWorkFinished(eventsToFire)
    }
  }
  /**
   * A method to shutdown the worker and clear it.
   */
  #terminateWorker() {
    if (!this.#worker) return
    this.#worker.terminate()
    this.#worker = undefined
  }
  /**
   *
   */
  async #incrementTick() {
    if (!isEmpty(this.#tickEvents)) {
      this.#workInProgress = true

      if (!this.#worker) {
        console.log('Tried to increment the tick but the worker is not initialized.')
        return
      }

      this.#worker.postMessage(this.#tickEvents)
    }
  }
  /**
   *
   */
  #setEventData(newEvents, newTracked) {
    if (!isEmpty(newTracked)) {
      Object.assign(this.#trackedEvents, newTracked)
    }

    this.#tickEvents.length = 0
    this.#tickEvents = newEvents
  }
  /**
   * A method that schedules the cached events when the worker is finished.
   */
  async #onWorkFinished(eventsToFire) {
    for (const toExecute of eventsToFire) {
      this.#executeEvent(toExecute)
    }

    eventsToFire.length = 0

    if (isEmpty(this.#eventCache)) return

    this.#eventCache.forEach((event) => {
      this.scheduleEvent(event)
    })

    this.#eventCache.length = 0
  }
  /**
   *
   */
  async #executeEvent(toExecute) {
    if (isNodeSelfSW(toExecute)) {
      const { key, newValue } = toExecute
      setGameVars.selfSW(key, newValue)
    } else if (isNodeSwitch(toExecute)) {
      const { switchId, newValue } = toExecute
      setGameVars.switch(switchId, newValue)
    } else if (isNodeVariable(toExecute)) {
      const { variableId, newValue } = toExecute
      setGameVars.var(variableId, newValue)
    }
  }
  /**
   * A method to create items quickly for stress testing.
   * @param {number} amount - the amount of total items to schedule.
   * @param {number} toTick - the items spread over the next 1 - toTick.
   * @param {boolean | undefined} someTrackable - make some items trackable.
   */
  stressTest(amount, toTick, someTrackable) {
    const uuid = uuidV4()

    for (let x = 0; x < amount; x++) {
      const randTick = Math.floor(Math.random() * toTick) + 1
      const id = `${uuid}` + '-' + x

      let randomBool = undefined

      if (someTrackable) {
        randomBool = Math.random() < 0.15
      }

      this.scheduleEvent({
        id,
        type: 'custom',
        tick: randTick,
        isTrackable: randomBool
      })
    }
    console.log('Events: ', this.#tickEvents)
  }
}

const NodeManager = new DdmNodeManager(secondsPerTick)

// Pause/resume based on window state.
window.addEventListener('focus', () => {
  NodeManager.resumeTick()
})
window.addEventListener('blur', () => {
  NodeManager.pauseTick()
})

// ============================================================================
// PLUGIN COMMANDS

window.PluginManager.registerCommand(pluginName, 'switch_Event', async (args) => {
  const nodeEvent = parseSwitchEvent(args)
  NodeManager.scheduleEvent(nodeEvent)
})
window.PluginManager.registerCommand(pluginName, 'variable_Event', async (args) => {
  const nodeEvent = parseVariableEvent(args)
  NodeManager.scheduleEvent(nodeEvent)
})
window.PluginManager.registerCommand(pluginName, 'selfSW_Event', async (args) => {
  const nodeEvent = parseSelfSW_Event(args)
  NodeManager.scheduleEvent(nodeEvent)
})
window.PluginManager.registerCommand(pluginName, 'start', () => {
  NodeManager.start()
})
window.PluginManager.registerCommand(pluginName, 'stop', () => {
  NodeManager.stop()
})
window.PluginManager.registerCommand(pluginName, 'resumeTick', () => {
  NodeManager.resumeTick()
})
window.PluginManager.registerCommand(pluginName, 'pauseTick', () => {
  NodeManager.pauseTick()
})
window.PluginManager.registerCommand(pluginName, 'clearEvents', () => {
  NodeManager.clearEvents()
})

// ==================================================================
// PLUGIN ALIAS

const DDM_ALIAS_SCENE_TITLE_CREATE = window.Scene_Title.prototype.create
window.Scene_Title.prototype.create = function () {
  DDM_ALIAS_SCENE_TITLE_CREATE.call(this)
  NodeManager.clearEvents()
  // You can setup a stress test here.
  // NodeManager.stressTest(30000, 300, true)
}

const DDM_ALIAS_DATAMANAGER_SAVEGAME = window.DataManager.saveGame
window.DataManager.saveGame = function (savefileId) {
  const contents = NodeManager.onSave()

  const dataTask = {
    savefileId,
    extension: fileExtension,
    contents,
    task: 'save'
  }

  CoreManager.registerDataTask(dataTask)

  return DDM_ALIAS_DATAMANAGER_SAVEGAME.call(this, savefileId)
}

const DDM_ALIAS_DATAMANAGER_LOADGAME = window.DataManager.loadGame
window.DataManager.loadGame = function (savefileId) {
  const dataTask = {
    savefileId,
    extension: fileExtension,
    task: 'load',
    thenCallback: (contents) => {
      NodeManager.onLoad(contents)
      return true
    }
  }

  CoreManager.registerDataTask(dataTask)

  return DDM_ALIAS_DATAMANAGER_LOADGAME.call(this, savefileId)
}

// ==================================================================
// PLUGIN OVERWRITE

window.SceneManager.changeScene = function () {
  if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
    if (this._scene) {
      this._scene.terminate()
      this.onSceneTerminate()
    }
    // Manage tick state for when it is on the map.
    // Can easily be changed to include other scenes.
    if (NodeManager._isPaused && this._nextScene instanceof window.Scene_Map) {
      NodeManager.resumeTick()
    }
    if (!NodeManager._isPaused && !(this._nextScene instanceof window.Scene_Map)) {
      NodeManager.pauseTick()
    }
    this._scene = this._nextScene
    this._nextScene = null
    if (this._scene) {
      this._scene.create()
      this.onSceneCreate()
    }
    if (this._exiting) {
      this.terminate()
    }
  }
}
