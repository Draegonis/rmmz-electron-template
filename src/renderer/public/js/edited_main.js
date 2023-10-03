//=============================================================================
// Custom main.js
//=============================================================================

const effekseerWasmUrl = "js/libs/effekseer.wasm";

// EDIT: Removed a lot of un-needed code, since most of it is done before
// this is added to the index.html.

class Main {
  constructor() {}

  run() {
    this.initEffekseerRuntime();
  }

  initEffekseerRuntime() {
    const onLoad = this.onEffekseerLoad.bind(this);
    const onError = this.onEffekseerError.bind(this);
    effekseer.initRuntime(effekseerWasmUrl, onLoad, onError);
  }

  onEffekseerLoad() {
    SceneManager.run(Scene_Boot);
  }

  onEffekseerError() {
    throw new Error('Failed to load effekseer.wasm.')
  }
}

const main = new Main();
main.run();

//-----------------------------------------------------------------------------
