import { Game_SelfSwitches } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_SelfSwitches.prototype.loadContents = function (contents) {
  this._data = contents
}

export { Game_SelfSwitches }
