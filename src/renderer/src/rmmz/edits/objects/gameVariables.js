import { Game_Variables } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_Variables.prototype.loadContents = function (contents) {
  this._data = contents
}

export { Game_Variables }
