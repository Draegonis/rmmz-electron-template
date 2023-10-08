import { Scene_Base } from '../../rmmz_scenes'
// Edited
import { DataManager } from '../editsIndex'

Scene_Base.prototype.executeAutosave = function () {
  window.$gameSystem.onBeforeSave()
  DataManager.saveGame(0)
    .then((resp) => {
      if (resp) {
        this.onAutosaveSuccess()
      } else {
        this.onAutosaveFailure()
      }
    })
    .catch(() => this.onAutosaveFailure())
}

export { Scene_Base }
