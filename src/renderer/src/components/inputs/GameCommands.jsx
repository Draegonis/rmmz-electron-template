import { useInputStore } from '../../store/inputs/useInputStore'
import '../../store/inputs/Gamepad'
import '../../store/inputs/Keyboard'
import '../../store/inputs/Mouse'

const GameCommands = () => {
  if (window.Input) {
    window.Input._commands = useInputStore((state) => state.commandIndex)

    if (!window.Input._currentState) window.Input.clear()
    // Axis
    window.Input._currentState['up'] = useInputStore((state) => state.up)
    window.Input._currentState['down'] = useInputStore((state) => state.down)
    window.Input._currentState['left'] = useInputStore((state) => state.left)
    window.Input._currentState['right'] = useInputStore((state) => state.right)
    // Buttons
    window.Input._currentState['tab'] = useInputStore((state) => state.tab)
    window.Input._currentState['ok'] = useInputStore((state) => state.ok)
    window.Input._currentState['cancel'] = useInputStore((state) => state.cancel)
    window.Input._currentState['escape'] = useInputStore((state) => state.escape)
    window.Input._currentState['shift'] = useInputStore((state) => state.shift)
    window.Input._currentState['control'] = useInputStore((state) => state.control)
    window.Input._currentState['pageup'] = useInputStore((state) => state.pageup)
    window.Input._currentState['pagedown'] = useInputStore((state) => state.pagedown)
    window.Input._currentState['debug'] = useInputStore((state) => state.debug)
    window.Input._currentState['menu'] = useInputStore((state) => state.menu)
    // New Axis
    window.Input._currentState['ui_up'] = useInputStore((state) => state.ui_up)
    window.Input._currentState['ui_down'] = useInputStore((state) => state.ui_down)
    window.Input._currentState['ui_left'] = useInputStore((state) => state.ui_left)
    window.Input._currentState['ui_right'] = useInputStore((state) => state.ui_right)
    // New Buttons
    window.Input._currentState['ui_toggle'] = useInputStore((state) => state.ui_toggle)

    // New inputs
    window.Input._currentState['quicksave'] = useInputStore((state) => state.quicksave)
    window.Input._currentState['quickload'] = useInputStore((state) => state.quickload)
  }

  return null
}

export { GameCommands }
