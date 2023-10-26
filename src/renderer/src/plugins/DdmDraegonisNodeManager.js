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

/**
 * Checks the type to see if it is a node switch.
 * @param {object} data the node data to be checked.
 * @returns {boolean}
 */
const isNodeSwitch = (data) => {
  return data.type === 'switch'
}

/**
 * Checks the type to see if it is a node variable.
 * @param {object} data the node data to be checked.
 * @returns {boolean}
 */
const isNodeVariable = (data) => {
  return data.type === 'var'
}

/**
 * Checks the type to see if it is a node self switch.
 * @param {object} data the node data to be checked.
 * @returns {boolean}
 */
const isNodeSelfSW = (data) => {
  return data.type === 'selfSW'
}

// ===================================================
// Unique Parsers

/**
 * The base parser for node events, all events will have these properties.
 * @param {object} nodeEvent the node event to be parsed.
 * @returns {{tick: number, isTrackable: boolean}}
 */
const parseBaseEvent = (nodeEvent) => {
  return { tick: parseNumber(nodeEvent.tick), isTrackable: parseBoolean(nodeEvent.isTrackable) }
}

/**
 * A parser to handle node switch event data from Rpg Maker.
 * @param {{id: string, switchId: string, newValue: string, type: string, tick: string, isTrackable: string}} switchEvent
 * the switch event data that needs to be converted into usable values.
 * @returns {{ tick: number, isTrackable: boolean, switchId: number, newValue: boolean, id: string, type: string }}
 */
const parseSwitchEvent = (switchEvent) => {
  const { id } = switchEvent
  const switchId = parseNumber(switchEvent.switchId)
  const newValue = parseBoolean(switchEvent.newValue)
  const type = 'switch'
  return { ...parseBaseEvent(switchEvent), switchId, newValue, id, type }
}

/**
 * A parser to handle node variable event data from Rpg Maker.
 * @param {{id: string, variableId: string, newNumber: string | undefined, newNumberArray: string | undefined, newString: string | undefined, newStringArray: string | undefined, type: string, tick: string, isTrackable: string}} variableEvent
 * the variable event data that needs to be converted into usable values.
 * @returns {{ tick: number, isTrackable: boolean, variableId: number, newValue: number | number[] | string | string[], id: string, type: string }}
 */
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

/**
 * A parser to handle node self switch event data from Rpg Maker.
 * @param {{id: string, key: string, newValue: string, type: string, tick: string, isTrackable: string}} selfSW_Event
 * the self switch event data that needs to be converted into usable values.
 * @returns {{ tick: number, isTrackable: boolean, key: [number, number, string], newValue: boolean, id: string, type: string }}
 */
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
  /**
   * the variable that is undefined or a Worker.
   */
  #worker
  /**
   * this is true when the data is being worked on in the worker.
   */
  #workInProgress = false

  /**
   * the holder for the interval so it can be stopped/cleared.
   */
  #interval = undefined
  /**
   * the counter for the seconds, up to the secondsPerTick.
   */
  #seconds = 0
  /**
   * how many seconds there are per node tick.
   */
  #secondsPerTick

  /**
   * the variable that determines whether to have the interval active automatically.
   */
  #autoTick = true
  get _isAutoTicking() {
    return this.#autoTick
  }
  /**
   * A method to resume the automatic start/stop of the tick when switching scenes.
   */
  resumeAutoTick() {
    this.#autoTick = true
  }
  /**
   * A method to pause the automatic start/stop of the tick when switching scenes.
   */
  pauseAutoTick() {
    this.#autoTick = false
  }

  /**
   * The variable that controls the node ticks manually.
   */
  #manualPause = false
  get _isPaused() {
    return this.#manualPause
  }
  /**
   * A method to be used by plugin command to resume the node ticks.
   */
  requestTickPause() {
    this.#manualPause = true
  }
  /**
   * A method to be used by plugin command to pause the node ticks.
   */
  requestTickResume() {
    this.#manualPause = false
  }

  /**
   * the current game tick.
   */
  #tick = 0
  get _tick() {
    return this.#tick
  }

  /**
   * the container that holds all node information.
   */
  #tickEvents = []
  get _tickEvents() {
    return this.#tickEvents
  }
  /**
   * the object that holds a reference to all node events with isTrackable === true.
   */
  #trackedEvents = {}
  get _trackedEvents() {
    return this.#trackedEvents
  }

  /**
   * a backup in case a node event is added while the worker is busy.
   */
  #eventCache = []

  constructor(secondsPerTick) {
    this.#secondsPerTick = secondsPerTick
    this.#worker = undefined
  }

  /**
   * The method to start the game tick.
   */
  start() {
    this.#initWorker()
    this.#createInterval()
  }
  /**
   * The method to stop game tick.
   */
  stop() {
    this.#terminateWorker()
    this.#clearInterval()
  }
  /**
   * The method called to setup the save data for the save file.
   */
  onSave() {
    const saveData = {
      nodeEvents: this.#tickEvents,
      nodeTracked: this.#trackedEvents
    }
    // Add a fake event at the end of nodeEvents with the current tick so it
    // can be retrieved from the save file.
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
    if (!this.#worker) {
      this.#worker = new DdmNodeWorker()

      this.#worker.onmessage = async ({ data }) => {
        const { eventsToFire, newEvents, newTracked } = data

        this.#tickEvents.length = 0
        this.#workInProgress = false

        this.#setEventData(newEvents, newTracked)
        if (!isEmpty(eventsToFire)) this.#onWorkFinished(eventsToFire)
      }
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
  #createInterval() {
    if (!this.#interval) {
      this.#interval = window.setInterval(() => {
        if (NodeManager._isAutoTicking && !NodeManager._isPaused) {
          console.log('Tick is running.')
          if (this.#seconds === this.#secondsPerTick) {
            this.#seconds = 0
            this.#tick++
            this.#onTick()
          }
        }
        this.#seconds++
      }, 1000)
    }
  }
  /**
   *
   */
  #clearInterval() {
    if (this.#interval) {
      clearInterval(this.#interval)
      this.#interval = undefined
    }
  }
  /**
   * a method for when the tick has been increased and needs to pass all the events to the worker.
   */
  async #onTick() {
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
   * a method that takes the new data and assigns them into the proper variables.
   */
  #setEventData(newEvents, newTracked) {
    if (!isEmpty(newTracked)) {
      Object.assign(this.#trackedEvents, newTracked)
    }

    this.#tickEvents.push(...newEvents)
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
   * a method that runs the proper function on the events that are at tick 0.
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
  NodeManager.resumeAutoTick()
})
window.addEventListener('blur', () => {
  NodeManager.pauseAutoTick()
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
  NodeManager.requestTickResume()
})
window.PluginManager.registerCommand(pluginName, 'pauseTick', () => {
  NodeManager.requestTickPause()
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
  NodeManager.stressTest(30000, 300, true)
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

    // Manage auto tick state for when it is on the map.
    // Can easily be changed to include other scenes.
    if (this._nextScene instanceof window.Scene_Map) {
      NodeManager.resumeAutoTick()
    }
    if (!(this._nextScene instanceof window.Scene_Map)) {
      NodeManager.pauseAutoTick()
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
