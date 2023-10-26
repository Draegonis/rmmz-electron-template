class App_Manager {
  // The product name from the package.json.
  #name = window.electron.process.env.npm_package_productName
  get _name() {
    return this.#name
  }

  // Container for the testing ENV.
  #test
  get _test() {
    return this.#test
  }

  // Container to global indicator data/functions.
  indicators = {}

  constructor() {
    this.#test = this.#makeTestENV()
  }

  /**
   * Reads the .env.development RENDERER_VITE_ISOPTIONVALID in order to setup the testing environment.
   * @returns the data needed to run the given test ENV or ENV='NONE'.
   */
  #makeTestENV() {
    const testEnv = {}

    if (import.meta.env.DEV) {
      switch (import.meta.env.RENDERER_VITE_ISOPTIONVALID) {
        case 'battle': {
          try {
            const battleTest = JSON.parse(import.meta.env.RENDERER_VITE_BATTLETEST)
            testEnv.ENV = 'battle'
            testEnv.BATTLERS = battleTest.testBattlers
            testEnv.TROOPID = battleTest.testTroopId
          } catch (e) {
            throw new Error('Failed to JSON parse RENDERER_VITE_BATTLETEST.')
          }
          break
        }
        case 'skiptitle': {
          testEnv.ENV = 'skiptitle'
          break
        }
        default: {
          testEnv.ENV = 'NONE'
        }
      }
    }

    return testEnv
  }
}

const AppManager = new App_Manager()

export { AppManager }
