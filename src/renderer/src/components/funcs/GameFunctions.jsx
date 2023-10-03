import { useInputStore } from '../../store/inputs/useInputStore'

// Doing this to avoid rerenders recreating functions.

const GameFunctions = () => {
  const saveInput = useInputStore((state) => state.saveInput)
  window.Input.saveInputs = function (resetToDefault) {
    saveInput(resetToDefault)
  }

  const loadInput = useInputStore((state) => state.loadInput)
  window.Input.loadInputs = function () {
    loadInput()
  }

  return null
}

export { GameFunctions }
