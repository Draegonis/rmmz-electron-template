import { WebAudio } from '../../rmmz_core'

// EDIT: Removed mobile check.
WebAudio._shouldMuteOnHide = function () {
  return !window.navigator.standalone
}

export { WebAudio }
