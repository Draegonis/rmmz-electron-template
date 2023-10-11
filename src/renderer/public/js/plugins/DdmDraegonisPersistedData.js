/*:
 * @target MZ
 * @plugindesc A plugin to allow persisted data between save files.
 * @author DdmDraegonis
 * @url https://github.com/Draegonis/rmmz-electron-template
 * 
 * @param variableList
 * @text Variable List
 * @type variable[]
 * @default []
 * 
 * @param switchList
 * @text Switch List
 * @type switch[]
 * @default []
 * 
 * @param eventList
 * @text Event List
 * @type struct<SelfSwitch>[]
 * @default "["{"mapId":"1","eventId":"1","switchId":"A"}"]"
 * 
 * @command saveAll
 * @text Save All Data
 * @desc Save all registered game variables/switches.
 *
 * @command saveVars
 * @text Save Variables
 * @desc Save all registered game variables.
 * 
 * @command saveSwitches
 * @text Save Switches
 * @desc Save all registered game switches.
 * 
 * @command saveSelfSwitches
 * @text Save Self Switches
 * @desc Save all registered game self switches.
 * 
 * 
 * @command saveSingleVar
 * @text Save Single Variable
 * @desc Save a single game variable by given variable id number.
 * 
 * @arg varId
 * @text ID
 * @type variable
 * @default 1
 * @min 1
 * @desc The id number of the game variable you want to save.
 * 
 * @command saveSingleSwitch
 * @text Save Single Switch
 * @desc Save a single game switch by given variable id number.
 * 
 * @arg switchId
 * @text ID
 * @type switch
 * @default 1
 * @min 1
 * @desc The id number of the game switch you want to save.
 * 
 * @command saveSingleSelfSwitch
 * @text Save Single Self Switch
 * @desc Save a single game switch by given variable id number.
 * 
 * @arg selfSW_id
 * @text ID
 * @type struct<SelfSwitch>
 * @default "{"mapId":"1","eventId":"1","switchId":"A"}"
 * 
 * @param IMPORT_AS_MODULE
 * @text Import as Module
 * @type boolean
 * @default true
 * 
 * @help 
 * 
 * You can use this plugin to persist certain game variables switches or self switches
 * in order to make achievements or a rouge like game.
 * 
 * Released under the MIT License.
 */
/*~struct~SelfSwitch:
 * @param mapId
 * @type number
 * @default 1
 * @min 1
 * 
 * @param eventId
 * @type number
 * @default 1
 * @min 1
 * 
 * @param switchId
 * @type string
 * @default A
 */

await window.loadPluginJs('DdmDraegonisPersistedData')