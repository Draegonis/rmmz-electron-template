import { Graphics } from '../../rmmz_core'
// Edited
import { Utils } from '../editsIndex'

Graphics.printError = function (name, message, error = null) {
  if (!this._errorPrinter) {
    this._createErrorPrinter()
  }

  // EDIT: Show the first error only. A lot of the
  // time the first error is the cause of all others.
  if (
    this._errorPrinter.innerHTML ===
    '<div id="errorName"></div><div id="errorMessage"></div><div id="errorStack"></div>'
  ) {
    this._errorPrinter.innerHTML = this._makeErrorHtml(name, message, error)
    this._errorPrinter.style.border = 'solid red'
    this._errorPrinter.style.backgroundColor = 'black'
  }

  this._wasLoading = this.endLoading()
  this._applyCanvasFilter()
}

// EDIT: Removed isMObileDevice check.
Graphics._stretchWidth = function () {
  return window.innerWidth
}
Graphics._stretchHeight = function () {
  return window.innerHeight
}

Graphics._makeErrorHtml = function (name, message, error) {
  const nameDiv = document.createElement('div')
  const messageDiv = document.createElement('div')
  nameDiv.id = 'errorName'
  messageDiv.id = 'errorMessage'
  nameDiv.innerHTML = Utils.escapeHtml(name || '')
  messageDiv.innerHTML = Utils.escapeHtml(message || '')

  // EDIT: Added stack to error printer.
  const stackDiv = document.createElement('div')
  stackDiv.id = 'errorStack'
  let stackText = ''

  if (error) {
    error?.stack.split(/\r?\n/).forEach((text, index) => {
      if (index > 0) {
        const atFunc = text.match(/at\s[A-Za-z_.]+\s/)
        const atScript = text.match(/[A-Za-z_]+\.js:[0-9]+:[0-9]+/)

        if (atFunc) {
          if (atScript) {
            stackText += atFunc[0] + ` (${atScript[0]})` + '.<br/>'
          } else {
            // WIP: some rare error.
            console.log(error.stack)
            stackText += atFunc[0] + '.<br/>'
          }
        } else if (atScript) {
          stackText += `at ${atScript[0]}` + '.<br/>'
        }
      }
    })
    stackDiv.innerHTML = stackText
  }

  return nameDiv.outerHTML + messageDiv.outerHTML + stackDiv.outerHTML
}

// EDIT: It is set to always stretch, and removed the keybind to toggle
// stretching.
Graphics._defaultStretchMode = function () {
  return Utils.isNwjs()
}

Graphics._updateErrorPrinter = function () {
  const width = this._width * 0.8 * this._realScale
  this._errorPrinter.style.width = width + 'px'
  // EDIT: Fixed height to a %
  this._errorPrinter.style.height = '75%'
}

// EDIT: Removed key for stretching.
Graphics._onKeyDown = function (event) {
  if (!event.ctrlKey && !event.altKey) {
    switch (event.keyCode) {
      case 113: // F2
        event.preventDefault()
        this._switchFPSCounter()
        break
      case 115: // F4
        event.preventDefault()
        this._switchFullScreen()
        break
    }
  }
}

// EDIT: Not needed because there is no stretch toggling.
delete Graphics._switchStretchMode

Graphics._switchFullScreen = function () {
  if (this._isFullScreen) {
    this._cancelFullScreen(true)
  } else {
    this._requestFullScreen(true)
  }
}

// EDIT: Changed _isFullScreen to a variable not a function.
Graphics._isFullScreen = false

// EDIT: Made a custom transition to fullscreen it is easier on the eyes.
Graphics.screenTransition = function () {
  const canvas = document.getElementById('gameCanvas')
  if (canvas) canvas.style.opacity = 0
  if (this._transitionTimer) clearTimeout(this._transitionTimer)
  this._transitionTimer = setTimeout(() => {
    if (canvas) canvas.style.opacity = 255
  }, 650)
}

// EDIT: Changed so that it sends the request to electron.
// Save arg is only to save config when fullscreen is
// toggled by hotkey.
Graphics._requestFullScreen = function (save) {
  this.screenTransition()
  window.electron.ipcRenderer.send('set-fullscreen', [true, save])
  Graphics._isFullScreen = true
}

Graphics._cancelFullScreen = function (save) {
  this.screenTransition()
  window.electron.ipcRenderer.send('set-fullscreen', [false, save])
  Graphics._isFullScreen = false
}

export { Graphics }
