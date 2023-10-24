import * as PIXI from 'pixi.js'

// See if main.js is already on the dom.
const isScriptLoaded = document.getElementById('RmmzMain')

// Add pixi.js node package to window object.
window.PIXI = PIXI

if (!isScriptLoaded) {
  const { ...RMMZ } = await import(`../rmmz/index.js`)
  Object.entries(RMMZ).forEach(([key, value]) => {
    window[key] = value
  })
}

// Function to load plugin modules. See README.md on how to setup a plugin.
window.loadPluginJs = async function (pluginName) {
  await import(`../plugins/${pluginName}.js`)
}

//Add the two libs and plugin.js to the index.html. These cannot be imported as modules.
//Setup the plugins, then when finished add main.js and it will run onWindowLoad, since
//the window is already loaded and won't fire normally.
const scriptUrls = [
  '../js/libs/effekseer.min.js',
  '../js/libs/vorbisdecoder.js',
  '../js/plugins.js'
]
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

// Fix for vite hot-reloading, it will try to add the scripts onto
// the html even though they are still there.
let injectedScripts = false

const injectRmmzScripts = () => {
  if (!isScriptLoaded) {
    loadScript()
  }

  injectedScripts = true
}

const RMMZinject = () => {
  if (!injectedScripts) {
    injectRmmzScripts()
  }
  return null
}

export { RMMZinject }
