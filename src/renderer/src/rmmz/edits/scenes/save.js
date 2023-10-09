import { Scene_Save } from '../../rmmz_scenes'
// Edited
import { DataManager } from '../editsIndex'

// EDIT: electron side may not reject and instead send false.
Scene_Save.prototype.executeSave = function (savefileId) {
  window.$gameSystem.setSavefileId(savefileId)
  window.$gameSystem.onBeforeSave()
  DataManager.saveGame(savefileId)
    .then((resp) => {
      if (resp) {
        this.onSaveSuccess()
      } else {
        this.onSaveFailure()
      }
    })
    .catch(() => this.onSaveFailure())
}

export { Scene_Save }
