class Ddm_CoreManager {
  gameSavePath(saveName) {
    return ['save', saveName + '.rmmzsave']
  }

  async fileExists(folder, file) {
    return await window.electron.ipcRenderer.invoke('file-exists', folder, file)
  }

  async saveToFile(folder, file, data, compress) {
    return await window.electron.ipcRenderer.invoke('save-object', folder, file, data, compress)
  }

  async loadFromFile(folder, file, deCompress) {
    return await window.electron.ipcRenderer.invoke('read-object', folder, file, deCompress)
  }
}

const CoreManager = new Ddm_CoreManager()

export { CoreManager }
