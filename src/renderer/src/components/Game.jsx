import { GameCommands } from './inputs/GameCommands'
import { GameFunctions } from './funcs/GameFunctions'
import { SaveIndicator } from './ui/indicators/SaveIndicator'

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
