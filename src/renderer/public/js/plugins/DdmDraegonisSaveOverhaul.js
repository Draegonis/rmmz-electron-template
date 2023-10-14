/*:
 * @target MZ
 * @plugindesc A plugin to change the Save system to a more modern way.
 * @author DdmDraegonis
 * @url https://github.com/Draegonis/rmmz-electron-template
 * 
 * @param enable_Autosave
 * @text Enable Autosave
 * @type boolean
 * @default true
 * @desc This overwrites the $gameSystem.isAutosaveEnabled. The new system reads this before $gameSystem exists.
 * 
 * @param enable_Quicksave
 * @text Enable Quicksave
 * @type boolean
 * @default true
 * @desc This will allow quick saving functionality.
 * 
 * @param enable_Hardsave
 * @text Enable Hardsave
 * @type boolean
 * @default true
 * @desc This will allow players to save normally.
 * 
 * @param allowOverwrites
 * @text Allow Overwrites
 * @type boolean
 * @default false
 * @desc This will allow autosaves and quicksaves to be overwriten when in Scene_Save.
 * 
 * @param maxAutosaves
 * @text Max Autosaves
 * @type number
 * @default 5
 * @min 1
 * @desc The max number of autosaves allowed.
 * 
 * @param maxQuicksaves
 * @text Max Quicksaves
 * @type number
 * @default 5
 * @min 1
 * @desc The max number of quicksaves allowed.
 * 
 * @param maxHardsaves
 * @text Max Hardsaves
 * @type number
 * @default 20
 * @min 1
 * @desc The max number of hardsaves allowed.
 * 
 * @command triggerAutosave
 * @text Trigger Autosave
 * @desc Saves an autosave, can only be used on map scenes.
 * 
 * @param IMPORT_AS_MODULE
 * @text Import as Module
 * @type boolean
 * @default true
 * 
 * @help 
 * 
 * This plugin is to change the save system so the most recent save is always at the top of the list.
 * 
 * It allows for a set number of autosaves that will be cycled through when it saves. Those autosaves
 * can't be overwriten when manually saving.
 * 
 * Released under the MIT License.
 */

await window.loadPluginJs('DdmDraegonisSaveOverhaul')