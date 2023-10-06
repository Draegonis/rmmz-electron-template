import { Game_Item } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_Item.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

export { Game_Item }
