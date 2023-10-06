import { Game_Timer } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_Timer.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

export { Game_Timer }
