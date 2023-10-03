/*
JsExtensions taken out of rmmz_core.js.
*/

/**
 * This section contains some methods that will be added to the standard
 * Javascript objects.
 *
 * @namespace JsExtensions
 */

/**
 * Makes a shallow copy of the array.
 *
 * @memberof JsExtensions
 * @returns {array} A shallow copy of the array.
 */
Array.prototype.clone = function () {
  return this.slice(0)
}

Object.defineProperty(Array.prototype, 'clone', {
  enumerable: false
})

/**
 * Checks whether the array contains a given element.
 *
 * @memberof JsExtensions
 * @param {any} element - The element to search for.
 * @returns {boolean} True if the array contains a given element.
 * @deprecated includes() should be used instead.
 */
Array.prototype.contains = function (element) {
  return this.includes(element)
}

Object.defineProperty(Array.prototype, 'contains', {
  enumerable: false
})

/**
 * Checks whether the two arrays are the same.
 *
 * @memberof JsExtensions
 * @param {array} array - The array to compare to.
 * @returns {boolean} True if the two arrays are the same.
 */
Array.prototype.equals = function (array) {
  if (!array || this.length !== array.length) {
    return false
  }
  for (let i = 0; i < this.length; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i])) {
        return false
      }
    } else if (this[i] !== array[i]) {
      return false
    }
  }
  return true
}

Object.defineProperty(Array.prototype, 'equals', {
  enumerable: false
})

/**
 * Removes a given element from the array (in place).
 *
 * @memberof JsExtensions
 * @param {any} element - The element to remove.
 * @returns {array} The array after remove.
 */
Array.prototype.remove = function (element) {
  for (;;) {
    const index = this.indexOf(element)
    if (index >= 0) {
      this.splice(index, 1)
    } else {
      return this
    }
  }
}

Object.defineProperty(Array.prototype, 'remove', {
  enumerable: false
})

/**
 * Generates a random integer in the range (0, max-1).
 *
 * @memberof JsExtensions
 * @param {number} max - The upper boundary (excluded).
 * @returns {number} A random integer.
 */
Math.randomInt = function (max) {
  return Math.floor(max * Math.random())
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * @memberof JsExtensions
 * @param {number} min - The lower boundary.
 * @param {number} max - The upper boundary.
 * @returns {number} A number in the range (min, max).
 */
Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max)
}

/**
 * Returns a modulo value which is always positive.
 *
 * @memberof JsExtensions
 * @param {number} n - The divisor.
 * @returns {number} A modulo value.
 */
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n
}

/**
 * Makes a number string with leading zeros.
 *
 * @memberof JsExtensions
 * @param {number} length - The length of the output string.
 * @returns {string} A string with leading zeros.
 */
Number.prototype.padZero = function (length) {
  return String(this).padZero(length)
}

/**
 * Checks whether the string contains a given string.
 *
 * @memberof JsExtensions
 * @param {string} string - The string to search for.
 * @returns {boolean} True if the string contains a given string.
 * @deprecated includes() should be used instead.
 */
String.prototype.contains = function (string) {
  return this.includes(string)
}

/**
 * Replaces %1, %2 and so on in the string to the arguments.
 *
 * @memberof JsExtensions
 * @param {any} ...args The objects to format.
 * @returns {string} A formatted string.
 */
String.prototype.format = function () {
  return this.replace(/%([0-9]+)/g, (s, n) => arguments[Number(n) - 1])
}

/**
 * Makes a number string with leading zeros.
 *
 * @memberof JsExtensions
 * @param {number} length - The length of the output string.
 * @returns {string} A string with leading zeros.
 */
String.prototype.padZero = function (length) {
  return this.padStart(length, '0')
}

//-----------------------------------------------------------------------------

// Make an errorPrinter before the main scripts will load.
const makeErrorHtml = (name, message, error) => {
  const nameDiv = document.createElement('div')
  const messageDiv = document.createElement('div')
  nameDiv.id = 'errorName'
  messageDiv.id = 'errorMessage'
  nameDiv.innerHTML = name
  messageDiv.innerHTML = message

  const stackDiv = document.createElement('div')
  stackDiv.id = 'errorStack'
  let stackText = ''

  if (error) {
    error?.stack.split(/\r?\n/).forEach((text, index) => {
      if (index > 0) {
        const atFunc = text.match(/at\s[A-Za-z_.]+\s/)
        const atScript = text.match(/[A-Za-z_]+\.js:[0-9]+:[0-9]+/)

        if (atFunc) {
          if (atScript) {
            stackText += atFunc[0] + ` (${atScript[0]})` + '.<br/>'
          } else {
            // WIP: some rare error.
            console.log(error.stack)
            stackText += atFunc[0] + '.<br/>'
          }
        } else if (atScript) {
          stackText += `at ${atScript[0]}` + '.<br/>'
        }
      }
    })
  }

  stackDiv.innerHTML = stackText

  return nameDiv.outerHTML + messageDiv.outerHTML + stackDiv.outerHTML
}

const printError = (name, message, error) => {
  let errorPrinter = document.getElementById('errorPrinter')
  if (!errorPrinter) {
    errorPrinter = document.createElement('div')
    errorPrinter.id = 'errorPrinter'
    errorPrinter.innerHTML = makeErrorHtml(name, message, error)
    document.body.appendChild(errorPrinter)
  } else {
    // Show the first error only.
    if (
      errorPrinter.innerHTML ===
      '<div id="errorName"></div><div id="errorMessage"></div><div id="errorStack"></div>'
    ) {
      errorPrinter.innerHTML = makeErrorHtml(name, message, error)
      errorPrinter.style.border = 'solid red'
      errorPrinter.style.backgroundColor = 'black'
    }
    window.Graphics.endLoading()
  }
}

window.addEventListener('error', (e) => {
  const { message } = e.error
  printError('An error occurred: ', message, e.error)
  window.stop()
})
