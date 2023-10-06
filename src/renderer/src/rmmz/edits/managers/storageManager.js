import { StorageManager } from '../../rmmz_managers'

// EDIT: StorageManager is mostly done on the electron side, only really need
// saveObject, loadObject and filepath.
StorageManager.saveObject = function (saveName, object) {
  return window.electron.ipcRenderer.invoke(
    'save-object',
    'save',
    this.fileName(saveName),
    object,
    true
  )
}

StorageManager.loadObject = function (saveName) {
  return window.electron.ipcRenderer.invoke('read-object', 'save', this.fileName(saveName), true)
}

StorageManager.fileName = function (saveName) {
  return saveName + '.rmmzsave'
}

export { StorageManager }
