import { Utils } from '../../rmmz_core'

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

export { Utils }
