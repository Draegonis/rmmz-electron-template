/*:
 * @target MZ
 * @plugindesc A plugin that adds a manager to handle time based nodes.
 * @author DdmDraegonis
 * @url https://github.com/Draegonis/rmmz-electron-template
 * 
 * @param settings
 * @text Settings
 *
 * @param secondsPerTick
 * @text Seconds Per Game Tick
 * @desc The amount of seconds until the node manager increments the game tick.
 * @type number
 * @default 60
 * @min 10
 * @parent settings
 *
 * @command switch_Event
 * @text Switch Event
 * @desc Schedule an update of a game switch.
 *
 * @arg id
 * @text ID
 * @type string
 * @default Unique ID
 * @desc The unique ID of the event.
 *
 * @arg tick
 * @text Tick
 * @type number
 * @default 1
 * @min 1
 * @desc The amount of ticks before the event is executed.
 *
 * @arg isTrackable
 * @text Is Trackable
 * @type boolean
 * @default false
 * @desc Is the event trackable, added to an object that keeps record and all trackable events.
 *
 * @arg switchId
 * @text Switch Id
 * @type switch
 * @default 1
 * @min 1
 * @desc The game switch to change the value of.
 *
 * @arg newValue
 * @text New Value
 * @type boolean
 * @default false
 * @desc The new value of the game switch.
 *
 * @command variable_Event
 * @text Variable Event
 * @desc Schedule an update of a game variable, it will go with the first new value given.
 *
 * @arg id
 * @text ID
 * @type string
 * @default Unique ID
 * @desc The unique ID of the event.
 *
 * @arg tick
 * @text Tick
 * @type number
 * @default 1
 * @min 1
 * @desc The amount of ticks before the event is executed.
 *
 * @arg isTrackable
 * @text Is Trackable
 * @type boolean
 * @default false
 * @desc Is the event trackable, added to an object that keeps record and all trackable events.
 *
 * @arg variableId
 * @text Variable Id
 * @type variable
 * @default 1
 * @min 1
 * @desc The game variable to change the value of.
 *
 * @arg newNumber
 * @text New Number Value
 * @type number
 * @desc The new number value of the game variable.
 *
 * @arg newNumberArray
 * @text New Number Array
 * @type number[]
 * @desc The new number array value of the game variable.
 *
 * @arg newString
 * @text New String
 * @type string
 * @desc The new string value of the game variable.
 *
 * @arg newStringArray
 * @text New String Array
 * @type string[]
 * @desc The new string array value of the game variable.
 *
 * @command selfSW_Event
 * @text Self Switch Event
 * @desc Schedule an update of a self switch.
 *
 * @arg id
 * @text ID
 * @type string
 * @default Unique ID
 * @desc The unique ID of the event.
 *
 * @arg tick
 * @text Tick
 * @type number
 * @default 1
 * @min 1
 * @desc The amount of ticks before the event is executed.
 *
 * @arg isTrackable
 * @text Is Trackable
 * @type boolean
 * @default false
 * @desc Is the event trackable, added to an object that keeps record and all trackable events.
 *
 * @arg key
 * @text Self Switch Key
 * @type struct<SelfSwitch>
 * @default "{"mapId":"1","eventId":"1","switchId":"A"}"
 * @desc The information needed to change the self switch value.
 *
 * @command start
 * @text Start Node Tick
 * @desc Start the Node Tick, it will resume to the closest second round down.
 *
 * @command stop
 * @text Stop Node Tick
 * @desc Stop the Node Tick from running, no scheduled events will be updated/consumed.
 *
 * @command resumeTick
 * @text Resume Tick
 * @desc Resumes the time tick.
 *
 * @command pauseTick
 * @text Pause Tick
 * @desc Pauses the time tick.
 *
 * @command clearEvents
 * @text Force Clear Events
 * @desc Force a clear of all current scheduled events.
 * 
 * @param IMPORT_AS_MODULE
 * @text Import as Module
 * @type boolean
 * @default true
 * 
 * @help 
 * 
 * This plugin is add a time based node system into the game. 
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

await window.loadPluginJs('DdmDraegonisNodeManager')