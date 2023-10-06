import {
  Window_MenuCommand,
  Window_Options,
  Window_TitleCommand,
  Window_GameEnd
} from '../rmmz_windows'
import { TextManager } from '../rmmz_managers'
// Import edited ones not the originals.
import { ConfigManager } from './managers_edits'
// Helpers
import { equals as r_equals } from 'ramda'
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
  // EDIT: Add controls button
  this.addCommand('Controls', 'controls')
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

//=======================================================
// Edit and then re-export only the edited ones.
export { Window_MenuCommand, Window_Options, Window_TitleCommand, Window_GameEnd }
