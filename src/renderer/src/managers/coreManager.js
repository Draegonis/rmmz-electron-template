export const fileExtension = 'rmmzsave'

class Ddm_CoreManager {
  #dataPromises = [] // promise array to pass into Promise.all
  saveAsFolder = true

  #startTask(mode) {
    if (!window.$APP) return
    switch (mode) {
      case 'save':
        window.$APP.indicators.onSaveStart()
        break
    }
  }

  #endTask(mode) {
    if (!window.$APP) return
    switch (mode) {
      case 'save':
        window.$APP.indicators.onSaveEnd()
        break
    }
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

  #makeDataTask(savefileId, extension, task, contents) {
    const saveName = savefileId + '.' + extension
    const saveFolder = CoreManager.saveAsFolder ? `save/${savefileId}` : 'save'

    return new Promise((resolve, reject) => {
      const thenFunc = (resp) => {
        if (resp) {
          return resolve(resp)
        }
        return reject(`Failed to ${task} ${saveName}.`)
      }
      const catchFunc = (e) => {
        return reject(`Failed to ${task} ${saveName} with error: ${e}`)
      }

      switch (task) {
        case 'save':
          return CoreManager.saveToFile(saveFolder, saveName, contents, true)
            .then(thenFunc)
            .catch(catchFunc)
        case 'load':
          return CoreManager.loadFromFile(saveFolder, saveName, true)
            .then(thenFunc)
            .catch(catchFunc)
        default:
          reject(`The ${task} given for ${saveName} is not valid.`)
      }
    })
  }

  registerDataTask(taskContents) {
    this.#dataPromises.push(taskContents)
  }

  async executeDataTasks(mode) {
    this.#startTask(mode)

    const isDone = await Promise.all(
      this.#dataPromises.map(
        ({ savefileId, extension, task, contents, thenCallback, catchCallback }) =>
          this.#makeDataTask(savefileId, extension, task, contents)
            .then((resp) => {
              if (thenCallback) thenCallback(resp)
              return [true, undefined]
            })
            .catch((e) => {
              if (catchCallback) catchCallback(e)
              return [false, e]
            })
      )
    ).catch((e) => {
      throw new Error('Something went wrong with the data tasks: ', e)
    })

    let isAllTrue = true
    let doneError = undefined

    isDone.forEach(([check, error]) => {
      if (!check && isAllTrue) {
        isAllTrue = false
        doneError = error
      }
    })

    if (!isAllTrue) {
      throw new Error(
        `Something went wrong is the data tasks, one returned a false response: `,
        doneError
      )
    }

    this.#dataPromises.length = 0

    this.#endTask(mode)

    return isAllTrue
  }
}

const CoreManager = new Ddm_CoreManager()

export { CoreManager }
