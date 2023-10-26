export const fileExtension = 'rmmzsave'

class Ddm_CoreManager {
  /**
   * holds the task data to pass into Promise.all.
   */
  #dataPromises = []

  /**
   * Property that determines if when saving/loading that all files should be grouped into the same folder.
   */
  saveAsFolder = true

  /**
   * This is called before the Promise.all on an array of tasks.
   * @param {string} mode a string containing the task type. Ex: save
   */
  #startTask(mode) {
    if (!window.$APP) return
    switch (mode) {
      case 'save':
        window.$APP.indicators.onSaveStart()
        break
    }
  }

  /**
   * This is called after the Promise.all on an array of tasks.
   * @param {string} mode a string containing the task type. Ex: save
   */
  #endTask(mode) {
    if (!window.$APP) return
    switch (mode) {
      case 'save':
        window.$APP.indicators.onSaveEnd()
        break
    }
  }

  /**
   * Sends an async request to the electron side in order to determine if a file exists or not.
   * @param {string} folder the folder to check for the file inside it.
   * @param {string} file the filename to check with the extension.
   * @returns {boolean} true if the file exists or false if it fails or the file doesn't exists.
   */
  async fileExists(folder, file) {
    return await window.electron.ipcRenderer.invoke('file-exists', folder, file)
  }

  /**
   * Sends an async request to electron to save an object. The object cannot contain any functions
   * or electron will throw an error. The compress variable will turn the object into a buffer
   * when saving.
   * @param {string} folder the folder in which to save data.
   * @param {string} file the filename in which to save as.
   * @param {object} data the data object to save.
   * @param {boolean} compress whether or not to compress the data into a buffer when saving the file.
   * @returns {boolean} true if the saving succeeded, false if it fails.
   */
  async saveToFile(folder, file, data, compress) {
    return await window.electron.ipcRenderer.invoke('save-object', folder, file, data, compress)
  }

  /**
   * Sends an async request to electron to read a file and retrieve the data that was saved. deCompressed
   * variable lets electron know to restore the data into a json state before sending it back.
   * @param {*} folder the folder in where the file resides.
   * @param {*} file the filename with extension to be read.
   * @param {*} deCompress whether the data inside the file was compressed and needs to be decompressed.
   * @returns {object | boolean}
   */
  async loadFromFile(folder, file, deCompress) {
    return await window.electron.ipcRenderer.invoke('read-object', folder, file, deCompress)
  }

  /**
   * From the given task data this function creates a Promise to be consumed in a Promise.all array of tasks.
   * @param {string} savefileId used in concatenating the saveName.
   * @param {string} extension used in concatenating the saveName.
   * @param {string} task the type of data task being performed.
   * @param {object | undefined} contents an object with contents to be saved or undefined.
   * @returns {Promise} a promise to be run within a Promise.all.
   */
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

  /**
   * A function meant to be used externally in order to register tasks for the Promise.all array.
   * @param {{ savefileId: string, extension: string, task: 'save' | 'load', contents: object | undefined, thenCallback: function, catchCallback: function }} taskContents
   * an object with the properties needed in order to create data tasks.
   */
  registerDataTask(taskContents) {
    this.#dataPromises.push(taskContents)
  }

  /**
   * Function called externally in order to run all the registered tasks. Used to handle multiple files when saving and loading.
   * @param {'save' | 'load'} mode the key passed into startTask and endTask in order to run additional code.
   * @returns {boolean} true if all the promises succeed, or false as long as one fails.
   */
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
