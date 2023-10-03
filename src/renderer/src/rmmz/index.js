import {
  Bitmap,
  ColorFilter,
  Graphics,
  Input,
  JsonEx,
  Point,
  Rectangle,
  ScreenSprite,
  Sprite,
  Stage,
  Tilemap,
  TilingSprite,
  TouchInput,
  Utils,
  Video,
  Weather,
  WebAudio,
  Window,
  WindowLayer
} from './rmmz_core'
import {
  DataManager,
  AudioManager,
  BattleManager,
  ColorManager,
  ConfigManager,
  EffectManager,
  FontManager,
  ImageManager,
  PluginManager,
  SceneManager,
  SoundManager,
  StorageManager,
  TextManager
} from './rmmz_managers'
import {
  Game_Action,
  Game_ActionResult,
  Game_Actor,
  Game_Actors,
  Game_Battler,
  Game_BattlerBase,
  Game_Character,
  Game_CharacterBase,
  Game_CommonEvent,
  Game_Enemy,
  Game_Event,
  Game_Follower,
  Game_Followers,
  Game_Interpreter,
  Game_Item,
  Game_Map,
  Game_Message,
  Game_Party,
  Game_Picture,
  Game_Player,
  Game_Screen,
  Game_SelfSwitches,
  Game_Switches,
  Game_System,
  Game_Temp,
  Game_Timer,
  Game_Troop,
  Game_Unit,
  Game_Variables,
  Game_Vehicle
} from './rmmz_objects'
import {
  Scene_Base,
  Scene_Battle,
  Scene_Boot,
  Scene_Debug,
  Scene_Equip,
  Scene_File,
  Scene_GameEnd,
  Scene_Gameover,
  Scene_Item,
  Scene_ItemBase,
  Scene_Load,
  Scene_Map,
  Scene_Menu,
  Scene_MenuBase,
  Scene_Message,
  Scene_Name,
  Scene_Options,
  Scene_Save,
  Scene_Shop,
  Scene_Skill,
  Scene_Status,
  Scene_Title
} from './rmmz_scenes'
import {
  Sprite_Actor,
  Sprite_Animation,
  Sprite_AnimationMV,
  Sprite_Balloon,
  Sprite_Battleback,
  Sprite_Battler,
  Sprite_Button,
  Sprite_Character,
  Sprite_Clickable,
  Sprite_Damage,
  Sprite_Destination,
  Sprite_Enemy,
  Sprite_Gauge,
  Sprite_Name,
  Sprite_Picture,
  Sprite_StateIcon,
  Sprite_StateOverlay,
  Sprite_Timer,
  Sprite_Weapon,
  Spriteset_Base,
  Spriteset_Battle,
  Spriteset_Map
} from './rmmz_sprites'
import {
  Window_ActorCommand,
  Window_Base,
  Window_BattleActor,
  Window_BattleEnemy,
  Window_BattleItem,
  Window_BattleLog,
  Window_BattleSkill,
  Window_BattleStatus,
  Window_ChoiceList,
  Window_Command,
  Window_DebugEdit,
  Window_DebugRange,
  Window_EquipCommand,
  Window_EquipItem,
  Window_EquipSlot,
  Window_EquipStatus,
  Window_EventItem,
  Window_GameEnd,
  Window_Gold,
  Window_Help,
  Window_HorzCommand,
  Window_ItemCategory,
  Window_ItemList,
  Window_MapName,
  Window_MenuActor,
  Window_MenuCommand,
  Window_MenuStatus,
  Window_Message,
  Window_NameBox,
  Window_NameEdit,
  Window_NameInput,
  Window_NumberInput,
  Window_Options,
  Window_PartyCommand,
  Window_SavefileList,
  Window_ScrollText,
  Window_Scrollable,
  Window_Selectable,
  Window_ShopBuy,
  Window_ShopCommand,
  Window_ShopNumber,
  Window_ShopSell,
  Window_ShopStatus,
  Window_SkillList,
  Window_SkillStatus,
  Window_SkillType,
  Window_Status,
  Window_StatusBase,
  Window_StatusEquip,
  Window_StatusParams,
  Window_TitleCommand
} from './rmmz_windows'
// Helpers
import { equals as r_equals } from 'ramda'

//*********************************************************************** */
//                         RMMZ CORE EDITS
//*********************************************************************** */

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

//*********************************************************************** */
//                        RMMZ MANAGER EDITS
//*********************************************************************** */

//==========================================================================
// DATAMANAGER EDITS

// EDIT: Have to send the filename to the electron side and
// the return if it fails triggers the delete globalInfo.
DataManager.removeInvalidGlobalInfo = function () {
  const globalInfo = this._globalInfo
  for (const info of globalInfo) {
    const savefileId = globalInfo.indexOf(info)
    const saveFileName = this.makeSavename(savefileId)
    window.electron.ipcRenderer
      .invoke('file-exists', 'save', StorageManager.fileName(saveFileName))
      .catch(() => {
        delete globalInfo[savefileId]
      })
  }
}

// EDIT: Removed the TEST_ prefix.
DataManager.loadDatabase = function () {
  for (const databaseFile of this._databaseFiles) {
    this.loadDataFile(databaseFile.name, databaseFile.src)
  }
  if (this.isEventTest()) {
    this.loadDataFile('$testEvent', 'Event.json')
  }
}

DataManager.isBattleTest = function () {
  // EDIT: Changed to a variable loaded from .env.development
  return window.$TEST.ENV === 'battle'
}

DataManager.isEventTest = function () {
  // EDIT: Changed to false as there is no event testing at the moment.
  return false
}

DataManager.isTitleSkip = function () {
  // EDIT: Changed to a variable loaded from .env.development
  return window.$TEST.ENV === 'skiptitle'
}

DataManager.setupBattleTest = function () {
  this.createGameObjects()
  window.$gameParty.setupBattleTest()
  // EDIT: Changed to load a troop id set in .env.development
  BattleManager.setup(window.$TEST.TROOPID, true, false)
  BattleManager.setBattleTest(true)
  BattleManager.playBattleBgm()
}

// EDIT: This is not used.
delete DataManager.savefileExists

// EDIT: When saving the classes are stripped from the contents,
// so the classes need to be re-init from content data.
DataManager.extractSaveContents = function (contents) {
  window.$gameSystem.loadContents(contents.system)
  window.$gameScreen.loadContents(contents.screen)
  window.$gameTimer.loadContents(contents.timer)
  window.$gameSwitches.loadContents(contents.switches)
  window.$gameVariables.loadContents(contents.variables)
  window.$gameSelfSwitches.loadContents(contents.selfSwitches)
  window.$gameActors.loadContents(contents.actors)
  window.$gameParty.loadContents(contents.party)
  window.$gameMap.loadContents(contents.map)
  window.$gamePlayer.loadContents(contents.player)
}

//==========================================================================
// CONFIGMANAGER EDITS

// Add temp to determine if window needs resize on save.
ConfigManager.tempWindowSize = [0, 0]
ConfigManager.tempFullScreen = false

// EDIT: Get window setting from electron.
ConfigManager.window = await window.electron.ipcRenderer.invoke('load-window')

// EDIT: ConfigManager uses electron store on the electron side of
// the game. Saves data in user data folder as config.json.
ConfigManager.load = function () {
  window.electron.ipcRenderer.invoke('load-config').then((res) => {
    this.applyData(res || {})
    this._isLoaded = true
  })
}
ConfigManager.save = function () {
  window.electron.ipcRenderer.send('save-config', this.makeData())
}

ConfigManager.makeData = function () {
  const config = {}
  config.alwaysDash = this.alwaysDash
  config.commandRemember = this.commandRemember
  config.touchUI = this.touchUI
  config.bgmVolume = this.bgmVolume
  config.bgsVolume = this.bgsVolume
  config.meVolume = this.meVolume
  config.seVolume = this.seVolume

  // EDIT: Add window to makeData
  config.window = this.window

  return config
}

ConfigManager.applyData = function (config) {
  this.alwaysDash = this.readFlag(config, 'alwaysDash', false)
  this.commandRemember = this.readFlag(config, 'commandRemember', false)
  this.touchUI = this.readFlag(config, 'touchUI', true)
  this.bgmVolume = this.readVolume(config, 'bgmVolume')
  this.bgsVolume = this.readVolume(config, 'bgsVolume')
  this.meVolume = this.readVolume(config, 'meVolume')
  this.seVolume = this.readVolume(config, 'seVolume')

  // EDIT: Set window data.
  this.window = config.window
}

// Edit: Add function to convert sizes to ratios.
ConfigManager.getScreenRatio = function (width, height) {
  switch ((width, height)) {
    case (1280, 1024):
      return 1.25
    case (1024, 768):
      return 1.33
    case (1280, 720):
      return 1.78
    case (1280, 540):
      return 2.37
    default:
      return 0
  }
}

// Edit: Add function to get screen size by ratio.
ConfigManager.getSizeByRatio = function (ratio) {
  switch (ratio) {
    case 1.25:
      return [1280, 1024]
    case 1.33:
      return [1024, 768]
    case 1.78:
      return [1280, 720]
    case 2.37:
      return [1280, 540]
    default:
      return [1, 1]
  }
}

// Edit: Add a ratio index.
ConfigManager.ratioIndex = [1.25, 1.33, 1.78, 2.37]

//==========================================================================
// STORAGEMANAGER EDITS

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

//==========================================================================
// PLUGINMANAGER EDITS

PluginManager.setup = function (plugins) {
  for (const plugin of plugins) {
    const pluginName = Utils.extractFileName(plugin.name)
    if (plugin.status && !this._scripts.includes(pluginName)) {
      this.setParameters(pluginName, plugin.parameters)
      // EDIT: to allow imports as modules for top level await.
      this.loadScript(plugin.name, plugin.parameters.IMPORT_AS_MODULE)
      this._scripts.push(pluginName)
    }
  }
}

// EDIT: to allow imports as modules for top level await.
PluginManager.loadScript = function (filename, moduleImport) {
  const importType = moduleImport === 'true' ? 'module' : 'text/javascript'

  const url = this.makeUrl(filename)
  const script = document.createElement('script')
  script.type = importType
  script.src = url
  script.async = false
  script.defer = true
  script.onerror = this.onError.bind(this)
  script._url = url
  document.body.appendChild(script)
}

//*********************************************************************** */
//                        RMMZ OBJECTS EDITS
//*********************************************************************** */

//==========================================================================
// GAME_TEMP EDITS

Game_Temp.prototype.initialize = function () {
  // EDIT: Changed to check the NODE_ENV_ELECTRON_VITE env variable.
  this._isPlaytest = window.electron.process.env.NODE_ENV_ELECTRON_VITE === 'development'
  this._destinationX = null
  this._destinationY = null
  this._touchTarget = null
  this._touchState = ''
  this._needsBattleRefresh = false
  this._commonEventQueue = []
  this._animationQueue = []
  this._balloonQueue = []
  this._lastActionData = [0, 0, 0, 0, 0, 0]
}

//==========================================================================
// GAME_SYSTEM EDITS

// EDIT: Special function to re-add content data into the class.
Game_System.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_TIMER EDITS

// EDIT: Special function to re-add content data into the class.
Game_Timer.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_SWITCHES EDITS

// EDIT: Special function to re-add content data into the class.
Game_Switches.prototype.loadContents = function (contents) {
  this._data = contents
}

//==========================================================================
// GAME_VARIABLES EDITS

// EDIT: Special function to re-add content data into the class.
Game_Variables.prototype.loadContents = function (contents) {
  this._data = contents
}

//==========================================================================
// GAME_SELFSWITCHES EDITS

// EDIT: Special function to re-add content data into the class.
Game_SelfSwitches.prototype.loadContents = function (contents) {
  this._data = contents
}

//==========================================================================
// GAME_SCREEN EDITS

// EDIT: Special function to re-add content data into the class.
Game_Screen.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_ITEM EDITS

// EDIT: Special function to re-add content data into the class.
Game_Item.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_ACTORS EDITS

// EDIT: Special function to re-add content data into the class.
Game_Actors.prototype.loadContents = function (contents) {
  this._data = contents._data.map((actor) => {
    if (actor) {
      const tempActor = new Game_Actor(actor._actorId)

      Object.keys(actor).forEach((key) => {
        switch (key) {
          case '_equips': {
            const equips = actor._equips.map((equip) => equip._itemId)
            tempActor.initEquips(equips)
            break
          }
          case '_result': {
            break
          }
          default: {
            tempActor[key] = actor[key]
          }
        }
      })

      return tempActor
    }

    return null
  })
}

//==========================================================================
// GAME_PARTY EDITS

// EDIT: Special function to re-add content data into the class.
Game_Party.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    switch (key) {
      case '_lastItem': {
        this._lastItem.setContents(contents._lastItem)
        break
      }
      default: {
        this[key] = contents[key]
      }
    }
  })
}

Game_Party.prototype.setupBattleTestMembers = function () {
  // EDIT: Changed to a variable loaded from .env.development
  for (const battler of window.$TEST.BATTLERS) {
    const actor = window.$gameActors.actor(battler.actorId)
    if (actor) {
      actor.changeLevel(battler.level, false)
      actor.initEquips(battler.equips)
      actor.recoverAll()
      this.addActor(battler.actorId)
    }
  }
}

//==========================================================================
// GAME_MAP EDITS

// EDIT: Special function to re-add content data into the class.
Game_Map.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    switch (key) {
      case '_commonEvents': {
        this._commonEvents = contents._commonEvents.map((event) => {
          if (event) return new Game_CommonEvent(event._commonEventId)
          return null
        })
        break
      }
      case '_events': {
        this._events = contents._events.map((event) => {
          if (event) {
            const tempEvent = new Game_Event(event._mapId, event._eventId, true)
            tempEvent.setContents(event)
            return tempEvent
          }
          return null
        })
        break
      }
      case '_interpreter': {
        this._interpreter.setContents(contents._interpreter)
        break
      }
      case '_vehicles': {
        this._vehicles[0].setContents(contents._vehicles[0])
        this._vehicles[1].setContents(contents._vehicles[1])
        this._vehicles[2].setContents(contents._vehicles[2])
        break
      }
      default: {
        this[key] = contents[key]
      }
    }
  })
}

//==========================================================================
// GAME_PLAYER EDITS

// EDIT: Special function to re-add content data into the class.
Game_Player.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    switch (key) {
      case '_followers': {
        const FOLLOWERS = contents._followers._data.map((follower) => {
          const tempFollower = new Game_Follower(follower._memberIndex)
          tempFollower.setContents(follower)
          return tempFollower
        })
        this._followers._data = FOLLOWERS
        break
      }
      default: {
        this[key] = contents[key]
      }
    }
  })
}

//==========================================================================
// GAME_FOLLOWER EDITS

// EDIT: Special function to re-add content data into the class.
Game_Follower.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_VEHICLE EDITS

// EDIT: Special function to re-add content data into the class.
Game_Vehicle.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_EVENT EDITS

Game_Event.prototype.initialize = function (mapId, eventId, forContent) {
  Game_Character.prototype.initialize.call(this)
  this._mapId = mapId
  this._eventId = eventId
  if (!forContent) {
    this.locate(this.event().x, this.event().y)
    this.refresh()
  }
}

// EDIT: Special function to re-add content data into the class.
Game_Event.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_INTERPRETER EDITS

// EDIT: Special function to re-add content data into the class.
Game_Interpreter.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//*********************************************************************** */
//                         RMMZ SCENES EDITS
//*********************************************************************** */

//==========================================================================
// SCENE_BOOT EDITS

// EDIT: Removed StorageManager.updateForageKeys()
Scene_Boot.prototype.create = function () {
  Scene_Base.prototype.create.call(this)
  DataManager.loadDatabase()
}

// EDIT: Removed && StorageManager.forageKeysUpdated() in if statement.
Scene_Boot.prototype.isReady = function () {
  if (!this._databaseLoaded) {
    if (DataManager.isDatabaseLoaded()) {
      this._databaseLoaded = true
      this.onDatabaseLoaded()
    }
    return false
  }
  return Scene_Base.prototype.isReady.call(this) && this.isPlayerDataLoaded()
}

Scene_Boot.prototype.resizeScreen = function () {
  const { minWidth, minHeight, fullScreen } = ConfigManager.window

  // EDIT: Set electron min width/height
  Graphics.resize(minWidth, minHeight)
  // Edit: Scale is set by graphics itself.
  Graphics.defaultScale = Graphics._realScale

  this.adjustBoxSize()
  // Edit: Remove adjust window, since the window is adjusted by electron.

  // EDIT: check and set fullscreen.
  if (fullScreen) {
    Graphics._requestFullScreen(false)
  }
}

// EDIT: These are removed since they are not needed.
delete Scene_Boot.adjustWindow
delete Scene_Boot.screenScale

//==========================================================================
// SCENE_TITLE EDITS

Scene_Title.prototype.drawGameTitle = function () {
  const x = 20
  const y = Graphics.height / 4
  const maxWidth = Graphics.width - x * 2
  // EDIT: changed to window.gameAPI.$APP_NAME to create a single source of truth for the game name.
  const text = window.$APP_NAME
  const bitmap = this._gameTitleSprite.bitmap
  bitmap.fontFace = window.$gameSystem.mainFontFace()
  bitmap.outlineColor = 'black'
  bitmap.outlineWidth = 8
  bitmap.fontSize = 72
  bitmap.drawText(text, x, y, maxWidth, 48, 'center')
}

Scene_Title.prototype.createCommandWindow = function () {
  const background = window.$dataSystem.titleCommandWindow.background
  const rect = this.commandWindowRect()
  this._commandWindow = new Window_TitleCommand(rect)
  this._commandWindow.setBackgroundType(background)
  this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this))
  this._commandWindow.setHandler('continue', this.commandContinue.bind(this))
  this._commandWindow.setHandler('options', this.commandOptions.bind(this))
  // EDIT: Add quit game button to title.
  this._commandWindow.setHandler('quitGame', this.commandQuitGame.bind(this))
  this.addWindow(this._commandWindow)
}

Scene_Title.prototype.commandWindowRect = function () {
  const offsetX = window.$dataSystem.titleCommandWindow.offsetX
  const offsetY = window.$dataSystem.titleCommandWindow.offsetY
  const ww = this.mainCommandWidth()
  // EDIT: Increased from 3 -> 4 for the new quit game button.
  const wh = this.calcWindowHeight(4, true)
  const wx = (Graphics.boxWidth - ww) / 2 + offsetX
  const wy = Graphics.boxHeight - wh - 96 + offsetY
  return new Rectangle(wx, wy, ww, wh)
}

// ==========================================================
// EDIT: Add the quit game command, with a text window.
Scene_Title.prototype.commandQuitGame = function () {
  this._commandWindow.close()
  // free up old command window for garbage collection
  this._commandWindow = null

  const ww = this.mainCommandWidth()
  const wh = this.calcWindowHeight(2, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = Graphics.boxHeight - wh - 96

  const background = window.$dataSystem.titleCommandWindow.background
  const rect = new Rectangle(wx, wy, ww, wh)

  this._commandWindow = new Window_ConfirmCommand(rect)
  this._commandWindow.setBackgroundType(background)

  this._commandWindow.setHandler('confirmYes', this.commandConfirmYes.bind(this))
  this._commandWindow.setHandler('confirmNo', this.commandConfirmNo.bind(this))
  this._commandWindow.setHandler('cancel', this.commandConfirmNo.bind(this))

  if (!this._confirmText) {
    this._confirmText = new Window_Text(new Rectangle(wx + 20, wy - 75, 200, 60), 'Are you sure?')
    this.addWindow(this._confirmText)
  }
  this._confirmText.open()

  this.addWindow(this._commandWindow)
  this._commandWindow.open()
}

// EDIT: Added confirm Yes / No command.
Scene_Title.prototype.commandConfirmYes = function () {
  this._commandWindow.close()
  this._confirmText.close()
  AudioManager.stopBgm()
  AudioManager.stopBgs()
  window.electron.ipcRenderer.send('quit-game')
}

Scene_Title.prototype.commandConfirmNo = function () {
  this._commandWindow.close()
  this._confirmText.close()
  this.createCommandWindow()
}

//==========================================================================
// SCENE_MENU EDITS

Scene_Menu.prototype.createCommandWindow = function () {
  const rect = this.commandWindowRect()
  const commandWindow = new Window_MenuCommand(rect)
  commandWindow.setHandler('item', this.commandItem.bind(this))
  commandWindow.setHandler('skill', this.commandPersonal.bind(this))
  commandWindow.setHandler('equip', this.commandPersonal.bind(this))
  commandWindow.setHandler('status', this.commandPersonal.bind(this))
  commandWindow.setHandler('formation', this.commandFormation.bind(this))
  commandWindow.setHandler('options', this.commandOptions.bind(this))
  // Edit: Add option for editting controls.
  commandWindow.setHandler('controls', this.commandControls.bind(this))
  commandWindow.setHandler('save', this.commandSave.bind(this))
  commandWindow.setHandler('gameEnd', this.commandGameEnd.bind(this))
  commandWindow.setHandler('cancel', this.popScene.bind(this))
  this.addWindow(commandWindow)
  this._commandWindow = commandWindow
}

// Edit: Add commandControls menu option.
Scene_Menu.prototype.commandControls = function () {
  SceneManager.push(Scene_Controls)
}

//==========================================================================
// SCENE_OPTIONS EDITS

// Edit: Add temp window min size to be compaired when config is saved..
Scene_Options.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)

  ConfigManager.tempWindowSize[0] = ConfigManager.window.minWidth
  ConfigManager.tempWindowSize[1] = ConfigManager.window.minHeight
  // In case fullscreen is toggled by hotkey change config value to Graphics._isFullScreen
  // which is always up to date. This is saved on electron side when the hotkey is pressed
  // but don't want circular dependency importing ConfigManager into rmmz_core.js in order
  // to set the config value there.
  ConfigManager.tempFullScreen = Graphics._isFullScreen
  ConfigManager.window.fullScreen = Graphics._isFullScreen

  this.createOptionsWindow()
  // Edit: Added an info window to scene.
  this.createInfoWindow()
}

// Edit: Determine if the window needs to be resized.
Scene_Options.prototype.terminate = function () {
  const currentSize = [ConfigManager.window.minWidth, ConfigManager.window.minHeight]
  const fullScreen = ConfigManager.window.fullScreen

  ConfigManager.save()

  // Edit: Enter or exit fullscreen based on config fullscreen value.
  if (!r_equals(ConfigManager.tempFullScreen, fullScreen)) {
    // This is saved at the end with everything else.
    if (fullScreen) {
      Graphics._requestFullScreen(false)
    } else {
      Graphics._cancelFullScreen(false)
    }
  }

  if (!r_equals(ConfigManager.tempWindowSize, currentSize) && currentSize[0] !== 1) {
    window.electron.ipcRenderer.send('resizeWindow', [
      ConfigManager.window.minWidth,
      ConfigManager.window.minHeight,
      ConfigManager.window.ratio
    ])

    Graphics.resize(...currentSize)
    Graphics.defaultScale = Graphics._realScale
    // Edit: Update UI
    this.adjustBoxSize()
  }

  Scene_MenuBase.prototype.terminate.call(this)
}

Scene_Options.prototype.optionsWindowRect = function () {
  const n = Math.min(this.maxCommands(), this.maxVisibleCommands())
  // Edit: Increased width slightly.
  const ww = 450
  const wh = this.calcWindowHeight(n, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

// Edit: New info window with certain information.
Scene_Options.prototype.createInfoWindow = function () {
  // WIP: Add a way for custom text?
  const ww = 735
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = 0
  this._infoWindow = new Window_Text(
    new Rectangle(wx, wy, ww, 56),
    'Full Screen and Window Size will update when you exit.'
  )
  this.addWindow(this._infoWindow)
  this._infoWindow.open()
}

Scene_Options.prototype.maxCommands = function () {
  // Increase this value when adding option items.
  return 9
}

//==========================================================================
// SCENE_GAMEEND EDITS

Scene_GameEnd.prototype.createCommandWindow = function () {
  const rect = this.commandWindowRect()
  this._commandWindow = new Window_GameEnd(rect)
  this._commandWindow.setHandler('toTitle', this.commandToTitle.bind(this))
  // EDIT: Add command to quit the game from menu.
  this._commandWindow.setHandler('toQuit', this.commandQuitGame.bind(this))
  this._commandWindow.setHandler('cancel', this.popScene.bind(this))
  this.addWindow(this._commandWindow)
}

Scene_GameEnd.prototype.commandWindowRect = function () {
  const ww = this.mainCommandWidth()
  // EDIT: Change 2 -> 3 to include the new quit command.
  const wh = this.calcWindowHeight(3, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

// ==========================================================
// EDIT: Add the quit game command, with a text window.
Scene_GameEnd.prototype.commandQuitGame = function () {
  this._commandWindow.close()
  // free up old command window for garbage collection
  this._commandWindow = null

  const ww = this.mainCommandWidth()
  const wh = this.calcWindowHeight(2, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2

  const rect = new Rectangle(wx, wy, ww, wh)
  this._commandWindow = new Window_ConfirmCommand(rect)
  this._commandWindow.setBackgroundType(0)

  this._commandWindow.setHandler('confirmYes', this.commandConfirmYes.bind(this))
  this._commandWindow.setHandler('confirmNo', this.commandConfirmNo.bind(this))
  this._commandWindow.setHandler('cancel', this.commandConfirmNo.bind(this))

  if (!this._confirmText) {
    this._confirmText = new Window_Text(new Rectangle(wx + 20, wy - 75, 200, 60), 'Are you sure?')
    this.addWindow(this._confirmText)
  }
  this._confirmText.open()

  this.addWindow(this._commandWindow)
  this._commandWindow.open()
}

// EDIT: Added confirm Yes / No command.
Scene_GameEnd.prototype.commandConfirmYes = function () {
  this._commandWindow.close()
  this._confirmText.close()
  AudioManager.stopBgm()
  AudioManager.stopBgs()
  window.electron.ipcRenderer.send('quit-game')
}

Scene_GameEnd.prototype.commandConfirmNo = function () {
  this._commandWindow.close()
  this._confirmText.close()
  this.createCommandWindow()
}

//*********************************************************************** */
//                           CUSTOM SCENES
//*********************************************************************** */

//-------------------------------------------------------------------------------
//                          SCENE EDIT KEYS

function Scene_EditKeys() {
  this.initialize(...arguments)
}

Scene_EditKeys.prototype = Object.create(Scene_MenuBase.prototype)
Scene_EditKeys.prototype.constructor = Scene_EditKeys

Scene_EditKeys.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
}

Scene_EditKeys.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)
  this.createOptionsWindow()
  this.createInfoWindow()
}

Scene_EditKeys.prototype.terminate = function () {
  Scene_MenuBase.prototype.terminate.call(this)
}

Scene_EditKeys.prototype.createOptionsWindow = function () {
  const rect = this.optionsWindowRect()
  this._optionsWindow = new Window_EditKeyBoard(rect)
  this._optionsWindow.setHandler('cancel', this.exitScene.bind(this))
  this.addWindow(this._optionsWindow)
}

Scene_EditKeys.prototype.optionsWindowRect = function () {
  const ww = 450
  const wh = this.calcWindowHeight(10, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

Scene_EditKeys.prototype.createInfoWindow = function () {
  const ww = 400
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = 0
  this._infoWindow = new Window_Text(new Rectangle(wx, wy, ww, 56), 'Press any key.')
  this.addWindow(this._infoWindow)
  this._infoWindow.hide()
}

Scene_EditKeys.prototype.exitScene = function () {
  window.Input.saveInputs(false)
  this.popScene()
}

Scene_EditKeys.prototype.update = function () {
  if (window.Input.waitingForInput) {
    this._infoWindow.show()
  } else {
    if (this._infoWindow.visible) {
      this._infoWindow.hide()
      // redraw old input
      if (window.Input.tempInput.oldCommand) {
        const index = this._optionsWindow.findSymbol(window.Input.tempInput.oldCommand)
        this._optionsWindow.redrawItem(index)
      }
      // redraw new input
      this._optionsWindow.redrawItem(window.Input.tempInput.index)
    }
  }

  Scene_Base.prototype.update.call(this)
}

//-------------------------------------------------------------------------------
//                          SCENE EDIT GAMEPAD

function Scene_EditGamepad() {
  this.initialize(...arguments)
}

Scene_EditGamepad.prototype = Object.create(Scene_MenuBase.prototype)
Scene_EditGamepad.prototype.constructor = Scene_EditGamepad

Scene_EditGamepad.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
}

Scene_EditGamepad.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)
  this.createOptionsWindow()
  this.createInfoWindow()
}

Scene_EditGamepad.prototype.terminate = function () {
  Scene_MenuBase.prototype.terminate.call(this)
}

Scene_EditGamepad.prototype.createOptionsWindow = function () {
  const rect = this.optionsWindowRect()
  this._optionsWindow = new Window_EditGamepad(rect)
  this._optionsWindow.setHandler('cancel', this.exitScene.bind(this))
  this.addWindow(this._optionsWindow)
}

Scene_EditGamepad.prototype.optionsWindowRect = function () {
  const ww = 450
  const wh = this.calcWindowHeight(4, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

Scene_EditGamepad.prototype.createInfoWindow = function () {
  const ww = 400
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = 0
  this._infoWindow = new Window_Text(new Rectangle(wx, wy, ww, 56), 'Press any gamepad input.')
  this.addWindow(this._infoWindow)
  this._infoWindow.hide()
}

Scene_EditGamepad.prototype.exitScene = function () {
  window.Input.saveInputs(false)
  this.popScene()
}

Scene_EditGamepad.prototype.update = function () {
  if (window.Input.waitingForInput) {
    this._infoWindow.show()
  } else {
    if (this._infoWindow.visible) {
      this._infoWindow.hide()
      // redraw old input
      if (window.Input.tempInput.oldCommand) {
        const index = this._optionsWindow.findSymbol(window.Input.tempInput.oldCommand)
        this._optionsWindow.redrawItem(index)
      }
      // redraw new input
      this._optionsWindow.redrawItem(window.Input.tempInput.index)
    }
  }

  Scene_Base.prototype.update.call(this)
}
//-------------------------------------------------------------------------------
//                        SCENE CONTROLS

function Scene_Controls() {
  this.initialize(...arguments)
}

Scene_Controls.prototype = Object.create(Scene_MenuBase.prototype)
Scene_Controls.prototype.constructor = Scene_Controls

Scene_Controls.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this)
}

Scene_Controls.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this)
  this.createOptionsWindow()
}

Scene_Controls.prototype.terminate = function () {
  Scene_MenuBase.prototype.terminate.call(this)
}

Scene_Controls.prototype.createOptionsWindow = function () {
  const rect = this.optionsWindowRect()
  this._optionsWindow = new Window_Controls(rect)
  this._optionsWindow.setHandler('editKeys', this.editKeys.bind(this))
  this._optionsWindow.setHandler('editGamepad', this.editGamepad.bind(this))
  this._optionsWindow.setHandler('resetInput', this.resetInput.bind(this))
  this._optionsWindow.setHandler('cancel', this.popScene.bind(this))
  this.addWindow(this._optionsWindow)
}

Scene_Controls.prototype.optionsWindowRect = function () {
  const ww = 450
  const wh = this.calcWindowHeight(4, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = (Graphics.boxHeight - wh) / 2
  return new Rectangle(wx, wy, ww, wh)
}

Scene_Controls.prototype.editKeys = function () {
  SceneManager.push(Scene_EditKeys)
}

Scene_Controls.prototype.editGamepad = function () {
  SceneManager.push(Scene_EditGamepad)
}

Scene_Controls.prototype.resetInput = function () {
  this._optionsWindow.close()
  // free up old command window for garbage collection
  this._optionsWindow = null

  const ww = this.mainCommandWidth()
  const wh = this.calcWindowHeight(2, true)
  const wx = (Graphics.boxWidth - ww) / 2
  const wy = Graphics.boxHeight - wh - 96

  const background = window.$dataSystem.titleCommandWindow.background
  const rect = new Rectangle(wx, wy, ww, wh)

  this._optionsWindow = new Window_ConfirmCommand(rect)
  this._optionsWindow.setBackgroundType(background)

  this._optionsWindow.setHandler('confirmYes', this.commandConfirmYes.bind(this))
  this._optionsWindow.setHandler('confirmNo', this.commandConfirmNo.bind(this))
  this._optionsWindow.setHandler('cancel', this.commandConfirmNo.bind(this))

  if (!this._confirmText) {
    this._confirmText = new Window_Text(
      new Rectangle(wx + 20, wy - 75, 500, 60),
      'Reset inputs to default?'
    )

    this.addWindow(this._confirmText)
  }
  this._confirmText.open()

  this.addWindow(this._optionsWindow)
  this._optionsWindow.open()
}

// EDIT: Added confirm Yes / No command.
Scene_Controls.prototype.commandConfirmYes = function () {
  this._optionsWindow.close()
  this._optionsWindow = null
  this._confirmText.close()
  window.Input.saveInputs(true)
  this.createOptionsWindow()
}

Scene_Controls.prototype.commandConfirmNo = function () {
  this._optionsWindow.close()
  this._optionsWindow = null
  this._confirmText.close()
  this.createOptionsWindow()
}

//*********************************************************************** */
//                          RMMZ WINDOW EDITS
//*********************************************************************** */

//==========================================================================
// WINDOW_MENUCOMMAND EDITS

Window_MenuCommand.prototype.makeCommandList = function () {
  this.addMainCommands()
  this.addFormationCommand()
  this.addOriginalCommands()
  this.addOptionsCommand()
  // Edit: Add in new Controls in menu.
  this.addControlsCommand()
  this.addSaveCommand()
  this.addGameEndCommand()
}

// Edit: add Controls to main menu.
Window_MenuCommand.prototype.addControlsCommand = function () {
  this.addCommand('Controls', 'controls', true)
}

//==========================================================================
// WINDOW_OPTIONS EDITS

// Edit: Add window options.
Window_Options.prototype.makeCommandList = function () {
  this.addWindowOptions()
  this.addGeneralOptions()
  this.addVolumeOptions()
}

// Edit: New
Window_Options.prototype.addWindowOptions = function () {
  this.addCommand('Full Screen', 'screenFull')
  this.addCommand('Base Window Size', 'screenSize')
}

// Edit: Add to include screen size
Window_Options.prototype.statusText = function (index) {
  const symbol = this.commandSymbol(index)
  const value = this.getConfigValue(symbol)
  if (this.isVolumeSymbol(symbol)) {
    return this.volumeStatusText(value)
  } else if (this.isScreenSizeSymbol(symbol)) {
    return this.screenSizeStatusText(value)
  } else {
    return this.booleanStatusText(value)
  }
}

// Edit: New
Window_Options.prototype.isScreenSizeSymbol = function (symbol) {
  return symbol.includes('screenSize')
}

// Edit: New
Window_Options.prototype.screenSizeStatusText = function (value) {
  return value[0] + 'x' + value[1]
}

// Edit: Add change screen size.
Window_Options.prototype.processOk = function () {
  const index = this.index()
  const symbol = this.commandSymbol(index)
  if (this.isVolumeSymbol(symbol)) {
    this.changeVolume(symbol, true, true)
  } else if (this.isScreenSizeSymbol(symbol)) {
    this.changeScreenSize(symbol, true, true)
  } else {
    this.changeValue(symbol, !this.getConfigValue(symbol))
  }
}

// Edit: Add change screen size.
Window_Options.prototype.cursorRight = function () {
  const index = this.index()
  const symbol = this.commandSymbol(index)
  if (this.isVolumeSymbol(symbol)) {
    this.changeVolume(symbol, true, false)
  } else if (this.isScreenSizeSymbol(symbol)) {
    this.changeScreenSize(symbol, true, false)
  } else {
    this.changeValue(symbol, true)
  }
}

// Edit: Add change screen size.
Window_Options.prototype.cursorLeft = function () {
  const index = this.index()
  const symbol = this.commandSymbol(index)
  if (this.isVolumeSymbol(symbol)) {
    this.changeVolume(symbol, false, false)
  } else if (this.isScreenSizeSymbol(symbol)) {
    this.changeScreenSize(symbol, false, false)
  } else {
    this.changeValue(symbol, false)
  }
}

// Edit: New.
Window_Options.prototype.changeScreenSize = function (symbol, forward, wrap) {
  const lastValue = ConfigManager.getScreenRatio(...this.getConfigValue(symbol))
  const totalRatios = ConfigManager.ratioIndex.length
  const indexOfLast = ConfigManager.ratioIndex.indexOf(lastValue)

  let newIndex = -1

  if (forward) {
    if (wrap) {
      newIndex = indexOfLast + 1 >= totalRatios ? 0 : indexOfLast + 1
    } else {
      newIndex = indexOfLast + 1 >= totalRatios ? totalRatios - 1 : indexOfLast + 1
    }
  } else {
    if (wrap) {
      newIndex = indexOfLast - 1 === -1 ? totalRatios - 1 : indexOfLast - 1
    } else {
      newIndex = indexOfLast - 1 === -1 ? 0 : indexOfLast - 1
    }
  }

  if (newIndex != -1) {
    const newValue = ConfigManager.getSizeByRatio(ConfigManager.ratioIndex[newIndex])
    this.changeValue(symbol, newValue)
  }
}

Window_Options.prototype.changeValue = function (symbol, value) {
  const lastValue = this.getConfigValue(symbol)
  // EDIT: using ramda equals function to check for equality.
  if (!r_equals(lastValue, value)) {
    this.setConfigValue(symbol, value)
    this.redrawItem(this.findSymbol(symbol))
    this.playCursorSound()
  }
}

// Edit: Add in special case for screen symbols.
Window_Options.prototype.getConfigValue = function (symbol) {
  if (symbol.includes('screen')) {
    if (symbol.includes('Full')) {
      return ConfigManager.window.fullScreen
    } else if (symbol.includes('Size')) {
      return [ConfigManager.window.minWidth, ConfigManager.window.minHeight]
    }
  } else {
    return ConfigManager[symbol]
  }
}

// Edit: Add in special case for screen symbols.
Window_Options.prototype.setConfigValue = function (symbol, value) {
  if (symbol.includes('screen')) {
    if (symbol.includes('Full')) {
      ConfigManager.window.fullScreen = value
    } else if (symbol.includes('Size')) {
      ConfigManager.window.ratio = ConfigManager.getScreenRatio(...value)

      ConfigManager.window.minWidth = value[0]
      ConfigManager.window.width = value[0]

      ConfigManager.window.minHeight = value[1]
      ConfigManager.window.height = value[1]
    }
  } else {
    ConfigManager[symbol] = value
  }
}

//==========================================================================
// WINDOW_TITLECOMMAND EDITS

Window_TitleCommand.prototype.makeCommandList = function () {
  const continueEnabled = this.isContinueEnabled()
  this.addCommand(TextManager.newGame, 'newGame')
  this.addCommand(TextManager.continue_, 'continue', continueEnabled)
  this.addCommand(TextManager.options, 'options')
  // EDIT: Add quit button.
  this.addCommand('Quit Game', 'quitGame')
}

//==========================================================================
// WINDOW_GAMEEND EDITS

Window_GameEnd.prototype.makeCommandList = function () {
  this.addCommand(TextManager.toTitle, 'toTitle')
  // EDIT: Add quit command to menu.
  this.addCommand('Quit Game', 'toQuit')
  this.addCommand(TextManager.cancel, 'cancel')
}

//*********************************************************************** */
//                           CUSTOM WINDOWS
//*********************************************************************** */

//-----------------------------------------------------------------------------
//                       WINDOW CONFIRM COMMAND

// EDIT: A new window command to be able to select yes or no.
function Window_ConfirmCommand() {
  this.initialize(...arguments)
}

Window_ConfirmCommand.prototype = Object.create(Window_Command.prototype)
Window_ConfirmCommand.prototype.constructor = Window_ConfirmCommand

Window_ConfirmCommand.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
  this.selectLast()
  this.openness = 0
}

Window_ConfirmCommand.prototype.makeCommandList = function () {
  this.addCommand('Yes', 'confirmYes')
  this.addCommand('No', 'confirmNo')
}

Window_ConfirmCommand.prototype.processOk = function () {
  Window_Command.prototype.processOk.call(this)
}

Window_ConfirmCommand.prototype.selectLast = function () {
  this.selectSymbol('confirmNo')
}

//-----------------------------------------------------------------------------
//                           WINDOW TEXT

// EDIT: Add a new window to display text.
function Window_Text() {
  this.initialize(...arguments)
}

Window_Text.prototype = Object.create(Window_Base.prototype)
Window_Text.prototype.constructor = Window_Text

Window_Text.prototype.initialize = function (rect, text) {
  Window_Base.prototype.initialize.call(this, rect)
  this._text = text
  this.refresh()
}

Window_Text.prototype.refresh = function () {
  const rect = this.baseTextRect()
  this.contents.clear()
  this.drawTextEx(this._text, rect.x, rect.y, rect.width)
}

//-------------------------------------------------------------------------------
//                        WINDOW CONTROLS

function Window_Controls() {
  this.initialize(...arguments)
}

Window_Controls.prototype = Object.create(Window_Command.prototype)
Window_Controls.prototype.constructor = Window_Controls

Window_Controls.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
}

Window_Controls.prototype.makeCommandList = function () {
  // keyboard -> go to edit key bindings
  this.addCommand('Change key bindings', 'editKeys')
  // gamepad -> go to edit gamepad input
  this.addCommand('Change gamepad bindings', 'editGamepad')
  // reset -> select keyboard or gamepad or cancel
  this.addCommand('Reset key/gamepad bindings', 'resetInput')
  // exit -> exit scene.
  this.addCommand('exit', 'cancel')
}

Window_Controls.prototype.drawItem = function (index) {
  const title = this.commandName(index)
  const rect = this.itemLineRect(index)
  const titleWidth = rect.width
  this.resetTextColor()
  this.changePaintOpacity(this.isCommandEnabled(index))
  this.drawText(title, rect.x, rect.y, titleWidth, 'center')
}

Window_Controls.prototype.processOk = function () {
  Window_Command.prototype.processOk.call(this)
}

//-------------------------------------------------------------------------------
//                        WINDOW EDIT KEYBOARD
function Window_EditKeyBoard() {
  this.initialize(...arguments)
}

Window_EditKeyBoard.prototype = Object.create(Window_Command.prototype)
Window_EditKeyBoard.prototype.constructor = Window_EditKeyBoard

Window_EditKeyBoard.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
}

Window_EditKeyBoard.prototype.makeCommandList = function () {
  Object.entries(window.Input._commands).forEach(([key, obj]) => {
    if ('keyCode' in obj) {
      this.addCommand(key, `${key}-keyCode`)
    }
  })
}

Window_EditKeyBoard.prototype.drawItem = function (index) {
  const title = this.commandName(index)
  const status = this.statusText(index)
  const rect = this.itemLineRect(index)
  const statusWidth = this.statusWidth()
  const titleWidth = rect.width - statusWidth
  this.resetTextColor()
  this.changePaintOpacity(this.isCommandEnabled(index))
  this.drawText(title, rect.x, rect.y, titleWidth, 'left')
  this.drawText(status, rect.x + titleWidth, rect.y, statusWidth, 'right')
}

Window_EditKeyBoard.prototype.statusWidth = function () {
  return 120
}

Window_EditKeyBoard.prototype.statusText = function (index) {
  const symbolKeys = this.commandSymbol(index).split('-')
  const lang = 'en'
  if (!window.Input._commands[symbolKeys[0]][symbolKeys[1]]) {
    return ''
  } else {
    return Input.keyboardMap[lang][window.Input._commands[symbolKeys[0]][symbolKeys[1]]]
  }
}

Window_EditKeyBoard.prototype.processOk = function () {
  const symbolKeys = this.commandSymbol(this._index).split('-')

  // clear the input and waitForInput will be set to false in Keyboard.js after a keydown.
  window.Input.clear()
  window.Input.waitingForInput = true

  // set command/type of input
  window.Input.tempInput.command = symbolKeys[0]
  window.Input.tempInput.type = symbolKeys[1]

  // set index for redraw when window.Input.waitingForInput = false at the update in the scene.
  window.Input.tempInput.index = this.findSymbol(this.commandSymbol(this._index))

  this.playCursorSound()
}

//-------------------------------------------------------------------------------
//                        WINDOW EDIT KEYBOARD
function Window_EditGamepad() {
  this.initialize(...arguments)
}

Window_EditGamepad.prototype = Object.create(Window_Command.prototype)
Window_EditGamepad.prototype.constructor = Window_EditGamepad

Window_EditGamepad.prototype.initialize = function (rect) {
  Window_Command.prototype.initialize.call(this, rect)
}

Window_EditGamepad.prototype.makeCommandList = function () {
  Object.entries(window.Input._commands).forEach(([key, obj]) => {
    if ('button' in obj) {
      this.addCommand(key, `${key}-button`)
    }
  })
  Object.entries(window.Input._commands).forEach(([key, obj]) => {
    if ('axis' in obj) {
      this.addCommand(key, `${key}-axis`)
    }
  })
}

Window_EditGamepad.prototype.drawItem = function (index) {
  const title = this.commandName(index)
  const status = this.statusText(index)
  const rect = this.itemLineRect(index)
  const statusWidth = this.statusWidth()
  const titleWidth = rect.width - statusWidth
  this.resetTextColor()
  this.changePaintOpacity(this.isCommandEnabled(index))
  this.drawText(title, rect.x, rect.y, titleWidth, 'left')
  this.drawText(status, rect.x + titleWidth, rect.y, statusWidth, 'right')
}

Window_EditGamepad.prototype.statusWidth = function () {
  return 120
}

Window_EditGamepad.prototype.statusText = function (index) {
  const symbolKeys = this.commandSymbol(index).split('-')
  if (window.Input._commands[symbolKeys[0]][symbolKeys[1]] === undefined) {
    return ''
  } else {
    return window.Input._commands[symbolKeys[0]][symbolKeys[1]]
  }
}

Window_EditGamepad.prototype.processOk = function () {
  if (window.Input.gamepadConnected && !window.Input.waitingForInput) {
    const symbolKeys = this.commandSymbol(this._index).split('-')

    // clear the input and waitForInput will be set to false in Keyboard.js after a keydown.
    window.Input.clear()
    window.Input.waitingForInput = true

    // set command/type of input
    window.Input.tempInput.command = symbolKeys[0]
    window.Input.tempInput.type = symbolKeys[1]

    // set index for redraw when window.Input.waitingForInput = false at the update in the scene.
    window.Input.tempInput.index = this.findSymbol(this.commandSymbol(this._index))

    this.playCursorSound()
  } else {
    this.playBuzzerSound()
  }
}

export {
  // Core
  Bitmap,
  ColorFilter,
  Graphics,
  Input,
  JsonEx,
  Point,
  Rectangle,
  ScreenSprite,
  Sprite,
  Stage,
  Tilemap,
  TilingSprite,
  TouchInput,
  Utils,
  Video,
  Weather,
  WebAudio,
  Window,
  WindowLayer,
  // Managers
  DataManager,
  AudioManager,
  BattleManager,
  ColorManager,
  ConfigManager,
  EffectManager,
  FontManager,
  ImageManager,
  PluginManager,
  SceneManager,
  SoundManager,
  StorageManager,
  TextManager,
  // Objects
  Game_Action,
  Game_ActionResult,
  Game_Actor,
  Game_Actors,
  Game_Battler,
  Game_BattlerBase,
  Game_Character,
  Game_CharacterBase,
  Game_CommonEvent,
  Game_Enemy,
  Game_Event,
  Game_Follower,
  Game_Followers,
  Game_Interpreter,
  Game_Item,
  Game_Map,
  Game_Message,
  Game_Party,
  Game_Picture,
  Game_Player,
  Game_Screen,
  Game_SelfSwitches,
  Game_Switches,
  Game_System,
  Game_Temp,
  Game_Timer,
  Game_Troop,
  Game_Unit,
  Game_Variables,
  Game_Vehicle,
  // Scenes
  Scene_Base,
  Scene_Battle,
  Scene_Boot,
  Scene_Debug,
  Scene_Equip,
  Scene_File,
  Scene_GameEnd,
  Scene_Gameover,
  Scene_Item,
  Scene_ItemBase,
  Scene_Load,
  Scene_Map,
  Scene_Menu,
  Scene_MenuBase,
  Scene_Message,
  Scene_Name,
  Scene_Options,
  Scene_Save,
  Scene_Shop,
  Scene_Skill,
  Scene_Status,
  Scene_Title,
  // Sprites
  Sprite_Actor,
  Sprite_Animation,
  Sprite_AnimationMV,
  Sprite_Balloon,
  Sprite_Battleback,
  Sprite_Battler,
  Sprite_Button,
  Sprite_Character,
  Sprite_Clickable,
  Sprite_Damage,
  Sprite_Destination,
  Sprite_Enemy,
  Sprite_Gauge,
  Sprite_Name,
  Sprite_Picture,
  Sprite_StateIcon,
  Sprite_StateOverlay,
  Sprite_Timer,
  Sprite_Weapon,
  Spriteset_Base,
  Spriteset_Battle,
  Spriteset_Map,
  // Windows
  Window_ActorCommand,
  Window_Base,
  Window_BattleActor,
  Window_BattleEnemy,
  Window_BattleItem,
  Window_BattleLog,
  Window_BattleSkill,
  Window_BattleStatus,
  Window_ChoiceList,
  Window_Command,
  Window_DebugEdit,
  Window_DebugRange,
  Window_EquipCommand,
  Window_EquipItem,
  Window_EquipSlot,
  Window_EquipStatus,
  Window_EventItem,
  Window_GameEnd,
  Window_Gold,
  Window_Help,
  Window_HorzCommand,
  Window_ItemCategory,
  Window_ItemList,
  Window_MapName,
  Window_MenuActor,
  Window_MenuCommand,
  Window_MenuStatus,
  Window_Message,
  Window_NameBox,
  Window_NameEdit,
  Window_NameInput,
  Window_NumberInput,
  Window_Options,
  Window_PartyCommand,
  Window_SavefileList,
  Window_ScrollText,
  Window_Scrollable,
  Window_Selectable,
  Window_ShopBuy,
  Window_ShopCommand,
  Window_ShopNumber,
  Window_ShopSell,
  Window_ShopStatus,
  Window_SkillList,
  Window_SkillStatus,
  Window_SkillType,
  Window_Status,
  Window_StatusBase,
  Window_StatusEquip,
  Window_StatusParams,
  Window_TitleCommand,
  // CUSTOM SCENES
  Scene_Controls,
  Scene_EditGamepad,
  Scene_EditKeys,
  // CUSTOM WINDOWS
  Window_ConfirmCommand,
  Window_Controls,
  Window_EditGamepad,
  Window_EditKeyBoard,
  Window_Text
}
