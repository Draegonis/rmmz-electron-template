import { useInputStore } from '../../store/inputs/useInputStore'

/**
 * A container to hold as many functions without causing re-renders.
 * @returns {null}
 */
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
