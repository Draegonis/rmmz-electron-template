import { Game_Event, Game_Character } from '../../rmmz_objects'

Game_Event.prototype.initialize = function (mapId, eventId, forContent) {
  Game_Character.prototype.initialize.call(this)
  this._mapId = mapId
  this._eventId = eventId
  if (!forContent) {
    this.locate(this.event().x, this.event().y)
    this.refresh()
  }
}

// EDIT: Special function to re-add content data into the class.
Game_Event.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

export { Game_Event }
