import { Game_Switches } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_Switches.prototype.loadContents = function (contents) {
  this._data = contents
}

export { Game_Switches }
