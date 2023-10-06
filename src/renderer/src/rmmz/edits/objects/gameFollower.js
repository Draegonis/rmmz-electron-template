import { Game_Follower } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_Follower.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

export { Game_Follower }
