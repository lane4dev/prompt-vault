import { BrowserWindow } from 'electron'
import { join } from 'node:path'

import { createWindow } from 'lib/electron-app/factories/windows/create'
import { ENVIRONMENT } from 'shared/constants'
import { displayName } from '~/package.json'
import { loadWindowState, saveWindowState } from '../windowState'

export async function MainWindow() {
  const savedState = loadWindowState()
  const defaults = {
    width: 1200,
    height: 800,
  }

  const window = createWindow({
    id: 'main',
    title: displayName,
    width: savedState?.width || defaults.width,
    height: savedState?.height || defaults.height,
    x: savedState?.x,
    y: savedState?.y,
    minWidth: 1000,
    minHeight: 600,
    show: false,
    center: !savedState, // Only center if no saved state
    movable: true,
    resizable: true,
    alwaysOnTop: false,
    autoHideMenuBar: true,

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
    },
  })

  window.webContents.on('did-finish-load', () => {
    if (ENVIRONMENT.IS_DEV) {
      window.webContents.openDevTools({ mode: 'detach' })
    }

    window.show()
  })

  window.on('close', () => {
    // Save state before closing
    const bounds = window.getBounds()
    saveWindowState(bounds)

    for (const window of BrowserWindow.getAllWindows()) {
      window.destroy()
    }
  })

  return window
}
