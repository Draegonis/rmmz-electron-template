import { Game_Interpreter } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_Interpreter.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

export { Game_Interpreter }
