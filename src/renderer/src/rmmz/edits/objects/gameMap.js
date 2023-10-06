import { Game_Map, Game_CommonEvent } from '../../rmmz_objects'
// Edited
import { Game_Event } from '../editsIndex'

// EDIT: Special function to re-add content data into the class.
Game_Map.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    switch (key) {
      case '_commonEvents': {
        this._commonEvents = contents._commonEvents.map((event) => {
          if (event) return new Game_CommonEvent(event._commonEventId)
          return null
        })
        break
      }
      case '_events': {
        this._events = contents._events.map((event) => {
          if (event) {
            const tempEvent = new Game_Event(event._mapId, event._eventId, true)
            tempEvent.setContents(event)
            return tempEvent
          }
          return null
        })
        break
      }
      case '_interpreter': {
        this._interpreter.setContents(contents._interpreter)
        break
      }
      case '_vehicles': {
        this._vehicles[0].setContents(contents._vehicles[0])
        this._vehicles[1].setContents(contents._vehicles[1])
        this._vehicles[2].setContents(contents._vehicles[2])
        break
      }
      default: {
        this[key] = contents[key]
      }
    }
  })
}

export { Game_Map }
