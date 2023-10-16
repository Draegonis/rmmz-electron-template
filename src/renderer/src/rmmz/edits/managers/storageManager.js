import { StorageManager } from '../../rmmz_managers'
import { CoreManager, fileExtension } from '../../../managers/coreManager'

// EDIT: StorageManager is mostly done on the electron side, only really need
// saveObject, loadObject and filepath.
StorageManager.saveObject = function (saveName, object) {
  return CoreManager.saveToFile('save', saveName + '.' + fileExtension, object, true)
}

StorageManager.loadObject = function (saveName) {
  return CoreManager.loadFromFile('save', saveName + '.' + fileExtension, true)
}

export { StorageManager }
