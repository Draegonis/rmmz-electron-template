import { Game_System } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_System.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

export { Game_System }
