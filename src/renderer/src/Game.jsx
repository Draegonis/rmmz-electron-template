import { GameCommands } from './components/inputs/GameCommands'
import { GameFunctions } from './components/funcs/GameFunctions'
import { SaveIndicator } from './components/ui/indicators/SaveIndicator'
import { LoadIndicator } from './components/ui/indicators/LoadIndicator'

const Game = () => {
  return (
    <>
      <GameFunctions />
      <GameCommands />
      <SaveIndicator />
      <LoadIndicator />
    </>
  )
}

export { Game }
