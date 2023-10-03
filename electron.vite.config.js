import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      minify: 'esbuild'
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      minify: 'esbuild'
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    build: {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Code splitting so it will load quicker.
            if (id.includes('pixi')) {
              return 'pixi'
            }
            if (id.includes('rmmz_')) {
              return 'rmmz'
            }
            if (
              id.includes('ramda') ||
              id.includes('gamepad') ||
              id.includes('fs-jetpack') ||
              id.includes('fflate')
            ) {
              return 'vendor-util'
            }
            if (id.includes('react') || id.includes('zustand') || id.includes('immer')) {
              return 'vendor-react'
            }
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
    },
    plugins: [react()]
  }
})
