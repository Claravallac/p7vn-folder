const { app, BrowserWindow, desktopCapturer, session } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: false,
    resizable: false,
    frame: true,
    title: 'Volkenburt — O Gatinho da Gravata',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
      // tenta pegar a janela do jogo pelo título
      const gameWindow = sources.find(s =>
        s.name.includes('Gatinho') || s.name.includes('Volkenburt')
      ) || sources.find(s => s.id.startsWith('window:'))
        || sources[0]
      callback({ video: gameWindow, audio: 'loopback' })
    }).catch(() => callback({}))
  })

  win.loadFile('teaser_gatinho.html')
  win.setMenuBarVisibility(false)
})

app.on('window-all-closed', () => app.quit())