'use strict'
const pluginName = 'EffekseerForRPGMakerMZ_Ex'

const paramInstanceMaxCount = Number(
  window.PluginManager.parameters(pluginName)['InstanceMaxCount']
)
const paramSquareMaxCount = Number(window.PluginManager.parameters(pluginName)['SquareMaxCount'])
const isDistortionEnabled =
  window.PluginManager.parameters(pluginName)['DistortionEnabled'] != 'false'

window.Graphics._createEffekseerContext = function () {
  if (this._app && window.effekseer) {
    try {
      const actualInstanceMaxCount = paramInstanceMaxCount ? paramInstanceMaxCount : 10000
      const actualSquareMaxCount = paramSquareMaxCount ? paramSquareMaxCount : 10000

      this._effekseer = window.effekseer.createContext()
      if (this._effekseer) {
        this._effekseer.init(this._app.renderer.gl, {
          instanceMaxCount: actualInstanceMaxCount,
          squareMaxCount: actualSquareMaxCount
        })
      }

      // restore OpenGL states with pixi.js functions
      this._effekseer.setRestorationOfStatesFlag(false)
    } catch (e) {
      this._app = null
    }
  }
}

window.Sprite_Animation.prototype.onAfterRender = function (renderer) {
  renderer.texture.reset()
  renderer.geometry.reset()
  renderer.state.reset()
  renderer.shader.reset()
  renderer.framebuffer.reset()
}

if (isDistortionEnabled) {
  window.Sprite_Animation.prototype.setProjectionMatrix = function (renderer) {
    const x = ((this._mirror ? -1 : 1) * renderer.view.height) / renderer.view.width
    const y = -1
    // prettier-ignore
    window.Graphics.effekseer.setProjectionMatrix([
                  x, 0, 0, 0,
                  0, y, 0, 0,
                  0, 0, -0.01, 0,
                  0, 0, 0, 10,
              ]);
  }

  window.Sprite_Animation.prototype.setCameraMatrix = function (/*renderer*/) {
    // prettier-ignore
    window.Graphics.effekseer.setCameraMatrix([
                  1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, -10, 1
              ]);
  }

  window.Sprite_Animation.prototype.setViewport = function (renderer) {
    const halfW = renderer.view.width / 2
    const pos = this.targetPosition(renderer)
    const vx = this._animation.offsetX
    const vy = this._animation.offsetY
    const x = this._mirror ? -(pos.x - vx - halfW) + halfW : pos.x + vx
    this._handle.setLocation(
      ((x - renderer.view.width / 2.0) / (renderer.view.height / 2.0)) * 10.0,
      -(((pos.y + vy) / renderer.view.height) * 2.0 - 1.0) * 10.0,
      0
    )
    renderer.gl.viewport(0, 0, renderer.view.width, renderer.view.height)
  }

  window.Sprite_Animation.prototype.updateEffectGeometry = function () {}

  window.Sprite_Animation.prototype.updateEffectGeometryOnRender = function () {
    const scale = this._animation.scale / 100
    const r = Math.PI / 180
    const rx = this._animation.rotation.x * r
    const ry = this._animation.rotation.y * r
    const rz = this._animation.rotation.z * r
    if (this._handle) {
      this._handle.setLocation(0, 0, 0)
      this._handle.setRotation(rx, ry, rz)
      this._handle.setScale(scale, scale, scale)
      this._handle.setSpeed(this._animation.speed / 100)
    }
  }

  window.Graphics._onTick = function (deltaTime) {
    this._fpsCounter.startTick()
    if (this._tickHandler) {
      this._tickHandler(deltaTime)
    }
    if (this._canRender()) {
      this.isBackgroundCaptured = false
      this._app.render()
    }
    this._fpsCounter.endTick()
  }

  window.Sprite_Animation.prototype._render = function (renderer) {
    this.updateEffectGeometryOnRender()

    if (this._targets.length > 0 && this._handle && this._handle.exists) {
      this.onBeforeRender(renderer)

      // for before 1.33
      if (this.saveViewport) {
        this.saveViewport(renderer)
      }

      this.setProjectionMatrix(renderer)
      this.setCameraMatrix(renderer)
      this.setViewport(renderer)
      if (!this.isBackgroundCaptured) {
        window.Graphics.effekseer.captureBackground(0, 0, renderer.view.width, renderer.view.height)
        this.isBackgroundCaptured = true
      }
      window.Graphics.effekseer.beginDraw()
      window.Graphics.effekseer.drawHandle(this._handle)
      window.Graphics.effekseer.endDraw()
      this.resetViewport(renderer)
      this.onAfterRender(renderer)
    }
  }
}
