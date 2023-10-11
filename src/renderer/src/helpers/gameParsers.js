export const parseSelfSW = (id) => {
  const newId = JSON.parse(id)
  return [Number(newId.mapId || -1), Number(newId.eventId || -1), newId.switchId.toUpperCase()]
}

export const parseNumber = (value) => Number(value || -1)
