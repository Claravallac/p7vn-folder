// ══════════════════════════════════════════════════════════════════════════════
// updater.js — update via GitHub
// ══════════════════════════════════════════════════════════════════════════════

const { app, ipcMain } = require('electron');
const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const { spawn } = require('child_process');

const REPO_OWNER       = 'Claravallac';
const REPO_NAME        = 'p7vn-folder';
const BRANCH           = 'main';
const VERSION_JSON_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/version.json`;
const ZIP_URL          = `https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/heads/${BRANCH}.zip`;

const APPDATA_DIR = app.isPackaged ? path.join(path.dirname(process.execPath), "resources", "app") : app.getAppPath();

let _mainWindow    = null;
let _pendingUpdate = null;

ipcMain.handle('update-check-pending', () => _pendingUpdate);


// Procura o diretório real dos arquivos do game
function findGameDir() {
  const candidates = [
    path.join(path.dirname(process.execPath), 'resources', 'app'),
    path.join(path.dirname(process.execPath), 'resources'),
    path.dirname(process.execPath),
    app.getAppPath(),
  ];
  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, 'index.html')) &&
          fs.existsSync(path.join(dir, 'main.js'))) {
        return dir;
      }
    } catch(e) {}
  }
  // Fallback
  return candidates[0];
}

function isNewer(remote, local) {
  const toNum = v => v.replace(/[^0-9.]/g, '').split('.').map(Number);
  const r = toNum(remote), l = toNum(local);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const a = r[i] || 0, b = l[i] || 0;
    if (a > b) return true; if (a < b) return false;
  }
  return false;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'HimariGames-Updater' } }, res => {
      if ([301,302,303,307,308].includes(res.statusCode))
        return fetchText(res.headers.location).then(resolve).catch(reject);
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadFile(url, destPath, onProgress) {
  let _cancelled = false, _currentReq = null;
  const promise = new Promise((resolve, reject) => {
    function doGet(currentUrl, hops) {
      if (_cancelled) return reject(new Error('CANCELLED'));
      if (hops > 10) return reject(new Error('Too many redirects'));
      const proto = currentUrl.startsWith('https') ? https : http;
      const req = proto.get(currentUrl, { headers: { 'User-Agent': 'HimariGames-Updater' } }, res => {
        if ([301,302,303,307,308].includes(res.statusCode)) {
          res.resume();
          const loc = res.headers.location;
          if (!loc) return reject(new Error('Redirect sem location'));
          return doGet(loc.startsWith('http') ? loc : new URL(loc, currentUrl).href, hops+1);
        }
        if (res.statusCode !== 200)
          return reject(new Error('HTTP ' + res.statusCode));

        const total    = parseInt(res.headers['content-length'] || '0', 10);
        let received   = 0;
        let lastTime   = Date.now(), lastBytes = 0, lastSpeed = '';

        const file = fs.createWriteStream(destPath);
        res.on('data', chunk => {
          if (_cancelled) { res.destroy(); file.destroy(); return reject(new Error('CANCELLED')); }
          received += chunk.length;
          file.write(chunk);
          const now = Date.now(), elapsed = (now - lastTime) / 1000;
          if (elapsed >= 0.5) {
            const bps = (received - lastBytes) / elapsed;
            lastTime = now; lastBytes = received;
            lastSpeed = bps > 1048576 ? (bps/1048576).toFixed(1)+' MB/s' : (bps/1024).toFixed(0)+' KB/s';
          }
          if (onProgress) {
            if (total > 0) {
              onProgress(Math.round((received / total) * 100), lastSpeed || null);
            } else {
              // Sem content-length: mostra MB recebidos
              onProgress(-(received), lastSpeed || null);
            }
          }
        });
        res.on('end',   () => { if (!_cancelled) { file.end(); resolve(); } });
        res.on('error', err => { file.destroy(); reject(err); });
      });
      _currentReq = req; req.on('error', reject);
    }
    doGet(url, 0);
  });
  promise.cancel = () => { _cancelled = true; if (_currentReq) _currentReq.destroy(); };
  return promise;
}

// Extrai ZIP via PowerShell (suporta ZIP64) — pula a pasta raiz do GitHub
function extractZip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    const tmpExtract = path.join(os.tmpdir(), 'HimariGames_extract_' + Date.now());
    const psCmd = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/\\/g, '\\\\')}', '${tmpExtract.replace(/\\/g, '\\\\')}')`;
    const proc = spawn('powershell.exe', ['-NoProfile', '-Command', psCmd], { stdio: 'pipe' });
    let stderr = '';
    proc.stderr.on('data', d => stderr += d);
    proc.on('close', code => {
      if (code !== 0) return reject(new Error('Extracao falhou: ' + stderr));
      try {
        const entries = fs.readdirSync(tmpExtract);
        // Se tem uma unica pasta e nenhum arquivo na raiz = ZIP do GitHub (tem pasta raiz)
        // Se tem arquivos na raiz = ZIP delta (sem pasta raiz)
        const hasFiles = entries.some(e => fs.statSync(path.join(tmpExtract, e)).isFile());
        const rootDir = (!hasFiles && entries.length === 1)
          ? path.join(tmpExtract, entries[0])
          : tmpExtract;
        const execBase = path.basename(process.execPath);
        function copyDir(src, dest) {
          fs.mkdirSync(dest, { recursive: true });
          for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
            if (entry.name === execBase) continue;
            const sp = path.join(src, entry.name);
            const dp = path.join(dest, entry.name);
            if (entry.isDirectory()) copyDir(sp, dp);
            else fs.copyFileSync(sp, dp);
          }
        }
        copyDir(rootDir, destDir);
        fs.rmSync(tmpExtract, { recursive: true, force: true });
        resolve();
      } catch(e) { reject(e); }
    });
  });
}

function _getTmpPath() {
  return path.join(app.getPath('downloads'), 'HimariGames_update.zip');
}

function restartApp() {
  const bat = path.join(os.tmpdir(), 'himari_restart.bat');
  fs.writeFileSync(bat, [
    '@echo off', 'timeout /t 1 /nobreak >nul',
    `start "" "${process.execPath}"`, 'del "%~f0"',
  ].join('\r\n'), 'utf8');
  spawn('cmd.exe', ['/c', bat], { detached: true, stdio: 'ignore' }).unref();
  app.quit();
}

function setMainWindow(win) { _mainWindow = win; }

async function checkForUpdates() {
  if (!app.isPackaged) return;
  try {
    const raw    = await fetchText(VERSION_JSON_URL);
    const remote = JSON.parse(raw);

    let local = app.getVersion();
    try {
      const versionFile = path.join(APPDATA_DIR, 'version.json');
      if (fs.existsSync(versionFile)) {
        const localData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
        if (localData.version) local = localData.version;
      }
    } catch(e) {}

    if (!isNewer(remote.version, local)) return;
    const updateUrl = remote.url || ZIP_URL;
    _pendingUpdate = { version: remote.version, notes: remote.notes || '', url: updateUrl };
    if (_mainWindow && !_mainWindow.isDestroyed())
      _mainWindow.webContents.send('update-available', _pendingUpdate);
  } catch(e) {
    console.log('[updater] Não foi possível checar atualizações:', e.message);
  }
}

ipcMain.handle('update-check-partial',   () => 0); // Resume desabilitado
ipcMain.handle('update-discard-partial', () => {
  try { const p = _getTmpPath(); if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e) {}
});

let _activeDownload = null;

ipcMain.handle('update-download', async (_event, url) => {
  if (_activeDownload?.cancel) { _activeDownload.cancel(); _activeDownload = null; await new Promise(r => setTimeout(r, 150)); }

  // Sempre começa do zero — evita corrupção com ZIPs do GitHub
  const tmpPath = _getTmpPath();
  try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch(e) {}

  try {
    _activeDownload = downloadFile(url, tmpPath, (pct, spd) => {
      if (_mainWindow && !_mainWindow.isDestroyed())
        _mainWindow.webContents.send('update-progress', pct, spd || '');
    });

    await _activeDownload;
    _activeDownload = null;

    const gameDir = app.isPackaged ? findGameDir() : APPDATA_DIR;
    await extractZip(tmpPath, gameDir);
    try { fs.unlinkSync(tmpPath); } catch(e) {}

    // Remove arquivos deletados no repositorio
    const removedPath = path.join(gameDir, 'removed.json');
    if (fs.existsSync(removedPath)) {
      try {
        const removed = JSON.parse(fs.readFileSync(removedPath, 'utf8'));
        for (const file of removed) {
          const target = path.join(gameDir, ...file.split('/'));
          try { if (fs.existsSync(target)) fs.unlinkSync(target); } catch(e) {}
        }
        fs.writeFileSync(removedPath, '[]', 'utf8');
      } catch(e) { console.log('[updater] removed.json:', e.message); }
    }

    if (_mainWindow && !_mainWindow.isDestroyed())
      _mainWindow.webContents.send('update-ready');

    // Nao reinicia automaticamente — aguarda o player confirmar
    return { ok: true };
  } catch(e) {
    _activeDownload = null;
    if (e.message === 'CANCELLED') return { ok: false, error: 'CANCELLED' };
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('update-cancel', () => {
  if (_activeDownload?.cancel) { _activeDownload.cancel(); _activeDownload = null; }
});

ipcMain.handle('update-restart', () => {
  restartApp();
});

module.exports = { setMainWindow, checkForUpdates };
