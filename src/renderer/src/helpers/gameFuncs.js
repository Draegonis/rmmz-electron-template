/**
 * Similar to a foreach loop with a callback on each iteration.
 * @param {number} first the first number in the for loop.
 * @param {number} last the last number in the for loop
 * @param {function} callback the callback to be used on each number from
 * the first to the last.
 */
const forEachRange = function (first, last, callback) {
  for (let num = first; num <= last; num++) {
    callback(num)
  }
}
/**
 * @description A function used to verify if the id number
 * for $gameVariables is valid and is initialized.
 * @param {number} id The id number of the game variable.
 * @returns {boolean} Returns true if passed verification.
 */
export const verifyGameVariable = function (id) {
  return (
    window.$gameSwitches && window.$dataSystem && id > 0 && id < window.$dataSystem.variables.length
  )
}
/**
 * @description A function used to verify if the id number
 * for $gameSwitches is valid and is initialized.
 * @param {number} id The id number of the game switch.
 * @returns {boolean} Returns true if passed verification.
 */
export const verifyGameSwitch = function (id) {
  return (
    window.$gameSwitches && window.$dataSystem && id > 0 && id < window.$dataSystem.switches.length
  )
}
/**
 * @description Method that wraps the $gameSelfSwitches.setValue but called
 * for a range of event id of the map.
 * @param {[number, number]} range - first number, last number of the range.
 * @param {[number, string]} key - an array containing mapId, and switchId.
 * Ex: [4, 'B']. The eventIds are supplied by the range.
 * @param {boolean} newValue - the new boolean value of all the self switches.
 */
export const setSelfSwitchByRange = function (key, range, newValue) {
  const [mapId, switchId] = key
  forEachRange(...range, function (num) {
    setSelfSwitch(mapId, num, switchId, newValue)
  })
}
/**
 * @description Method that wraps the $gameSwitches.setValue for a range
 * ids to the same new value.
 * @param {[number, number]} range - first number, last number of the range.
 * @param {boolean} newValue - the new boolean value for all the switches.
 */
export const setSwitchesByRange = function (range, newValue) {
  forEachRange(...range, function (num) {
    setSwitch(num, newValue)
  })
}
/**
 * @description Method that wraps the $gameVariables.setValue for a range
 * ids to the same new value.
 * @param {[number, number]} range - first number, last number of the range.
 * @param {any} newValue - the new value to set to all the ids.
 */
export const setVariablesByRange = function (range, newValue) {
  forEachRange(...range, function (num) {
    setVariable(num, newValue)
  })
}
/**
 * @description A function wrapper for $gameSwitches.setValue.
 * @param {number} switchId - the switch id to set the value to.
 * @param {boolean} newValue - the new value for the switch.
 */
export const setSwitch = function (switchId, newValue) {
  if (verifyGameSwitch(switchId)) {
    window.$gameSwitches.setValue(switchId, newValue)
  }
}
/**
 * @description A function wrapper for $gameVariables.setValue.
 * @param {number} variableId - the switch id to set the value to.
 * @param {any} newValue - the new value for the switch.
 */
export const setVariable = function (variableId, newValue) {
  if (verifyGameVariable(variableId)) {
    window.$gameVariables.setValue(variableId, newValue)
  }
}
/**
 * A function wrapper on $gameSelfSwitches.
 * @param {[number, number, string]} key - an array containing mapId, eventId, and switchId.
 * Ex: [40, 35, 'A']
 * @param {boolean} newValue - the new boolean value of the switch.
 */
export const setSelfSwitch = function (key, newValue) {
  if (window.$gameSelfSwitches) window.$gameSelfSwitches.setValue(key, newValue)
}
/**
 * @description Method that wraps the $gameSelfSwitches.value but called
 * for a range of event ids of the map.
 * @param {[number, number]} range - first number, last number of the range.
 * @param {[number, string]} key - an array containing mapId, and switchId.
 * Ex: [77, 'C']. The eventIds are supplied by the range.
 * @returns {{ [number]: any | null }} a dictionary of eventId: switchId values.
 */
export const getSelfSwitchByRange = function (key, range) {
  const [mapId, switchId] = key
  const collector = {}
  forEachRange(...range, function (num) {
    getSelfSwitch(`${mapId}, ${num}, ${switchId.toUpperCase()}`)
  })
  return collector
}
/**
 * @description Method that wraps the $gameSwitches.value for a range
 * ids.
 * @param {[number, number]} range - first number, last number of the range.
 * @return { { [number]: boolean | null } } A dictionary of switchId: boolean or null
 * if not found.
 */
export const getSwitchesByRange = function (range) {
  const collector = {}
  forEachRange(...range, function (num) {
    collector[num] = getSwitch(num)
  })
  return collector
}
/**
 * @description Method that wraps the $gameSwitches.value for a range
 * ids.
 * @param {[number, number]} range - first number, last number of the range.
 * @return { { [number]: any | any[] | null } } A dictionary of variableId: any value,
 * null if not found.
 */
export const getVariablesByRange = function (range) {
  const collector = {}
  forEachRange(...range, function (num) {
    collector[num] = getVariable(num)
  })
  return collector
}
/**
 * A function wrapper on $gameSwitches.value.
 * @param {number} switchId - the switch id number to get the value of.
 * @returns {boolean | null} - a boolean or null if the value is not found.
 */
export const getSwitch = function (switchId) {
  let switchBoolean = null
  if (verifyGameSwitch(switchId)) {
    switchBoolean = window.$gameSwitches.value(switchId)
  }
  return switchBoolean
}
/**
 * A function wrapper on $gameVariable.value.
 * @param {number} variableId - the id number of the variable to get
 * @returns {any | any[] | null} - the value of the gameVariable or null if not found.
 */
export const getVariable = function (variableId) {
  let variableValue = null
  if (verifyGameVariable(variableId)) {
    variableValue = window.$gameVariables.value(variableId)
  }
  return variableValue
}
/**
 * A function wrapper on $gameSelfSwitches.value.
 * @param {[number, number, string]} key - an array containing mapId, eventId, and switchId.
 * Ex: [44, 33, 'D']
 * @returns {any | null} the value of the selfSwitch or null if not found.
 */
export const getSelfSwitch = function (key) {
  let selfSwitch = null
  if (window.$gameSelfSwitches) {
    selfSwitch = window.$gameSelfSwitches.value(key)
  }
  return selfSwitch
}

// Collect all the same types of functions into a dictionary for variable access.
// Ex: setGameVars[varType]
export const setGameVars = {
  var: setVariable,
  switch: setSwitch,
  selfSW: setSelfSwitch
}
export const setGameVarsByRange = {
  var: setVariablesByRange,
  switch: setSwitchesByRange,
  selfSW: setSelfSwitchByRange
}
export const getGameVars = {
  var: getVariable,
  switch: getSwitch,
  selfSW: getSelfSwitch
}
export const getGameVarsByRange = {
  var: getVariablesByRange,
  switch: getSwitchesByRange,
  selfSW: getSelfSwitchByRange
}
