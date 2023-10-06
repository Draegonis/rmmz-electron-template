import { PluginManager } from '../../rmmz_managers'
// Edited
import { Utils } from '../editsIndex'

PluginManager.setup = function (plugins) {
  for (const plugin of plugins) {
    const pluginName = Utils.extractFileName(plugin.name)
    if (plugin.status && !this._scripts.includes(pluginName)) {
      this.setParameters(pluginName, plugin.parameters)
      // EDIT: to allow imports as modules for top level await.
      this.loadScript(plugin.name, plugin.parameters.IMPORT_AS_MODULE)
      this._scripts.push(pluginName)
    }
  }
}

// EDIT: to allow imports as modules for top level await.
PluginManager.loadScript = function (filename, moduleImport) {
  const importType = moduleImport === 'true' ? 'module' : 'text/javascript'

  const url = this.makeUrl(filename)
  const script = document.createElement('script')
  script.type = importType
  script.src = url
  script.async = false
  script.defer = true
  script.onerror = this.onError.bind(this)
  script._url = url
  document.body.appendChild(script)
}

export { PluginManager }
