// Core edits.
import { Utils } from './core/utils'
import { Graphics } from './core/graphics'
import { Bitmap } from './core/bitmap'
import { WebAudio } from './core/webaudio'
import { Input } from './core/input'
// Managers edits.
import { ConfigManager } from './managers/configManager'
import { DataManager } from './managers/dataManager'
import { PluginManager } from './managers/pluginManager'
import { StorageManager } from './managers/storageManager'
// Objects edits
import { Game_Actors } from './objects/gameActors'
import { Game_Event } from './objects/gameEvent'
import { Game_Follower } from './objects/gameFollower'
import { Game_Interpreter } from './objects/gameInterpreter'
import { Game_Item } from './objects/gameItem'
import { Game_Map } from './objects/gameMap'
import { Game_Party } from './objects/gameParty'
import { Game_Player } from './objects/gamePlayer'
import { Game_Screen } from './objects/gameScreen'
import { Game_SelfSwitches } from './objects/gameSelfSwitches'
import { Game_Switches } from './objects/gameSwitches'
import { Game_System } from './objects/gameSystem'
import { Game_Temp } from './objects/gameTemp'
import { Game_Timer } from './objects/gameTimer'
import { Game_Variables } from './objects/gameVariables'
import { Game_Vehicle } from './objects/gameVehicle'
// Scene edits
import { Scene_Base } from './scenes/base'
import { Scene_Boot } from './scenes/boot'
import { Scene_GameEnd } from './scenes/gameEnd'
import { Scene_Menu } from './scenes/menu'
import { Scene_Options } from './scenes/options'
import { Scene_Title } from './scenes/title'
import { Scene_Save } from './scenes/save'
import { Scene_Load } from './scenes/load'
// Window edits
import { Window_GameEnd } from './window/gameEnd'
import { Window_MenuCommand } from './window/menuCommand'
import { Window_Options } from './window/options'
import { Window_TitleCommand } from './window/titleCommand'
// Sprite edits
import { Sprite_Enemy } from './sprite/enemy'
import { Sprite_Battleback } from './sprite/battleback'
// Re-export all edits
export {
  // CORE EDITED
  Utils,
  Bitmap,
  Graphics,
  Input,
  WebAudio,
  // MANAGERS EDITED
  ConfigManager,
  DataManager,
  PluginManager,
  StorageManager,
  // OBJECTS EDITED
  Game_Actors,
  Game_Event,
  Game_Follower,
  Game_Interpreter,
  Game_Item,
  Game_Map,
  Game_Party,
  Game_Player,
  Game_Screen,
  Game_SelfSwitches,
  Game_Switches,
  Game_System,
  Game_Temp,
  Game_Timer,
  Game_Variables,
  Game_Vehicle,
  // SCENES EDITED
  Scene_Base,
  Scene_Boot,
  Scene_GameEnd,
  Scene_Menu,
  Scene_Options,
  Scene_Title,
  Scene_Save,
  Scene_Load,
  // WINDOWS EDITED
  Window_GameEnd,
  Window_MenuCommand,
  Window_Options,
  Window_TitleCommand,
  // SPRITES EDITED
  Sprite_Enemy,
  Sprite_Battleback
}
