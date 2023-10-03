import { isEmpty as r_isEmpty } from 'ramda'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

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

const initInputState = {
  inputIndex: {},
  // use defaultCommandIndex as base because when saving undefined values are lost.
  commandIndex: defaultCommandIndex,
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
          console.log('Saved Default.')

          set((state) => {
            Object.entries(defaultCommandIndex).forEach(([command, inputObj]) => {
              state.commandIndex[command] = {}
              Object.entries(inputObj).forEach(([type, value]) => {
                state.commandIndex[command][type] = value

                if (!state.inputIndex[type]) state.inputIndex[type] = {}
                state.inputIndex[type][`${value}`] = command
              })
            })
          })

          return defaultCommandIndex
        }

        let saveObj = resetToDefault ? setDefaultCommands() : get().commandIndex

        if (r_isEmpty(saveObj)) {
          saveObj = setDefaultCommands()
        }

        if (window.electron)
          await window.electron.ipcRenderer
            .invoke('save-object', undefined, 'inputIndex.json', saveObj, false)
            .then(() => {
              console.log('Command Index saved.')
            })
            .catch(() => {
              console.log('Command Index failed to save.')
            })
      },
      loadInput: async () => {
        if (window.electron) {
          const fileExists = await window.electron.ipcRenderer.invoke(
            'file-exists',
            undefined,
            'inputIndex.json'
          )

          if (fileExists) {
            const commandIndex = await window.electron.ipcRenderer.invoke(
              'read-object',
              undefined,
              'inputIndex.json',
              false
            )

            if (commandIndex) {
              const currentIndex = get().commandIndex
              console.log('Command Index loaded.')
              set((state) => {
                Object.entries(currentIndex).forEach(([command, inputObj]) => {
                  state.commandIndex[command] = {}
                  Object.keys(inputObj).forEach((type) => {
                    state.commandIndex[command][type] = commandIndex[command][type]

                    if (!state.inputIndex[type]) state.inputIndex[type] = {}
                    state.inputIndex[type][`${commandIndex[command][type]}`] = command
                  })
                })
              })
            } else {
              console.log('Command Index failed to load.')
              await get().saveInput(true)
            }
          } else {
            console.log("File doesn't exist.")
            await get().saveInput(true)
          }
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

export { useInputStore }
