/**
 * A custom parser to take in a JSON parsable self switch id and turn it into a usable key for self switches.
 * @param {string} id a JSON parsable string which contains: '{mapId, eventId, switchId}'
 * @returns {[number, number, string]}
 */
export const parseSelfSW = (id) => {
  const newId = JSON.parse(id)
  return [
    parseNumber(newId.mapId, -1),
    parseNumber(newId.eventId, -1),
    newId.switchId.toUpperCase()
  ]
}

/**
 * A simple parser to convert a string value into a usable number.
 * @param {string} value the value to attempt to convert into a number.
 * @param {number} min the failsafe number if it fails to convert the value.
 * @returns {number}
 */
export const parseNumber = (value, min) => {
  let num = undefined
  num = Number(value)
  if (!num) num = min ? min : -1
  return num
}

/**
 * A simple parser to convert a string value into a usable boolean.
 * @param {string} value the value to check if it is 'true'.
 * @returns {boolean}
 */
export const parseBoolean = (value) => value.toLowerCase() === 'true'
