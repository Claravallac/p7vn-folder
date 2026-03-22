const { app, BrowserWindow } = require('electron')
const path = require('path')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: false,
    resizable: true,
    frame: true,
    title: 'Volkenburt — O Capacete da Sorte',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  win.loadFile('teaser.html')
  win.setMenuBarVisibility(false)
})

app.on('window-all-closed', () => app.quit())
