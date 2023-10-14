export const parseSelfSW = (id) => {
  const newId = JSON.parse(id)
  return [Number(newId.mapId || -1), Number(newId.eventId || -1), newId.switchId.toUpperCase()]
}

export const parseNumber = (value, min) => Number(value || min ? min : -1)

export const parseBoolean = (value) => value.toLowerCase() === 'true'
