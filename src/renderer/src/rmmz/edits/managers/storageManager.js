import { StorageManager } from '../../rmmz_managers'
import { CoreManager } from '../../../managers/coreManager'

// EDIT: StorageManager is mostly done on the electron side, only really need
// saveObject, loadObject and filepath.
StorageManager.saveObject = function (saveName, object) {
  return CoreManager.saveToFile(...this.filePath(saveName), object, true)
}

StorageManager.loadObject = function (saveName) {
  return CoreManager.loadFromFile(...this.filePath(saveName), true)
}

StorageManager.filePath = function (saveName) {
  return CoreManager.gameSavePath(saveName)
}

export { StorageManager }
