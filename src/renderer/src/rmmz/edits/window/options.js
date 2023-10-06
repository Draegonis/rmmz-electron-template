import { Window_Options } from '../../rmmz_windows'
// Edits
import { ConfigManager } from '../editsIndex'
// Helpers
import { equals as r_equals } from 'ramda'

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

export { Window_Options }
