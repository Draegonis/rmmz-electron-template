export const parseSelfSW = (id) => {
  const newId = JSON.parse(id)
  return [
    parseNumber(newId.mapId, -1),
    parseNumber(newId.eventId, -1),
    newId.switchId.toUpperCase()
  ]
}

export const parseNumber = (value, min) => {
  let num = undefined
  num = Number(value)
  if (!num) num = min ? min : -1
  return num
}
export const parseBoolean = (value) => value.toLowerCase() === 'true'
