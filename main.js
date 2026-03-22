const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs   = require('fs');
const { spawn } = require('child_process');

// ── Discord Rich Presence ─────────────────────────────────────────────────────
const discord = require('./discord-presence');

// ── Auto-updater ──────────────────────────────────────────────────────────────
const updater = require('./updater');

// Necessário no Windows para que o ícone apareça corretamente na barra de tarefas
if (process.platform === 'win32') {
  app.setAppUserModelId('com.himari.vrcnatstory');
}

// Salva dados do jogo em Documentos\Himari Games\saves (prod) ou Documentos\Himari Games\saves-dev (dev)
const saveFolderName = app.isPackaged ? 'saves' : 'saves-dev';
const saveDir = path.join(app.getPath('documents'), 'Himari Games', saveFolderName);
app.setPath('userData', saveDir);

// Garante que a pasta de saves existe
try { fs.mkdirSync(saveDir, { recursive: true }); } catch(e) {}

function getSavePath(key) {
  // Sanitiza o nome do arquivo
  return path.join(saveDir, key.replace(/[^a-z0-9_\-]/gi, '_') + '.json');
}

// Permite autoplay de áudio sem precisar de gesto do usuário (necessário para música do menu)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow;
let editorWindow = null;

function createEditorWindow() {
  // Se já está aberta, só traz pro foco
  if (editorWindow && !editorWindow.isDestroyed()) {
    editorWindow.focus();
    return;
  }

  editorWindow = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'Himari Editor — VRChat Story',
    icon: path.join(__dirname, 'assets/images/logo/icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#06060f'
  });

  Menu.setApplicationMenu(null);
  editorWindow.loadFile('himari-editor.html');

  editorWindow.on('closed', () => {
    editorWindow = null;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'assets/images/logo/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#000'
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile('index.html');
  mainWindow.setIcon(path.join(__dirname, 'assets/images/logo/icon.png'));
  // F12 sempre abre/fecha DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  if (app.isPackaged) {
    // Bloqueia menu de contexto (botão direito) na versão compilada
    mainWindow.webContents.on('context-menu', (e) => e.preventDefault());

    // Impede navegação para qualquer URL externa
    mainWindow.webContents.on('will-navigate', (e, url) => {
      if (!url.startsWith('file://')) e.preventDefault();
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  discord.init();
  updater.setMainWindow(mainWindow);
  // Checa atualizações 3s após a janela abrir (não atrasa o startup)
  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => updater.checkForUpdates(), 3000);
  });

  // F5 = recarregar (só em dev), F12 = DevTools (sempre)
  if (!app.isPackaged) {
    globalShortcut.register('F5', () => {
      if (mainWindow) mainWindow.reload();
    });
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Para fechar a janela quando clicar em Sair
ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('set-fullscreen', (_event, enabled) => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  mainWindow.setFullScreen(!!enabled);
  return mainWindow.isFullScreen();
});

ipcMain.handle('get-fullscreen', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  return mainWindow.isFullScreen();
});

// ── Sistema de saves via arquivo ─────────────────────────────────────────────
ipcMain.handle('save-set', (_event, key, value) => {
  try {
    fs.writeFileSync(getSavePath(key), value, 'utf8');
    return true;
  } catch(e) { return false; }
});

ipcMain.handle('save-get', (_event, key) => {
  try {
    const p = getSavePath(key);
    if (!fs.existsSync(p)) return null;
    return fs.readFileSync(p, 'utf8');
  } catch(e) { return null; }
});

ipcMain.handle('save-remove', (_event, key) => {
  try {
    const p = getSavePath(key);
    if (fs.existsSync(p)) fs.unlinkSync(p);
    return true;
  } catch(e) { return false; }
});

// Versões síncronas (usadas pelo renderer sem precisar de async/await)
ipcMain.on('save-get-sync', (event, key) => {
  try {
    const p = getSavePath(key);
    event.returnValue = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  } catch(e) { event.returnValue = null; }
});

ipcMain.on('save-set-sync', (event, key, value) => {
  try {
    fs.writeFileSync(getSavePath(key), value, 'utf8');
    event.returnValue = true;
  } catch(e) { event.returnValue = false; }
});

ipcMain.on('save-remove-sync', (event, key) => {
  try {
    const p = getSavePath(key);
    if (fs.existsSync(p)) fs.unlinkSync(p);
    event.returnValue = true;
  } catch(e) { event.returnValue = false; }
});

// ── Himari Editor ─────────────────────────────────────────────────────────────
ipcMain.on('open-editor', () => {
  createEditorWindow();
});

// ── Lançador de DLCs ─────────────────────────────────────────────────────────
const DLC_ALLOWED = ['Mestre do Giro - DLC', 'Volken is Real - DLC'];

ipcMain.handle('launch-dlc', (_event, dlcName) => {
  if (!DLC_ALLOWED.includes(dlcName)) return { ok: false, error: 'DLC não permitida' };
  const dlcDir = path.join(__dirname, 'dlc', dlcName);
  if (!fs.existsSync(dlcDir)) return { ok: false, error: 'Pasta da DLC não encontrada' };
  try {
    // Usa o mesmo electron que roda o jogo principal
    const child = spawn(process.execPath, ['.'], {
      cwd: dlcDir,
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
});

// ── Discord Rich Presence — recebe atualizações do renderer ──────────────────
ipcMain.on('discord-update', (event, payload) => {
  discord.updateFromRenderer(event, payload);
});

// ── Versão do app ─────────────────────────────────────────────────────────────
ipcMain.handle('get-version', () => {
  // Le a versao do version.json local em AppData (atualizado pelos patches)
  // Se nao existir, cai para a versao do package.json (installer)
  try {
    const APPDATA_DIR = path.join(path.dirname(process.execPath), "resources", "app");
    const versionFile = path.join(APPDATA_DIR, 'version.json');
    if (fs.existsSync(versionFile)) {
      const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
      if (data.version) return data.version;
    }
  } catch(e) {}
  return app.getVersion();
});

// ── Bug Reporter — cria Issue no GitHub ──────────────────────────────────────
ipcMain.handle('submit-bug-report', async (_event, { title, body }) => {
  const https = require('https');

  // Token com permissão apenas de criar issues (public_repo)
  // Substitua pelo seu token gerado em github.com/settings/tokens
  const GITHUB_TOKEN = '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';
  const REPO_OWNER   = 'Claravallac';
  const REPO_NAME    = 'p7vn-folder';

  const payload = JSON.stringify({
    title: '[Bug Report] ' + title,
    body:  body,
    labels: ['bug', 'player-report']
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.github.com',
      path:     `/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent':    'HimariGames-BugReporter',
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Accept':        'application/vnd.github+json'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 201) {
          try {
            const issue = JSON.parse(data);
            resolve({ ok: true, number: issue.number, url: issue.html_url });
          } catch(e) {
            resolve({ ok: true });
          }
        } else {
          resolve({ ok: false, error: 'HTTP ' + res.statusCode });
        }
      });
    });
    req.on('error', e => resolve({ ok: false, error: e.message }));
    req.write(payload);
    req.end();
  });
});