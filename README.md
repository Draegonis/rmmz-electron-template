# Rmmz Electron Template

===== THIS IS A WORK IN PROGRESS ===== Some things will change and be refined over time.

This project is using the https://electron-vite.org/ react js template as a base.

A project that allows you to deploy your Rpg Maker MZ game as an electron app. Using vite instead of webpack and electron builder for packaging.
Designed to use RMMZ Core scripts: 1.7.0 as a base. All the changes/edits/additions are in src/renderer/src/rmmz/index.js.

## Before using this project

- This project does not support any other RPG Maker version, though it may be possible to edit the Rpg Maker MV core scripts to make it work but that is not part of this project.
- This project is designed to enhance the deployment of a Rpg Maker MZ game. It is not meant to be a replacement for the engine. Inside the src/renderer/public folder is where you place your Rpg Maker MZ project or web deployment. If you place a project you may want to remove the index.html/package.json/game.rmmzproject in the public folder before packaging. You will need to edit the js files of either a project or web deployment before packaging.
- There is no garenteed support for 3rd party plugins. Specially ones that are obfuscated,
  or do not allow edits. Do note that this project does break compatibility with a lot of plugins
  and will need basic to advanced editting.
- Files that are already in scr/renderer/public folder are required for the project. You will
  notice that most of the js files are moved outside and editted.

  ## What this project is good for

- Allows deployment to windows, mac and linux, with targetted architectures.
- Allows you to customise the game more using electron.
  - Can setup a custom menu bar.
  - Can also have the game in the tray.
  - Can setup multiple windows.
  - Can setup auto-updates for your game.
    - Electron builder auto-updates -> https://www.electron.build/auto-update.html
  - You can setup code signing for your game.
    - Electron builder code signing -> https://www.electron.build/code-signing.html
    - For mac see -> https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
- Allows the use of more recent ES version.
- Uses a more recent version of pixi.js.
- Faster loading with vite module bundling, minifying the rmmz scripts, and code splitting.
- Stores data in the users app data:
  - %APPDATA% on Windows
  - $XDG_CONFIG_HOME or ~/.config on Linux
  - ~/Library/Application Support on macOS
- Easy to setup web workers -> https://vitejs.dev/guide/features.html#web-workers
  - Using the import MyWorker from './worker?worker' method.

## What this project is not good for

- Does not support Windows 7/8/8.1 since this project uses Electron 25.2.0 or greater.
- Cannot deploy to mobile or websites, this is strictly for desktop (windows/mac/linux).
- It is not beginner friendly, some experience or lots of googling required.
- Asset and source protection is minimal.
- The packaged size of the game is bigger.
- Breaks play testing from the editor. You can use the .env.development variables to do special play testing. You will need to run in the terminal the [package manager] run dev script in order to play test.
- Will break compatibility with some plugins:
  - Cannot use require in renderer (where the game runs).
  - When saving all prototypes are stripped from the data objects, and will throw an error if you try to save a function into the save file.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

1. Clone the repository.
2. Install node.js from https://nodejs.org/en/download
3. Open the terminal in the cloned project, example: Terminal -> New Terminal in VScode.
4. Either use npm or install your prefered package manager.
   - I use yarn and added the yarn lock to the project. It doesn't prevent you from using something different but there may be rare cases where it will cause a bug.
5. Run the command to install node modules, npm install / yarn install etc.
6. If you used something other then yarn edit the package.json scripts, to use your package manager.
7. Place your Rpg Maker MZ project or web deployment into the scr/renderer/public folder, while keeping what is already there.
8. Edit the RMMZ Core scripts following the instructions below.

## Core Script Editing Instructions

This project does not run without adding the original rmmz js files and editing them using the instructions below. The scripts have to be placed into the src/renderer/src/rmmz folder.

Steps to convert original scripts:

### Converting rmmz_core.js:

1. search and replace PIXI with window.PIXI
2. search effekseer.createContext and add // eslint-disable-next-line no-undef above it.
3. search this.\_decoder = new VorbisDecoder and add // eslint-disable-next-line no-undef above it.
4. remove Utils.isOptionValid, it is not needed.
5. add:

```

export { Bitmap, ColorFilter, Graphics, Input, JsonEx, Point, Rectangle, ScreenSprite, Sprite, Stage, Tilemap, TilingSprite, TouchInput, Utils, Video, Weather, WebAudio, Window, WindowLayer }

```

At the end of the file.

### Converting rmmz_manager.js:

1. add:

```

import { Utils, Bitmap, Graphics, WebAudio, Video, Input, TouchInput } from './rmmz_core'
import { Game_Action, Game_Temp, Game_System, Game_Screen, Game_Timer, Game_Message, Game_Switches, Game_Variables, Game_SelfSwitches, Game_Actors, Game_Party, Game_Troop, Game_Map, Game_Player } from './rmmz_objects'
import { Scene_Gameover } from './rmmz_scenes'

```

To the top of the file.

2. at DataManager.isBattleTest, DataManager.isEventTest, DataManager.isTitleSkip remove Utils.isOptionValid and replace with true.
3. search and replace all $data with window.$data
   - search DataManager.loadMapData = function (mapId) and at this.loadDataFile change window.$dataMap to $dataMap. If you forget this your game will load but then hang when you try to start a new game.
   - in DataManager.\_databaseFiles, remove window. in front of all $data
4. search and replace all $game with window.$game
5. search and replace all $testEvent with window.$testEvent
6. edit StorageManager keep saveObject loadObject. Remove the rest.

StorageManager should look like this:

```
function StorageManager() {
  throw new Error('This is a static class')
}

StorageManager.saveObject = function () {
  return true
}

StorageManager.loadObject = function () {
  return {}
}
```

8. in SceneManager remove: SceneManager.showDevTools, SceneManager.reloadGame, SceneManager.terminate.

- Edit SceneManager.onKeyDown to:

```

SceneManager.onKeyDown = function () {}

```

9. add:

```

export { DataManager, AudioManager, BattleManager, ColorManager, ConfigManager, EffectManager, FontManager, ImageManager, PluginManager, SceneManager, SoundManager, StorageManager, TextManager }

```

To the end of the file.

### Converting rmmz_objects.js:

1. add:

```

import { Utils, Graphics, Input, TouchInput, Video, Point } from './rmmz_core'
import { AudioManager, BattleManager, ConfigManager, DataManager, SoundManager, ImageManager, SceneManager, PluginManager, TextManager } from './rmmz_managers'
import { Scene_Battle, Scene_Shop, Scene_Name, Scene_Title, Scene_Menu, Scene_Save, Scene_Gameover } from './rmmz_scenes'
import { Window_MenuCommand } from './rmmz_windows'

```

To the top of the file.

2. at Game_Temp.prototype.initialize change this.\_isPlaytest to this.\_isPlaytest = true
3. search and replace all $game with window.$game
4. search and replace all $data with window.$data
5. in Game_Map.prototype.setupTestEvent, add window. for the other two $testEvent.
6. add:

```

export { Game_Action, Game_ActionResult, Game_Actor, Game_Actors, Game_Battler, Game_BattlerBase, Game_Character, Game_CharacterBase, Game_CommonEvent, Game_Enemy, Game_Event, Game_Follower, Game_Followers, Game_Interpreter, Game_Item, Game_Map, Game_Message, Game_Party, Game_Picture, Game_Player, Game_Screen, Game_SelfSwitches, Game_Switches, Game_System, Game_Temp, Game_Timer, Game_Troop, Game_Unit, Game_Variables, Game_Vehicle }

```

To the end of the file.

### Converting rmmz_scenes.js:

1. add:

```

import { Stage, WindowLayer, Graphics, ColorFilter, Utils, Sprite, Bitmap, Rectangle, Input, TouchInput } from './rmmz_core'
import { EffectManager, ImageManager, FontManager, AudioManager, SceneManager, DataManager, ColorManager, ConfigManager, SoundManager, BattleManager, TextManager } from './rmmz_managers'
import { Game_Action } from './rmmz_objects'
import { Window_Selectable, Window_Base, Window_TitleCommand, Window_Message, Window_ScrollText, Window_Gold, Window_ChoiceList, Window_NameBox, Window_NumberInput, Window_EventItem, Window_MapName, Window_MenuCommand, Window_Help, Window_MenuStatus, Window_MenuActor, Window_ItemList, Window_ItemCategory, Window_SkillList, Window_SkillStatus, Window_SkillType, Window_EquipCommand, Window_EquipSlot, Window_EquipItem, Window_EquipStatus, Window_Status, Window_StatusEquip, Window_StatusParams, Window_Options, Window_ShopBuy, Window_ShopCommand, Window_ShopSell, Window_ShopStatus, Window_ShopNumber, Window_SavefileList, Window_GameEnd, Window_NameInput, Window_NameEdit, Window_DebugEdit, Window_DebugRange, Window_BattleActor, Window_BattleEnemy, Window_BattleItem, Window_BattleLog, Window_BattleSkill, Window_BattleStatus, Window_ActorCommand, Window_PartyCommand } from './rmmz_windows'
import { Spriteset_Map, Spriteset_Battle, Sprite_Button } from './rmmz_sprites'

```

To the top of the file.

2. search Scene_Boot.prototype.adjustBoxSize and move it to Scene_Base. Ex: Scene_Base.prototype.adjustBoxSize.
3. search and replace all $game with window.$game
4. search and replace all $data with window.$data
5. search and replace all PIXI with window.PIXI
6. add:

```

export { Scene_Base, Scene_Battle, Scene_Boot, Scene_Debug, Scene_Equip, Scene_File, Scene_GameEnd, Scene_Gameover, Scene_Item, Scene_ItemBase, Scene_Load, Scene_Map, Scene_Menu, Scene_MenuBase, Scene_Message, Scene_Name, Scene_Options, Scene_Save, Scene_Shop, Scene_Skill, Scene_Status, Scene_Title }

```

To the end of the file.

### Converting rmmz_sprites.js:

1. add:

```

import { Input, TouchInput, Point, Rectangle, Sprite, Graphics, ScreenSprite, TilingSprite, Bitmap, ColorFilter, Tilemap, Weather } from './rmmz_core'
import { BattleManager, ImageManager, SoundManager, EffectManager, AudioManager, ColorManager, TextManager, SceneManager } from './rmmz_managers'

```

To the top of the file.

2. search and replace all $game with window.$game
3. search and replace all $data with window.$data
4. search and replace all PIXI with window.PIXI
5. add:

```

export { Sprite_Actor, Sprite_Animation, Sprite_AnimationMV, Sprite_Balloon, Sprite_Battleback, Sprite_Battler, Sprite_Button, Sprite_Character, Sprite_Clickable, Sprite_Damage, Sprite_Destination, Sprite_Enemy, Sprite_Gauge, Sprite_Name, Sprite_Picture, Sprite_StateIcon, Sprite_StateOverlay, Sprite_Timer, Sprite_Weapon, Spriteset_Base, Spriteset_Battle, Spriteset_Map }

```

To the end of the file.

### Converting rmmz_windows.js:

1. add:

```

import { Point, Rectangle, Graphics, Bitmap, Utils, Sprite, Input, TouchInput, JsonEx, Window } from './rmmz_core'
import { ImageManager, ColorManager, TextManager, SoundManager, BattleManager, DataManager, ConfigManager } from './rmmz_managers'
import { Sprite_Name, Sprite_StateIcon, Sprite_Gauge, Sprite_Button } from './rmmz_sprites'
import { Game_Action } from './rmmz_objects'

```

To the top of the file.

2. search and replace all $game with window.$game
3. search and replace all $data with window.$data
4. add:

```

export { Window_ActorCommand, Window_Base, Window_BattleActor, Window_BattleEnemy, Window_BattleItem, Window_BattleLog, Window_BattleSkill, Window_BattleStatus, Window_ChoiceList, Window_Command, Window_DebugEdit, Window_DebugRange, Window_EquipCommand, Window_EquipItem, Window_EquipSlot, Window_EquipStatus, Window_EventItem, Window_GameEnd, Window_Gold, Window_Help, Window_HorzCommand, Window_ItemCategory, Window_ItemList, Window_MapName, Window_MenuActor, Window_MenuCommand, Window_MenuStatus, Window_Message, Window_NameBox, Window_NameEdit, Window_NameInput, Window_NumberInput, Window_Options, Window_PartyCommand, Window_SavefileList, Window_ScrollText, Window_Scrollable, Window_Selectable, Window_ShopBuy, Window_ShopCommand, Window_ShopNumber, Window_ShopSell, Window_ShopStatus, Window_SkillList, Window_SkillStatus, Window_SkillType, Window_Status, Window_StatusBase, Window_StatusEquip, Window_StatusParams, Window_TitleCommand }

```

To the end of the file.

### Final steps

1. In the public folder, js/libs folder only include:

effekseer.min.js
effekseer.wasm
vorbisdecoder.js

All the other files in the libs folder are not used.

2. You do not need your game.css file, one is included with some edits.

## The basic package.json script commands

### Install

Replace yarn with your prefered package manager, so if it is npm it would be npm install instead of yarn install. If you do use a different package manager, edit the package.json and change the build:mac, build:win, build:linux scripts from yarn to the one you are using.

```bash
$ yarn install
```

### Development

```bash
$ yarn run dev
```

### Build

```bash
# For windows
$ yarn run build:win

# For macOS
$ yarn run build:mac

# For Linux
$ yarn run build:linux
```

## Special Notes

- productName in the package.json is unified across the app for the name of the game.
- the macOS menu will show Electron in development, but will show productName in production.

## Development Environment

Inside .env.development are the variables to change the way the game starts up.

- At the moment there is no event testing.
- It should be possible to setup custom testing environments.

MAIN_VITE_VARIABLENAME -> creates an env variable for the main electron.
PRELOAD_VITE_VARIABLENAME -> creates an env variable for the preload script.
RENDERER_VITE_VARIABLENAME -> creates an env variable for the renderer.

### Running a battle test.

RENDERER_VITE_BATTLETEST is the data to start the battle test.

```

RENDERER_VITE_ISOPTIONVALID="battle"
RENDERER_VITE_BATTLETEST="{"testBattlers":[{"actorId":1,"level":1,"equips":[2,1,2,3,0]}],"testTroopId":1}"

```

Keep in mind the data is JSON.parsed so it needs to stay in the format that's inside .env.development.

### Skipping the title screen.

RENDERER_VITE_ISOPTIONVALID="skiptitle"

## Importing plugin js files as modules.

This is to take advantage of vite modules and also if you want to import packages into a personal plugin. You do not need to import the RMMZ scripts, use the ones on the window object since they are the recent/editted ones.

1. In the public/js/plugins js file: place this into the comment section for plugin parameters. A couple plugins are included as an example.

```

@param IMPORT_AS_MODULE
@text Import as Module
@type boolean
@default true

```

2. - Copy all the code and place into a new js file in the src/plugins folder.
   - You will need to edit the all the classes/PIXI/$game/$data to add window. in front
     in order to correct linter errors.
   - You will also need to edit anything using require, since you need to go through ipcRenderer/ipcMain
     in order to use node modules on the electron side.
   - If the plugin adds any unique classes to the save data you will need to create a special loader to create the class with the save data. The reason being is when sending the information to electron it will not save the prototypes, and if you try to save a function directly it will cause an error. If you want a reference: take a look at the loadContents/setContents functions.
     - loadContents is for the immediate class.
     - setContents is for a class within a class.

3. Add this to the end of the file in the public/js/plugins folder:

```

await window.loadPluginJs('pluginName')

```

The pluginName is the one inside src/plugins folder, it doesn't need to be the same name.
