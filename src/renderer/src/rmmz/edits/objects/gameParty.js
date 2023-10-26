import { Game_Party } from '../../rmmz_objects'

// EDIT: Special function to re-add content data into the class.
Game_Party.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    switch (key) {
      case '_lastItem': {
        this._lastItem.setContents(contents._lastItem)
        break
      }
      default: {
        this[key] = contents[key]
      }
    }
  })
}

Game_Party.prototype.setupBattleTestMembers = function () {
  const { BATTLERS } = window.$APP._test

  // EDIT: Changed to a variable loaded from .env.development
  for (const battler of BATTLERS) {
    const actor = window.$gameActors.actor(battler.actorId)
    if (actor) {
      actor.changeLevel(battler.level, false)
      actor.initEquips(battler.equips)
      actor.recoverAll()
      this.addActor(battler.actorId)
    }
  }
}

export { Game_Party }
