import { useInputStore } from './useInputStore'

window.addEventListener('mousedown', (e) => {
  if (!window.Graphics) return

  const button = e.button
  const index = useInputStore.getState().inputIndex.mouse[button]
  const x = window.Graphics.pageToCanvasX(e.pageX)
  const y = window.Graphics.pageToCanvasY(e.pageY)

  if (
    window.Input.tempInput &&
    window.Input.tempInput.command &&
    window.Input.tempInput.type &&
    window.Input.tempInput.type === 'mouse' &&
    window.Input.waitingForInput
  ) {
    if (index !== window.Input.tempInput.command)
      window.Input.tempInput.oldCommand = `${index}-${window.Input.tempInput.type}`
    useInputStore
      .getState()
      .updateInput(window.Input.tempInput.command, window.Input.tempInput.type, button)
    window.Input.waitingForInput = false
  } else {
    if (index && window.Graphics.isInsideCanvas(x, y)) {
      useInputStore.setState({ [index]: true })
    }
  }
})

window.addEventListener('mouseup', (e) => {
  const button = e.button
  const index = useInputStore.getState().inputIndex.mouse[button]

  if (index) {
    useInputStore.setState({ [index]: false })
  }
})
