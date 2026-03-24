// ══════════════════════════════════════════════════════════════════════════════
// updater.js — update sequencial via GitHub
// ══════════════════════════════════════════════════════════════════════════════

const { app, ipcMain } = require('electron');
const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const { spawn } = require('child_process');

const REPO_OWNER         = 'Claravallac';
const REPO_NAME          = 'p7vn-folder';
const BRANCH             = 'main';
const VERSION_JSON_URL   = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/version.json`;
const CHANGELOG_JSON_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/changelog.json`;
const ZIP_URL            = `https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/heads/${BRANCH}.zip`;

const APPDATA_DIR = app.isPackaged
  ? path.join(path.dirname(process.execPath), 'resources', 'app')
  : app.getAppPath();

let _mainWindow    = null;
let _pendingUpdate = null;

ipcMain.handle('update-check-pending', () => _pendingUpdate);

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
          fs.existsSync(path.join(dir, 'main.js'))) return dir;
    } catch(e) {}
  }
  return candidates[0];
}

function toNum(v) {
  return v.replace(/[^0-9.]/g, '').split('.').map(Number);
}

function isNewer(remote, local) {
  const r = toNum(remote), l = toNum(local);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const a = r[i] || 0, b = l[i] || 0;
    if (a > b) return true; if (a < b) return false;
  }
  return false;
}

function compareVersions(a, b) {
  const na = toNum(a), nb = toNum(b);
  for (let i = 0; i < Math.max(na.length, nb.length); i++) {
    const x = na[i] || 0, y = nb[i] || 0;
    if (x > y) return 1; if (x < y) return -1;
  }
  return 0;
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
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        const total = parseInt(res.headers['content-length'] || '0', 10);
        let received = 0, lastTime = Date.now(), lastBytes = 0, lastSpeed = '';
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
          if (onProgress)
            onProgress(total > 0 ? Math.round((received/total)*100) : -received, lastSpeed || null);
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

function getLocalVersion() {
  let local = app.getVersion();
  try {
    const versionFile = path.join(APPDATA_DIR, 'version.json');
    if (fs.existsSync(versionFile)) {
      const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
      if (data.version) local = data.version;
    }
  } catch(e) {}
  return local;
}

function setMainWindow(win) { _mainWindow = win; }

async function checkForUpdates() {
  if (!app.isPackaged) return;
  try {
    const [rawVersion, rawChangelog] = await Promise.all([
      fetchText(VERSION_JSON_URL),
      fetchText(CHANGELOG_JSON_URL)
    ]);

    const remote    = JSON.parse(rawVersion);
    const changelog = JSON.parse(rawChangelog);
    const local     = getLocalVersion();

    if (!isNewer(remote.version, local)) return;

    // Versões que o player ainda não tem, com URL, em ordem crescente
    const pending = changelog
      .filter(e => e.url && isNewer(e.version, local))
      .sort((a, b) => compareVersions(a.version, b.version));

    _pendingUpdate = {
      version: remote.version,
      notes:   remote.notes || '',
      url:     remote.url || ZIP_URL,
      pending: pending.length > 0 ? pending : null
    };

    if (_mainWindow && !_mainWindow.isDestroyed())
      _mainWindow.webContents.send('update-available', _pendingUpdate);

  } catch(e) {
    console.log('[updater] Não foi possível checar atualizações:', e.message);
  }
}

ipcMain.handle('update-check-partial',   () => 0);
ipcMain.handle('update-discard-partial', () => {
  try { const p = _getTmpPath(); if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e) {}
});

let _activeDownload = null;
let _sequenceActive = false;

async function installOne(url, version, step, total, gameDir) {
  if (_mainWindow && !_mainWindow.isDestroyed())
    _mainWindow.webContents.send('update-sequence-step', step, total, version);

  const tmpPath = _getTmpPath();
  try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch(e) {}

  _activeDownload = downloadFile(url, tmpPath, (pct, spd) => {
    if (_mainWindow && !_mainWindow.isDestroyed())
      _mainWindow.webContents.send('update-progress', pct, spd || '');
  });

  await _activeDownload;
  _activeDownload = null;

  await extractZip(tmpPath, gameDir);
  try { fs.unlinkSync(tmpPath); } catch(e) {}

  const removedPath = path.join(gameDir, 'removed.json');
  if (fs.existsSync(removedPath)) {
    try {
      const removed = JSON.parse(fs.readFileSync(removedPath, 'utf8'));
      for (const file of removed) {
        const target = path.join(gameDir, ...file.split('/'));
        try { if (fs.existsSync(target)) fs.unlinkSync(target); } catch(e) {}
      }
      fs.writeFileSync(removedPath, '[]', 'utf8');
    } catch(e) {}
  }
}

ipcMain.handle('update-download', async (_event, url) => {
  if (_activeDownload?.cancel) { _activeDownload.cancel(); _activeDownload = null; await new Promise(r => setTimeout(r, 150)); }
  _sequenceActive = true;

  const gameDir = app.isPackaged ? findGameDir() : APPDATA_DIR;

  try {
    const updates = (_pendingUpdate && _pendingUpdate.pending && _pendingUpdate.pending.length > 0)
      ? _pendingUpdate.pending
      : [{ url: url || _pendingUpdate.url, version: _pendingUpdate ? _pendingUpdate.version : 'latest' }];

    const total = updates.length;
    for (let i = 0; i < total; i++) {
      if (!_sequenceActive) throw new Error('CANCELLED');
      await installOne(updates[i].url, updates[i].version, i + 1, total, gameDir);
    }

    _sequenceActive = false;

    if (_mainWindow && !_mainWindow.isDestroyed())
      _mainWindow.webContents.send('update-ready');

    return { ok: true };
  } catch(e) {
    _sequenceActive = false;
    _activeDownload = null;
    if (e.message === 'CANCELLED') return { ok: false, error: 'CANCELLED' };
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('update-cancel', () => {
  _sequenceActive = false;
  if (_activeDownload?.cancel) { _activeDownload.cancel(); _activeDownload = null; }
});

ipcMain.handle('update-restart', () => {
  restartApp();
});

// Downgrade — instala versão mais velha explicitamente
ipcMain.handle('update-downgrade', async (_event, targetVersion) => {
  if (!app.isPackaged) return { ok: false, error: 'Só funciona no jogo instalado.' };
  _sequenceActive = true;
  const gameDir = findGameDir();

  try {
    const rawChangelog = await fetchText(CHANGELOG_JSON_URL);
    const changelog    = JSON.parse(rawChangelog);
    const entry        = changelog.find(e =>
      e.version === targetVersion || e.version === 'v' + targetVersion
    );
    if (!entry || !entry.url)
      return { ok: false, error: 'Versão não disponível para downgrade.' };

    await installOne(entry.url, entry.version, 1, 1, gameDir);
    _sequenceActive = false;

    if (_mainWindow && !_mainWindow.isDestroyed())
      _mainWindow.webContents.send('update-ready');

    return { ok: true };
  } catch(e) {
    _sequenceActive = false;
    _activeDownload = null;
    return { ok: false, error: e.message };
  }
});

module.exports = { setMainWindow, checkForUpdates };
