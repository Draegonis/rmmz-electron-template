import * as PIXI from 'pixi.js'

/**
 * See if main.js is already on the dom.
 */
const isScriptLoaded = document.getElementById('RmmzMain')

/**
 * Add pixi.js node package to window object.
 */
window.PIXI = PIXI

if (!isScriptLoaded) {
  /**
   * Adds the rmmz classes onto the window object.
   */
  const { ...RMMZ } = await import(`../rmmz/index.js`)
  Object.entries(RMMZ).forEach(([key, value]) => {
    window[key] = value
  })
}

/**
 * Function to load plugin modules. See README.md on how to setup a plugin.
 * @param {string} pluginName the name of the plugin within src/plugins.
 */
window.loadPluginJs = async function (pluginName) {
  await import(`../plugins/${pluginName}.js`)
}

/**
 * Add the two libs and plugin.js to the index.html.
 * These cannot be imported as modules.
 * Setup the plugins, then when finished add main.js and it will run onWindowLoad,
 * since the window is already loaded and won't fire normally.
 */
const scriptUrls = [
  '../js/libs/effekseer.min.js',
  '../js/libs/vorbisdecoder.js',
  '../js/plugins.js'
]
/**
 * The count to keep track of when to add the main.js file to dom.
 */
let scriptCount = 0

const loadScript = () => {
  for (const url of scriptUrls) {
    const script = document.createElement('script')
    script.src = url
    script.type = 'text/javascript'
    script.defer = true

    script.onload = () => {
      if (++scriptCount === 3) {
        window.PluginManager.setup(window.$plugins)
        const main = document.createElement('script')
        main.src = '../js/edited_main.js'
        main.type = 'text/javascript'
        main.defer = true
        main.id = 'RmmzMain'
        document.body.appendChild(main)
      }
    }

    document.body.appendChild(script)
  }
}

/**
 * Fix for vite hot-reloading, it will try to add the scripts onto the html even though they are still there.
 * Vite hot-reloading is still good when changing the react side, but not so much with the rmmz side. Will
 * need to look into maybe detecting a reload and removing everything from the dom and re-adding.
 */
let injectedScripts = false

const injectRmmzScripts = () => {
  if (!isScriptLoaded) {
    loadScript()
  }

  injectedScripts = true
}

/**
 * A react component that will add the rmmz classes when it gets loaded in main.jsx.
 * @returns {null}
 */
const RMMZinject = () => {
  if (!injectedScripts) {
    injectRmmzScripts()
  }
  return null
}

export { RMMZinject }
