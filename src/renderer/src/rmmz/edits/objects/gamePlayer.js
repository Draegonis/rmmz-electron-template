import { Game_Player } from '../../rmmz_objects'
// Edited
import { Game_Follower } from '../editsIndex'

// EDIT: Special function to re-add content data into the class.
Game_Player.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    switch (key) {
      case '_followers': {
        const FOLLOWERS = contents._followers._data.map((follower) => {
          const tempFollower = new Game_Follower(follower._memberIndex)
          tempFollower.setContents(follower)
          return tempFollower
        })
        this._followers._data = FOLLOWERS
        break
      }
      default: {
        this[key] = contents[key]
      }
    }
  })
}

export { Game_Player }
