import { GameCommands } from './components/inputs/GameCommands'
import { GameFunctions } from './components/funcs/GameFunctions'
import { SaveIndicator } from './components/SaveIndicator'
import { LoadIndicator } from './components/LoadIndicator'

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
