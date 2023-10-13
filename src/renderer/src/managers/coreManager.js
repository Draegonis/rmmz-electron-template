export const fileExtention = 'rmmzsave'

class Ddm_CoreManager {
  #dataPromises = [] // promise array to pass into Promise.all

  #startTask(mode) {
    if (!window.INDICATORS) return
    switch (mode) {
      case 'save':
        window.INDICATORS.startSaveIndicator()
        break
      case 'load':
        window.INDICATORS.startLoadIndicator()
        break
    }
  }

  #endTask(mode) {
    if (!window.INDICATORS) return
    switch (mode) {
      case 'save':
        window.INDICATORS.endSaveIndicator()
        break
      case 'load':
        window.INDICATORS.endLoadIndicator()
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

  #makeDataTask(savefileId, extention, task, contents) {
    const saveName = savefileId + '.' + extention

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
          return CoreManager.saveToFile('save', saveName, contents, true)
            .then(thenFunc)
            .catch(catchFunc)
        case 'load':
          return CoreManager.loadFromFile('save', saveName, true).then(thenFunc).catch(catchFunc)
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
        ({ savefileId, extention, task, contents, thenCallback, catchCallback }) =>
          this.#makeDataTask(savefileId, extention, task, contents)
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
