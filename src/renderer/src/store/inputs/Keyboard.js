import { useInputStore } from './useInputStore'

const shouldPreventDefault = function (keyCode) {
  switch (keyCode) {
    case 8: // backspace
    case 9: // tab
    case 33: // pageup
    case 34: // pagedown
    case 37: // left arrow
    case 38: // up arrow
    case 39: // right arrow
    case 40: // down arrow
      return true
  }
  return false
}

const onKeyDown = function (event) {
  if (shouldPreventDefault(event.keyCode)) {
    event.preventDefault()
  }
  if (event.keyCode === 144) {
    // Numlock
    window.Input.clear()
  }
  const index = useInputStore.getState().inputIndex.keyCode[event.keyCode]

  if (
    window.Input.tempInput &&
    window.Input.tempInput.command &&
    window.Input.tempInput.type &&
    window.Input.tempInput.type === 'keyCode' &&
    window.Input.waitingForInput
  ) {
    if (index !== window.Input.tempInput.command)
      window.Input.tempInput.oldCommand = `${index}-${window.Input.tempInput.type}`
    useInputStore
      .getState()
      .updateInput(window.Input.tempInput.command, window.Input.tempInput.type, event.keyCode)
    window.Input.waitingForInput = false
  } else {
    if (index) {
      useInputStore.setState({ [index]: true })
    }
  }
}

const onKeyUp = function (event) {
  const index = useInputStore.getState().inputIndex.keyCode[event.keyCode]
  if (index) {
    useInputStore.setState({ [index]: false })
  }
}

document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp)
