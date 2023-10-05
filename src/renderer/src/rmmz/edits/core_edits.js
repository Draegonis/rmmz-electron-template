import { Utils, Graphics, WebAudio, Bitmap, Input } from '../rmmz_core'

//==========================================================================
// UTILS EDITS

// EDIT: Technically is always in Nwjs, this option doesn't matter for the
// electron game.
Utils.isNwjs = function () {
  return true
}

// EDIT: This template doesn't run on mobile, so removing those functions.
delete Utils.isMobileDevice
delete Utils.isMobileSafari
delete Utils.isAndroidChrome

Utils.canUseWebGL = function () {
  try {
    const canvas = document.createElement('canvas')
    // EDIT: Added willReadFrequently: true.
    return !!canvas.getContext('webgl', { willReadFrequently: true })
  } catch (e) {
    return false
  }
}

//==========================================================================
// GRAPHICS EDITS

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

//==========================================================================
// BITMAP EDITS

Bitmap.prototype._createCanvas = function (width, height) {
  this._canvas = document.createElement('canvas')
  // EDIT: Added willReadFrequently: true.
  this._context = this._canvas.getContext('2d', { willReadFrequently: true })
  this._canvas.width = width
  this._canvas.height = height
  this._createBaseTexture(this._canvas)
}

//==========================================================================
// WEBAUDIO EDITS

// EDIT: Removed mobile check.
WebAudio._shouldMuteOnHide = function () {
  return !window.navigator.standalone
}

//==========================================================================
// INPUT EDITS

// EDIT: keyMapper, gamepadMapper is not used, handled inside useInputStore.js
delete Input.keyMapper
delete Input.gamepadMapper

Input.gamepadConnected = false

Input.tempInput = {}
Input.tempInput.command = ''
Input.tempInput.oldCommand = ''
Input.tempInput.type = ''
Input.tempInput.index = 0

Input.keyboardMap = {}
Input.keyboardMap.en = [
  '', // [0]
  '', // [1]
  '', // [2]
  'Cancel', // [3]
  '', // [4]
  '', // [5]
  'Help', // [6]
  '', // [7]
  'Back space', // [8]
  'Tab', // [9]
  '', // [10]
  '', // [11]
  'Clear', // [12]
  'Enter', // [13]
  'Enter special', // [14]
  '', // [15]
  'Shift', // [16]
  'Ctrl', // [17]
  'Alt', // [18]
  'Pause', // [19]
  'Caps lock', // [20]
  'Kana', // [21]
  'Eisu', // [22]
  'Junja', // [23]
  'Final', // [24]
  'Hanja', // [25]
  '', // [26]
  'Escape', // [27]
  'Convert', // [28]
  'Nonconvert', // [29]
  'Accept', // [30]
  'Modechange', // [31]
  'Spacebar', // [32]
  'Page up', // [33]
  'Page down', // [34]
  'End', // [35]
  'Home', // [36]
  'Left arrow', // [37]
  'Up arrow', // [38]
  'Right arrow', // [39]
  'Down arrow', // [40]
  'Select', // [41]
  'Print', // [42]
  'Execute', // [43]
  'Printscreen', // [44]
  'Insert', // [45]
  'Delete', // [46]
  '', // [47]
  '0', // [48]
  '1', // [49]
  '2', // [50]
  '3', // [51]
  '4', // [52]
  '5', // [53]
  '6', // [54]
  '7', // [55]
  '8', // [56]
  '9', // [57]
  ':', // [58]
  ';', // [59]
  '<', // [60]
  '=', // [61]
  '>', // [62]
  '?', // [63]
  '@', // [64]
  'A', // [65]
  'B', // [66]
  'C', // [67]
  'D', // [68]
  'E', // [69]
  'F', // [70]
  'G', // [71]
  'H', // [72]
  'I', // [73]
  'J', // [74]
  'K', // [75]
  'L', // [76]
  'M', // [77]
  'N', // [78]
  'O', // [79]
  'P', // [80]
  'Q', // [81]
  'R', // [82]
  'S', // [83]
  'T', // [84]
  'U', // [85]
  'V', // [86]
  'W', // [87]
  'X', // [88]
  'Y', // [89]
  'Z', // [90]
  'OS key', // [91] Windows Key (Windows) or Command Key (Mac)
  '', // [92]
  'Context menu', // [93]
  '', // [94]
  'Sleep', // [95]
  'Numpad 0', // [96]
  'Numpad 1', // [97]
  'Numpad 2', // [98]
  'Numpad 3', // [99]
  'Numpad 4', // [100]
  'Numpad 5', // [101]
  'Numpad 6', // [102]
  'Numpad 7', // [103]
  'Numpad 8', // [104]
  'Numpad 9', // [105]
  '*', // [106]
  '+', // [107]
  ',', // [108]
  '-', // [109]
  '.', // [110]
  '/', // [111]
  'F1', // [112]
  'F2', // [113]
  'F3', // [114]
  'F4', // [115]
  'F5', // [116]
  'F6', // [117]
  'F7', // [118]
  'F8', // [119]
  'F9', // [120]
  'F10', // [121]
  'F11', // [122]
  'F12', // [123]
  'F13', // [124]
  'F14', // [125]
  'F15', // [126]
  'F16', // [127]
  'F17', // [128]
  'F18', // [129]
  'F19', // [130]
  'F20', // [131]
  'F21', // [132]
  'F22', // [133]
  'F23', // [134]
  'F24', // [135]
  '', // [136]
  '', // [137]
  '', // [138]
  '', // [139]
  '', // [140]
  '', // [141]
  '', // [142]
  '', // [143]
  'Num lock', // [144]
  'Scroll lock', // [145]
  'WIN_OEM_FJ_JISHO', // [146]
  'WIN_OEM_FJ_MASSHOU', // [147]
  'WIN_OEM_FJ_TOUROKU', // [148]
  'WIN_OEM_FJ_LOYA', // [149]
  'WIN_OEM_FJ_ROYA', // [150]
  '', // [151]
  '', // [152]
  '', // [153]
  '', // [154]
  '', // [155]
  '', // [156]
  '', // [157]
  '', // [158]
  '', // [159]
  '^', // [160]
  '!', // [161]
  '"', // [162]
  '#', // [163]
  '$', // [164]
  '%', // [165]
  '&', // [166]
  '_', // [167]
  '(', // [168]
  ')', // [169]
  '*', // [170]
  '+', // [171]
  '|', // [172]
  '-', // [173]
  '{', // [174]
  '}', // [175]
  '~', // [176]
  '', // [177]
  '', // [178]
  '', // [179]
  '', // [180]
  'Volume mute', // [181]
  'Volume down', // [182]
  'Volume up', // [183]
  '', // [184]
  '', // [185]
  ';', // [186]
  '=', // [187]
  ',', // [188]
  '-', // [189]
  '.', // [190]
  '/', // [191]
  '`', // [192]
  '', // [193]
  '', // [194]
  '', // [195]
  '', // [196]
  '', // [197]
  '', // [198]
  '', // [199]
  '', // [200]
  '', // [201]
  '', // [202]
  '', // [203]
  '', // [204]
  '', // [205]
  '', // [206]
  '', // [207]
  '', // [208]
  '', // [209]
  '', // [210]
  '', // [211]
  '', // [212]
  '', // [213]
  '', // [214]
  '', // [215]
  '', // [216]
  '', // [217]
  '', // [218]
  '[', // [219]
  '\\', // [220]
  ']', // [221]
  "'", // [222]
  '', // [223]
  'Meta', // [224] Command on Mac
  'ALTGR', // [225] (Level 3 Shift key or Level 5 Shift key) on Linux.
  '', // [226]
  'WIN_ICO_HELP', // [227]
  'WIN_ICO_00', // [228]
  '', // [229]
  'WIN_ICO_CLEAR', // [230]
  '', // [231]
  '', // [232]
  'WIN_OEM_RESET', // [233]
  'WIN_OEM_JUMP', // [234]
  'WIN_OEM_JUMP', // [234]
  'WIN_OEM_PA1', // [235]
  'WIN_OEM_PA2', // [236]
  'WIN_OEM_PA3', // [237]
  'WIN_OEM_WSCTRL', // [238]
  'WIN_OEM_CUSEL', // [239]
  'WIN_OEM_ATTN', // [240]
  'WIN_OEM_FINISH', // [241]
  'WIN_OEM_COPY', // [242]
  'WIN_OEM_AUTO', // [243]
  'WIN_OEM_ENLW', // [244]
  'WIN_OEM_BACKTAB', // [245]
  'ATTN', // [246]
  'CRSEL', // [247]
  'EXSEL', // [248]
  'EREOF', // [249]
  'Play', // [250]
  'Zoom', // [251]
  '', // [252]
  'PA1', // [253]
  'WIN_OEM_CLEAR', // [254]
  '' // [255]
]

// EDIT: removed this._gamepadStates, and added some variables to hold temp data.
Input.clear = function () {
  this._currentState = {}
  this._previousState = {}
  this._latestButton = null
  this._pressedTime = 0
  this._dir4 = 0
  this._dir8 = 0
  this._preferredAxis = ''
  this._date = 0
  this._virtualButton = null

  this.tempInput.command = ''
  this.tempInput.oldCommand = ''
  this.tempInput.type = ''
  this.tempInput.index = 0
}

Input.update = function () {
  // Edit: Removed this._pollGamepads().
  if (this._currentState[this._latestButton]) {
    this._pressedTime++
  } else {
    this._latestButton = null
  }
  for (const name in this._currentState) {
    if (this._currentState[name] && !this._previousState[name]) {
      this._latestButton = name
      this._pressedTime = 0
      this._date = Date.now()
    }
    this._previousState[name] = this._currentState[name]
  }
  if (this._virtualButton) {
    this._latestButton = this._virtualButton
    this._pressedTime = 0
    this._virtualButton = null
  }
  this._updateDirection()
}

Input._setupEventHandlers = function () {
  // Edit: Moved keyup + keydown into Keyboard.js => document.addEventListener.
  window.addEventListener('blur', this._onLostFocus.bind(this))
}

// EDIT: These are handled inside Keyboard.js
delete Input._onKeyDown
delete Input._shouldPreventDefault
delete Input._onKeyUp

// EDIT: This functionality is handled inside Gamepad.js
delete Input._pollGamepads
delete Input._updateGamepadState

//=======================================================
// Edit and then re-export only the edited ones.
export { Utils, Graphics, WebAudio, Bitmap, Input }
