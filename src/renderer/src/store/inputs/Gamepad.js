import { GamepadListener } from 'gamepad.js'
import { useInputStore } from './useInputStore'

const gamepadListener = new GamepadListener({
  analog: false,
  deadZone: 0.2
})

gamepadListener.on('gamepad:connected', (event) => {
  const { gamepad } = event.detail

  window.Input.gamepadConnected = true

  console.log('Gamepad Connected: ', gamepad)
})

gamepadListener.on('gamepad:disconnected', (event) => {
  const { index } = event.detail

  window.Input.gamepadConnected = false

  console.log('Gamepad Disconnected: ', index)
})

gamepadListener.on('gamepad:axis', (event) => {
  const { axis, value } = event.detail

  const index = useInputStore.getState().inputIndex.axis[axis]

  if (
    (value === 1 || value === -1) &&
    window.Input.tempInput &&
    window.Input.tempInput.type === 'axis' &&
    window.Input.waitingForInput
  ) {
    if (index !== window.Input.tempInput.command)
      window.Input.tempInput.oldCommand = `${index}-${window.Input.tempInput.type}`
    useInputStore
      .getState()
      .updateInput(window.Input.tempInput.command, window.Input.tempInput.type, axis)
    window.Input.waitingForInput = false
  } else {
    switch (index) {
      case 'leftright': {
        if (value === 1) useInputStore.setState({ right: true })
        if (value === -1) useInputStore.setState({ left: true })
        if (value === 0) useInputStore.setState({ left: false, right: false })
        break
      }
      case 'updown': {
        if (value === 1) useInputStore.setState({ down: true })
        if (value === -1) useInputStore.setState({ up: true })
        if (value === 0) useInputStore.setState({ up: false, down: false })
        break
      }
      case 'ui_leftright': {
        if (value === 1) useInputStore.setState({ ui_right: true })
        if (value === -1) useInputStore.setState({ ui_left: true })
        if (value === 0) useInputStore.setState({ ui_left: false, ui_right: false })
        break
      }
      case 'ui_updown': {
        if (value === 1) useInputStore.setState({ ui_down: true })
        if (value === -1) useInputStore.setState({ ui_up: true })
        if (value === 0) useInputStore.setState({ ui_up: false, ui_down: false })
        break
      }
    }
  }
})

gamepadListener.on('gamepad:button', (event) => {
  const { button, pressed } = event.detail

  const index = useInputStore.getState().inputIndex.button[button]

  if (
    pressed &&
    window.Input.tempInput &&
    window.Input.tempInput.type === 'button' &&
    window.Input.waitingForInput
  ) {
    if (index !== window.Input.tempInput.command)
      window.Input.tempInput.oldCommand = `${index}-${window.Input.tempInput.type}`
    useInputStore
      .getState()
      .updateInput(window.Input.tempInput.command, window.Input.tempInput.type, button)
    window.Input.waitingForInput = false
  } else {
    useInputStore.setState({ [index]: pressed })
  }
})

gamepadListener.start()
