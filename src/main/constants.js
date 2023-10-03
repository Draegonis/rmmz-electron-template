import { app } from 'electron'

export const APP_NAME = process.env.npm_package_productName

// Set App Data Folder for saving config and save games.
const appDataPath = app.getPath('appData')
app.setPath('userData', appDataPath + `/${APP_NAME}`)
export const SAVEPATH = `${app.getPath('userData')}/`
