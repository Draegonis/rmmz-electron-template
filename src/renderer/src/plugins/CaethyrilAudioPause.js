'use strict'

let isActive = true

const SHOULD_LOOP = Symbol()

const getAudioContext = function () {
  return window.WebAudio._context
}

const pauseAudio = function (context, active) {
  if (active) context.resume()
  else context.suspend()
}

const updateActive = function () {
  pauseAudio(getAudioContext(), isActive)
}

const onAudioEnd = function (index) {
  if (this[SHOULD_LOOP]) {
    // This is the original onended event handler, for encrypted audio loops.
    this._createSourceNode(index)
    this._startSourceNode(index)
  } else {
    // This replaces the original setTimeout method
    // so that end timers trigger when they are supposed to.
    const endTime = this._startTime + this._totalTime / this._pitch
    if (window.WebAudio._currentTime() >= endTime) this.stop()
  }
}

// Also update the audio's "active" status.
const alias = window.SceneManager.updateScene
window.SceneManager.updateScene = function () {
  const active = this.isGameActive()
  if (isActive !== active) {
    isActive = active
    updateActive()
  }
  alias.apply(this, arguments)
}

// This flag determines the behaviour of onAudioEnd.
window.WebAudio.prototype._startSourceNode = function (index) {
  delete this[SHOULD_LOOP]
  const sourceNode = this._sourceNodes[index]
  const seekPos = this.seek()
  const currentTime = window.WebAudio._currentTime()
  const loop = this._loop
  const loopStart = this._loopStartTime
  const loopLength = this._loopLengthTime
  const loopEnd = loopStart + loopLength
  const pitch = this._pitch
  let chunkStart = 0
  for (let i = 0; i < index; i++) {
    chunkStart += this._buffers[i].duration
  }
  const chunkEnd = chunkStart + sourceNode.buffer.duration
  let when = 0
  let offset = 0
  let duration = sourceNode.buffer.duration
  if (seekPos >= chunkStart && seekPos < chunkEnd - 0.01) {
    when = currentTime
    offset = seekPos - chunkStart
  } else {
    when = currentTime + (chunkStart - seekPos) / pitch
    offset = 0
    if (loop) {
      if (when < currentTime - 0.01) {
        when += loopLength / pitch
      }
      if (seekPos >= loopStart && chunkStart < loopStart) {
        when += (loopStart - chunkStart) / pitch
        offset = loopStart - chunkStart
      }
    }
  }
  if (loop && loopEnd < chunkEnd) {
    duration = loopEnd - chunkStart - offset
  }
  if (this._shouldUseDecoder()) {
    if (when >= currentTime && offset < duration) {
      sourceNode.loop = false
      sourceNode.start(when, offset, duration)
      if (loop && chunkEnd > loopStart) {
        this[SHOULD_LOOP] = true
        sourceNode.onended = onAudioEnd.bind(this)
      }
    }
  } else {
    if (when >= currentTime && offset < sourceNode.buffer.duration) {
      sourceNode.start(when, offset)
    }
  }
  chunkStart += sourceNode.buffer.duration
}

window.WebAudio.prototype._createEndTimer = function () {
  if (!this._loop)
    // (Note to self: multiple source nodes are used for encrypted audio.)
    this._sourceNodes.forEach((source, n) => {
      source.onended = onAudioEnd.bind(this, n)
    }, this)
}
