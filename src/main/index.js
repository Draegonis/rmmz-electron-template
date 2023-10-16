// Electron Imports
import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { MacMenu } from './menu'
// Node Imports
import { join } from 'path'
// Storage/Saving Imports
import Store from 'electron-store'
import { strFromU8, strToU8, compressSync, decompressSync } from 'fflate'
import jetpack from 'fs-jetpack'
// DevTools
import installExtension, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS
} from 'electron-devtools-assembler'
// Constants Imports
import { APP_NAME, SAVEPATH } from './constants'

// =============================================================
//                        Settings Section
// =============================================================

// Holds rmmz config + window settings.
// Saves in the user data folder as config.json.
const store = new Store()

// Only get window settings on startup, leave the rest for ConfigManager.
let settings = store.get('settings.window')

if (!settings) {
  // The default window when there is no previous window settings.
  // The minWidth and minHeight overwrites the one set from the editor
  // for ui area and window size.
  settings = {
    fullScreen: false,
    ratio: 2.37,
    width: 1280,
    height: 540,
    minWidth: 1280,
    minHeight: 540
  }

  store.set('settings.window', settings)
}

// =============================================================
//                        Window Section
// =============================================================
// Create the browser window.

let mainWin = null

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: settings.width,
    height: settings.height,
    minWidth: settings.minWidth,
    minHeight: settings.minHeight,
    show: false,
    autoHideMenuBar: true,
    title: APP_NAME,
    titleBarStyle: 'hidden',
    devTools: !app.isPackaged,
    ...(process.platform === 'linux' ? {} : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('resized', () => {
    if (!mainWindow.isFullScreen()) {
      // Save screen size changes when not fullscreen.
      const [width, height] = mainWindow.getSize()
      settings.width = width
      settings.height = height
      store.set('settings.window', settings)
    }
  })

  if (process.platform !== 'darwin') {
    mainWindow.setMenu(null)
  } else {
    Menu.setApplicationMenu(MacMenu)
  }

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Force screen resizing to keep aspect ratio.
  mainWindow.setAspectRatio(settings.ratio)

  return mainWindow
}

// =============================================================
//                        App Section
// =============================================================

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  mainWin = createWindow()

  if (is.dev)
    installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err))
})

app.on('window-all-closed', () => {
  app.quit()
})

// =============================================================
//                        ipcMain Section
// =============================================================

// Quit App from Renderer ============
ipcMain.on('quit-game', () => {
  app.quit()
})
// ===================================

// ===================================
// Window Handling

ipcMain.on('resizeWindow', (_, [width, height, ratio]) => {
  if (mainWin) {
    mainWin.setMinimumSize(width, height)
    mainWin.setSize(width, height)
    mainWin.setAspectRatio(ratio)
  }
})

// FullScreen handling.
ipcMain.on('set-fullscreen', (_, [isFullscreen, save]) => {
  if (save) {
    store.set('settings.window.fullScreen', isFullscreen)
  }

  mainWin.setFullScreen(isFullscreen)
})

// Fetch window information on startup.
ipcMain.handle('load-window', () => {
  return settings
})

// End Window Handling
// ===================================

// ===================================
// Config Store

ipcMain.handle('load-config', () => {
  return store.get('settings')
})

ipcMain.on('save-config', (_, config) => {
  // Set the settings variable here to minWidth/minHeight.
  settings.width = config.window.minWidth
  settings.minWidth = config.window.minWidth
  settings.height = config.window.minHeight
  settings.minHeight = config.window.minHeight
  // Set the ratio as well.
  settings.ratio = config.window.ratio
  store.set('settings', config)
})

// end Config Store
// ===================================

// ===================================
// Handle Files.

ipcMain.handle('file-exists', (_, folder, fileName) => {
  const PATH = folder ? SAVEPATH + `${folder}/` + fileName : SAVEPATH + fileName
  if (jetpack.exists(PATH) === 'file') return true
  return false
})

ipcMain.handle('save-object', (_, folder, fileName, data, toCompress) => {
  try {
    const PATH = folder ? SAVEPATH + `${folder}/` + fileName : SAVEPATH + fileName
    let writeObj = undefined

    if (toCompress) {
      const str = JSON.stringify(data)
      const toCompress = strToU8(str)
      const compressed = compressSync(toCompress)
      writeObj = Buffer.from(compressed)
    } else {
      writeObj = data
    }

    if (writeObj) {
      jetpack.write(PATH, writeObj, { atomic: true })
      return true
    }
    return false
  } catch (e) {
    console.log(e)
    return false
  }
})

ipcMain.handle('read-object', (_, folder, fileName, toDecompress) => {
  const PATH = folder ? SAVEPATH + `${folder}/` + fileName : SAVEPATH + fileName
  if (jetpack.exists(PATH) === 'file') {
    try {
      if (toDecompress) {
        const buffer = jetpack.read(PATH, 'buffer')
        const toDecompress = Uint8Array.from(buffer)
        const decompressed = decompressSync(toDecompress)
        const str = strFromU8(decompressed)
        const data = JSON.parse(str)
        return data
      } else {
        const data = jetpack.read(PATH, 'json')
        return data
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }
  return false
})

// end Handle Files.
// ===================================
