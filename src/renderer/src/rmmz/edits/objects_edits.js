import {
  Game_Temp,
  Game_System,
  Game_Timer,
  Game_Switches,
  Game_SelfSwitches,
  Game_Variables,
  Game_Screen,
  Game_Item,
  Game_Actor,
  Game_Actors,
  Game_Party,
  Game_Map,
  Game_CommonEvent,
  Game_Event,
  Game_Player,
  Game_Follower,
  Game_Interpreter,
  Game_Character,
  Game_Vehicle
} from '../rmmz_objects'

//==========================================================================
// GAME_TEMP EDITS

Game_Temp.prototype.initialize = function () {
  // EDIT: Changed to check the NODE_ENV_ELECTRON_VITE env variable.
  this._isPlaytest = window.electron.process.env.NODE_ENV_ELECTRON_VITE === 'development'
  this._destinationX = null
  this._destinationY = null
  this._touchTarget = null
  this._touchState = ''
  this._needsBattleRefresh = false
  this._commonEventQueue = []
  this._animationQueue = []
  this._balloonQueue = []
  this._lastActionData = [0, 0, 0, 0, 0, 0]
}

//==========================================================================
// GAME_SYSTEM EDITS

// EDIT: Special function to re-add content data into the class.
Game_System.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_TIMER EDITS

// EDIT: Special function to re-add content data into the class.
Game_Timer.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_SWITCHES EDITS

// EDIT: Special function to re-add content data into the class.
Game_Switches.prototype.loadContents = function (contents) {
  this._data = contents
}

//==========================================================================
// GAME_VARIABLES EDITS

// EDIT: Special function to re-add content data into the class.
Game_Variables.prototype.loadContents = function (contents) {
  this._data = contents
}

//==========================================================================
// GAME_SELFSWITCHES EDITS

// EDIT: Special function to re-add content data into the class.
Game_SelfSwitches.prototype.loadContents = function (contents) {
  this._data = contents
}

//==========================================================================
// GAME_SCREEN EDITS

// EDIT: Special function to re-add content data into the class.
Game_Screen.prototype.loadContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_ITEM EDITS

// EDIT: Special function to re-add content data into the class.
Game_Item.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_ACTORS EDITS

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

//==========================================================================
// GAME_PARTY EDITS

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
  // EDIT: Changed to a variable loaded from .env.development
  for (const battler of window.$TEST.BATTLERS) {
    const actor = window.$gameActors.actor(battler.actorId)
    if (actor) {
      actor.changeLevel(battler.level, false)
      actor.initEquips(battler.equips)
      actor.recoverAll()
      this.addActor(battler.actorId)
    }
  }
}

//==========================================================================
// GAME_MAP EDITS

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

//==========================================================================
// GAME_PLAYER EDITS

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

//==========================================================================
// GAME_FOLLOWER EDITS

// EDIT: Special function to re-add content data into the class.
Game_Follower.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_VEHICLE EDITS

// EDIT: Special function to re-add content data into the class.
Game_Vehicle.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//==========================================================================
// GAME_EVENT EDITS

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

//==========================================================================
// GAME_INTERPRETER EDITS

// EDIT: Special function to re-add content data into the class.
Game_Interpreter.prototype.setContents = function (contents) {
  Object.keys(contents).forEach((key) => {
    this[key] = contents[key]
  })
}

//=======================================================
// Edit and then re-export only the edited ones.
export {
  Game_Temp,
  Game_System,
  Game_Timer,
  Game_Switches,
  Game_Variables,
  Game_SelfSwitches,
  Game_Screen,
  Game_Item,
  Game_Actors,
  Game_Party,
  Game_Map,
  Game_Player,
  Game_Follower,
  Game_Vehicle,
  Game_Event,
  Game_Interpreter
}
