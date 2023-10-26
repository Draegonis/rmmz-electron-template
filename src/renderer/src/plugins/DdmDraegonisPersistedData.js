// Store
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
// Managers
import { CoreManager } from '../managers/coreManager'
// Data
import { v4 as uuidV4 } from 'uuid'
// Helpers
import { setGameVars, getGameVars } from '../helpers/gameFuncs'
import { parseSelfSW, parseNumber } from '../helpers/gameParsers'
import { isEmpty as r_isEmpty } from 'ramda'

// ==============================================================
// PLUGIN SETUP

const pluginName = 'DdmDraegonisPersistedData'

window.Imported = window.Imported || {}
window.Imported[pluginName] = 1.0

const params = window.PluginManager.parameters(pluginName)

// ==============================================================
// STORE SETUP

const persistPath = ['save', 'persistData.rmmzsave']

// ===================================================
//                    INIT-STATE

/**
 * The initial state for the persist store.
 */
const initPersist = {
  isInit: false,
  currentId: '',
  stored: {
    var: {},
    switch: {},
    selfSW: {}
  }
}

/**
 * A function that updates specific parts of state.stored in the database.
 * @param {string} key - the key in state.stored to update.
 * @param {Draft} state - the WritableDraft of state.
 */
const storeSingleType = (key, state) => {
  const stored = state.stored
  const setVarsToStore = () => {
    if (stored && !r_isEmpty(stored.var)) {
      for (const id of Object.keys(stored.var)) {
        const newValue = getGameVars.var(id)
        stored.var[id] = newValue
      }
    }
  }
  const setSwitchesToStore = () => {
    if (stored && !r_isEmpty(stored.switch)) {
      for (const id of Object.keys(stored.switch)) {
        const newValue = getGameVars.switch(id)
        stored.switch[id] = newValue
      }
    }
  }
  const setSelfSWtoStore = () => {
    if (stored && !r_isEmpty(stored.selfSW)) {
      for (const id of Object.keys(stored.selfSW)) {
        const newValue = getGameVars.selfSW(id)
        stored.selfSW[id] = newValue
      }
    }
  }
  // Setting the variable/switch/selfSW data to the store.

  switch (key) {
    case 'var':
      setVarsToStore()
      break
    case 'switch':
      setSwitchesToStore()
      break
    case 'selfSW':
      setSelfSWtoStore()
      break
    case 'all':
      setVarsToStore()
      setSwitchesToStore()
      setSelfSWtoStore()
      break
  }
}

/**
 * A function that sets a new uuid string to the store,
 * in the rare case the new id is the same it will generate a new one.
 * @param {Draft} state - the WritableDraft to compare the uuid string.
 * @returns {string} returns the new uuid string.
 */
const setNewId = (state) => {
  let newId = ''

  do {
    newId = uuidV4()
  } while (newId === state.currentId)

  state.currentId = newId

  return newId
}

// ===================================================
//                     STORE

/**
 * The Zustand store that manages the persist state. It uses indexeddb so the data
 * can be retrieved for all save games.
 */
const persistStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        ...initPersist,
        /**
         * A function to initialize the store variables.
         */
        initStore() {
          const isInit = get().isInit

          if (isInit) return

          // params here for starting state.
          const variableList = JSON.parse(params.variableList)
          const switchList = JSON.parse(params.switchList)
          const eventList = JSON.parse(params.eventList)

          let convertedEventList = undefined
          if (eventList.length > 0) {
            convertedEventList = eventList.map(parseSelfSW)
          }

          const StoreIndex = {
            var: variableList.length > 0 ? variableList.map(parseNumber) : undefined,
            switch: switchList.length > 0 ? switchList.map(parseNumber) : undefined,
            selfSW: convertedEventList ? convertedEventList : undefined
          }

          set((state) => {
            state.currentId = uuidV4()

            Object.keys(StoreIndex).forEach((key) => {
              if (StoreIndex[key]) {
                StoreIndex[key].forEach((entry) => {
                  state.stored[key][entry] = null
                })
              }
            })

            state.isInit = true
          })
        },
        /**
         * Fetches the data in the store if needed. If the uuid Id is the same it shouldn't
         * need to fetch since the data should be the same as the data in the store.
         * @param {string} storeId - the uuid stored in the save file to be compared with
         * the uuid in the store.
         */
        loadStore(storeId) {
          const { currentId, stored } = get()

          if (currentId !== storeId && stored) {
            Object.entries(stored).forEach(([key, obj]) => {
              if (!r_isEmpty(stored[key])) {
                Object.entries(obj).forEach(([id, value]) => {
                  if (value !== null) setGameVars[key](id, value)
                })
              }
            })
          }
        },
        /**
         * Updates the data in the localStorage.
         * @returns {string} Returns a uuid string to be saved into the Rmmz save file.
         */
        saveStore() {
          let newId = ''

          set((state) => {
            newId = setNewId(state)
            storeSingleType('all', state)
          })

          return newId
        },
        /**
         * Updates a single entry in the store.
         * @param {string} type the type of persisted data to update the single value of.
         * @param {number | [number, number, string]} id the number or key id to update.
         */
        saveSingleValue(type, id) {
          set((state) => {
            const stored = state.stored[type]

            const newValue = getGameVars[type](id)
            if (newValue !== null) {
              stored[id] = newValue
              setNewId(state)
            }
          })
        },
        saveSingleType(keyToUpdate) {
          set((state) => {
            storeSingleType(keyToUpdate, state)
            setNewId(state)
          })
        }
      })),
      {
        name: `${pluginName}`,
        /**
         * To set/get/remove from indexeddb and able to handle the
         * stored object maps.
         */
        storage: {
          /**
           * The getter called by the store to get the values from the file.
           * @returns {state}
           */
          getItem: async () => {
            const storeState = await CoreManager.loadFromFile(...persistPath, true)

            return {
              state: {
                ...storeState
              }
            }
          },
          /**
           * The setter called by the store to save the data to the file.
           */
          setItem: async (_, newValue) => {
            const storeData = newValue.state

            // this is to remove all functions.
            const str = JSON.stringify(storeData)
            const toSave = JSON.parse(str)

            await CoreManager.saveToFile(...persistPath, toSave, true)
          }
        }
      }
    ),
    {
      name: `${pluginName}`,
      serialize: {
        options: {
          map: true
        }
      }
    }
  )
)

// ===================================================
//                      MANAGER

/**
 * The manager class to expose store functions.
 */
class PersistManager {
  #initStore = persistStore.getState().initStore
  #loadStore = persistStore.getState().loadStore
  #saveStore = persistStore.getState().saveStore
  #saveSingleValue = persistStore.getState().saveSingleValue
  #saveSingleType = persistStore.getState().saveSingleType

  async onStart(refresh) {
    this.#initStore(refresh)
  }

  onLoad(persistUUID) {
    this.#loadStore(persistUUID)
  }

  onSave() {
    return this.#saveStore()
  }

  saveSingleValue(updateType, updateId) {
    this.#saveSingleValue(updateType, updateId)
  }

  saveSingleType(updateKey) {
    this.#saveSingleType(updateKey)
  }
}

const PersistDataManager = new PersistManager()

PersistDataManager.onStart()

// ============================================================================
// PLUGIN COMMANDS

// These are provided if you want to save outside of the normal saving.
window.PluginManager.registerCommand(pluginName, 'saveAll', () => {
  PersistDataManager.onSave()
})
window.PluginManager.registerCommand(pluginName, 'saveVars', () => {
  PersistDataManager.saveSingleType('var')
})
window.PluginManager.registerCommand(pluginName, 'saveSwitches', () => {
  PersistDataManager.saveSingleType('switch')
})
window.PluginManager.registerCommand(pluginName, 'saveSelfSwitches', () => {
  PersistDataManager.saveSingleType('selfSW')
})

// These can be used to add a new value to be persisted later on in a game.
window.PluginManager.registerCommand(pluginName, 'saveSingleVar', ({ varId }) => {
  PersistDataManager.saveSingleValue('var', parseNumber(varId))
})
window.PluginManager.registerCommand(pluginName, 'saveSingleSwitch', ({ switchId }) => {
  PersistDataManager.saveSingleValue('switch', parseNumber(switchId))
})
window.PluginManager.registerCommand(pluginName, 'saveSingleSelfSwitch', ({ selfSW_id }) => {
  PersistDataManager.saveSingleValue('selfSW', parseSelfSW(selfSW_id))
})

// ==================================================================
// PLUGIN ALIAS

const DDM_ALIAS_DATAMANAGER_SETUPNEWGAME = window.DataManager.setupNewGame
window.DataManager.setupNewGame = function () {
  DDM_ALIAS_DATAMANAGER_SETUPNEWGAME.call(this)
  PersistDataManager.onLoad('')
}

// Since the uuid is very small amount of data best to add it within the normal save data.
const DDM_ALIAS_DATAMANAGER_MAKESAVECONTENTS = window.DataManager.makeSaveContents
window.DataManager.makeSaveContents = function () {
  const contents = DDM_ALIAS_DATAMANAGER_MAKESAVECONTENTS.call(this)
  contents.persistUUID = PersistDataManager.onSave()
  return contents
}

const DDM_ALIAS_DATAMANAGER_EXTRACTSAVECONTENTS = window.DataManager.extractSaveContents
window.DataManager.extractSaveContents = function (contents) {
  DDM_ALIAS_DATAMANAGER_EXTRACTSAVECONTENTS.call(this, contents)
  PersistDataManager.onLoad(contents.persistUUID)
}
