import { isEmpty as r_isEmpty } from 'ramda'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const saveInputToFile = async (commandIndexData) => {
  await window.electron.ipcRenderer
    .invoke('save-object', undefined, 'inputIndex.json', commandIndexData, false)
    .catch(() => {
      console.log('Default Command Index failed to save.')
    })
}

const defaultCommandIndex = {
  ok: {
    keyCode: 90,
    button: 2
  },
  cancel: {
    keyCode: 88,
    button: 1
  },
  escape: {
    keyCode: 27,
    button: undefined
  },
  tab: {
    keyCode: 9,
    button: undefined
  },
  shift: {
    keyCode: 16,
    button: 0
  },
  control: {
    keyCode: 17,
    button: undefined
  },
  menu: {
    keyCode: undefined,
    button: 3
  },
  pageup: {
    keyCode: 33,
    button: 4
  },
  pagedown: {
    keyCode: 34,
    button: 5
  },
  up: { keyCode: 38 },
  down: { keyCode: 40 },
  left: { keyCode: 37 },
  right: { keyCode: 39 },
  updown: { axis: 1 },
  leftright: { axis: 0 },
  debug: {
    keyCode: undefined,
    button: undefined
  }
}

const defaultInputIndex = {}
// Set the default input index.
Object.entries(defaultCommandIndex).forEach(([command, inputObj]) => {
  Object.entries(inputObj).forEach(([type, value]) => {
    if (!defaultInputIndex[type]) defaultInputIndex[type] = {}
    defaultInputIndex[type][`${value}`] = command
  })
})

let commandIndexData = undefined
let inputIndexData = undefined

const fileExists = await window.electron.ipcRenderer.invoke(
  'file-exists',
  undefined,
  'inputIndex.json'
)

if (fileExists) {
  const commandInputData = await window.electron.ipcRenderer.invoke(
    'read-object',
    undefined,
    'inputIndex.json',
    false
  )

  // Set new input index data.
  inputIndexData = {}
  Object.entries(commandInputData).forEach(([command, inputObj]) => {
    Object.entries(inputObj).forEach(([type, value]) => {
      if (!inputIndexData[type]) inputIndexData[type] = {}
      inputIndexData[type][`${value}`] = command
    })
  })
} else {
  saveInputToFile(defaultCommandIndex)
}

const initInputState = {
  inputIndex: inputIndexData ? inputIndexData : defaultInputIndex,
  // use defaultCommandIndex as base because when saving undefined values are lost.
  commandIndex: commandIndexData ? commandIndexData : defaultCommandIndex,
  tab: false,
  ok: false,
  cancel: false,
  escape: false,
  shift: false,
  control: false,
  pageup: false,
  pagedown: false,
  up: false,
  down: false,
  right: false,
  left: false,
  debug: false,
  menu: false,
  // new inputs
  ui_up: false,
  ui_down: false,
  ui_left: false,
  ui_right: false,
  ui_toggle: false,
  // state for react ui
  ui_selected: ''
}

const useInputStore = create(
  devtools(
    immer((set, get) => ({
      ...initInputState,
      saveInput: async (resetToDefault) => {
        const setDefaultCommands = () => {
          set((state) => {
            state.commandIndex = defaultCommandIndex
            state.inputIndex = defaultInputIndex
          })

          return defaultCommandIndex
        }

        let saveObj = resetToDefault ? setDefaultCommands() : get().commandIndex

        if (r_isEmpty(saveObj)) {
          saveObj = setDefaultCommands()
        }

        saveInputToFile(saveObj)
      },
      addNewInputCommand: (commandExtension) => {
        let needsSave = false
        set((state) => {
          Object.entries(commandExtension).forEach(([commandName, inputObj]) => {
            if (!state.commandIndex[commandName]) {
              if ('keyCode' in inputObj) state.inputIndex[inputObj['keyCode']] = commandName
              state.commandIndex[commandName] = inputObj
              needsSave = true
            }
          })
        })
        if (needsSave) {
          const commandIndexData = get().commandIndex
          saveInputToFile(commandIndexData)
        }
      },
      updateInput: (command, type, newInput) => {
        set((state) => {
          const { inputIndex, commandIndex } = state

          if (!newInput) {
            if (window.SoundManager) window.SoundManager.playBuzzer()
            return
          }

          const oldInput = commandIndex[command][type]
          const switchCommand = inputIndex[type][`${newInput}`]

          // set the new input/command
          if (
            !oldInput &&
            (switchCommand === 'ok' ||
              switchCommand === 'cancel' ||
              switchCommand === 'menu' ||
              switchCommand === 'escape')
          ) {
            if (window.SoundManager) window.SoundManager.playBuzzer()
          } else {
            inputIndex[type][`${newInput}`] = command
            commandIndex[command][type] = newInput

            if (oldInput && switchCommand && switchCommand !== command) {
              inputIndex[type][`${oldInput}`] = switchCommand
              commandIndex[switchCommand][type] = oldInput
            }
          }
        })
      }
    }))
  ),
  {
    store: 'Electron-Vite-Inputs'
  }
)

export const addNewInput = (commandExtension) => {
  Object.entries(commandExtension).forEach(([commandName, inputObj]) => {
    defaultCommandIndex[commandName] = inputObj
  })
  useInputStore.getState().addNewInputCommand(commandExtension)
}

export { useInputStore }
