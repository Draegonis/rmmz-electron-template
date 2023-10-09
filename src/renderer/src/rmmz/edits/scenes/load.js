import { Scene_Load } from '../../rmmz_scenes'
// Edited
import { DataManager } from '../editsIndex'

// EDIT: electron may send back false instead of rejecting.
Scene_Load.prototype.executeLoad = function (savefileId) {
  DataManager.loadGame(savefileId)
    .then((resp) => {
      if (resp) {
        this.onLoadSuccess()
      } else {
        this.onLoadFailure()
      }
    })
    .catch(() => this.onLoadFailure())
}

export { Scene_Load }
