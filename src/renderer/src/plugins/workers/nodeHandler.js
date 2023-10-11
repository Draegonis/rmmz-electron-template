export {}

/**
 * Takes the data that was sent from the renderer thread and performs the needed
 * operations on it then returns it.
 */
onmessage = ({ data }) => {
  const eventTracked = {}
  const eventsToFire = []

  const newData = data.filter((eventData) => {
    const { tick, isTrackable } = eventData
    const newTick = tick - 1

    if (isTrackable) {
      eventTracked[eventData.id] = newTick
    }
    if (newTick === 0) {
      eventsToFire.push(eventData)
    }

    if (tick > 1) {
      eventData.tick = newTick
      return eventData
    }
  })

  /**
   * Returns the updated events as newEvents, the eventsToFire as the array of objects to perform game updates,
   * and the newly added items into the eventTracked object.
   */
  self.postMessage({
    eventsToFire,
    newEvents: newData,
    newTracked: eventTracked
  })
}
