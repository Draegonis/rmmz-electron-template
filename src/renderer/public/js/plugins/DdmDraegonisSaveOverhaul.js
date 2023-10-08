/*:
 * @target MZ
 * @plugindesc A plugin to change the Save system to a more modern way.
 * @author DdmDraegonis
 * @url https://github.com/Draegonis/rmmz-electron-template
 * 
 * @param enable_autosave
 * @text Enable Autosave
 * @type boolean
 * @default true
 * @desc This overwrites the $gameSystem.isAutosaveEnabled. The new system reads this before $gameSystem exists.
 * 
 * @param maxAutosaves
 * @text Max Autosaves
 * @type number
 * @default 5
 * @desc The max number of autosaves allowed.
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
 * Free to use and/or modify for any project. No credit required.
 */

await window.loadPluginJs('DdmDraegonisSaveOverhaul')