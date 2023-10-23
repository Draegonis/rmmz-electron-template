import { GameCommands } from './components/inputs/GameCommands'
import { GameFunctions } from './components/funcs/GameFunctions'
import { SaveIndicator } from './components/ui/indicators/SaveIndicator'

const Game = () => {
  return (
    <>
      <GameFunctions />
      <GameCommands />
      <SaveIndicator />
    </>
  )
}

export { Game }
