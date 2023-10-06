import { Bitmap } from '../../rmmz_core'

Bitmap.prototype._createCanvas = function (width, height) {
  this._canvas = document.createElement('canvas')
  // EDIT: Added willReadFrequently: true.
  this._context = this._canvas.getContext('2d', { willReadFrequently: true })
  this._canvas.width = width
  this._canvas.height = height
  this._createBaseTexture(this._canvas)
}

export { Bitmap }
