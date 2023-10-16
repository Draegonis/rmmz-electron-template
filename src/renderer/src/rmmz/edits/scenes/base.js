import { Scene_Base } from '../../rmmz_scenes'
// Edited
import { ConfigManager, DataManager } from '../editsIndex'

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

// EDIT: Adjust UI to the config manager size and not size defined by the editor.
Scene_Base.prototype.adjustBoxSize = function () {
  const uiAreaWidth = ConfigManager.window.minWidth
  const uiAreaHeight = ConfigManager.window.minHeight
  const boxMargin = 4
  window.Graphics.boxWidth = uiAreaWidth - boxMargin * 2
  window.Graphics.boxHeight = uiAreaHeight - boxMargin * 2
}

export { Scene_Base }
