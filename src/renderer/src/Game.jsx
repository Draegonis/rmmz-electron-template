import { GameCommands } from './components/inputs/GameCommands'
import { GameFunctions } from './components/funcs/GameFunctions'

const Game = () => {
  return (
    <>
      <GameFunctions />
      <GameCommands />
    </>
  )
}

export { Game }
