import { Game_Actors, Game_Actor } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_Actors.prototype.loadContents = function (contents) {
  this._data = contents._data.map((actor) => {
    if (actor) {
      const tempActor = new Game_Actor(actor._actorId)

      Object.keys(actor).forEach((key) => {
        switch (key) {
          case '_equips': {
            const equips = actor._equips.map((equip) => equip._itemId)
            tempActor.initEquips(equips)
            break
          }
          case '_result': {
            break
          }
          default: {
            tempActor[key] = actor[key]
          }
        }
      })

      return tempActor
    }

    return null
  })
}

export { Game_Actors }
