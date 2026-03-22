// ══════════════════════════════════════════════════════════════════════════════
// updater.js — update via GitHub
//
// Fluxo:
//   1. Checa version.json no repositório
//   2. Se há versão nova, baixa o zip da branch main
//   3. Extrai por cima dos arquivos em AppData\HimariGames\
//   4. Reinicia o jogo
// ══════════════════════════════════════════════════════════════════════════════

const { app, ipcMain } = require('electron');
const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const zlib   = require('zlib');
const { spawn } = require('child_process');

const REPO_OWNER       = 'Claravallac';
const REPO_NAME        = 'p7vn-folder';
const BRANCH           = 'main';
const VERSION_JSON_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/version.json`;
const ZIP_URL          = `https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/heads/${BRANCH}.zip`;

const APPDATA_DIR = path.join(app.getPath('appData'), 'HimariGames');

let _mainWindow    = null;
let _pendingUpdate = null;

ipcMain.handle('update-check-pending', () => _pendingUpdate);

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

function downloadFile(url, destPath, onProgress, startByte = 0) {
  let _cancelled = false, _currentReq = null;
  const promise = new Promise((resolve, reject) => {
    function doGet(currentUrl, hops) {
      if (_cancelled) return reject(new Error('CANCELLED'));
      if (hops > 10) return reject(new Error('Too many redirects'));
      const proto = currentUrl.startsWith('https') ? https : http;
      const headers = { 'User-Agent': 'HimariGames-Updater' };
      if (startByte > 0 && hops === 0) headers['Range'] = `bytes=${startByte}-`;
      const req = proto.get(currentUrl, { headers }, res => {
        if ([301,302,303,307,308].includes(res.statusCode)) {
          res.resume();
          const loc = res.headers.location;
          if (!loc) return reject(new Error('Redirect sem location'));
          return doGet(loc.startsWith('http') ? loc : new URL(loc, currentUrl).href, hops+1);
        }
        if (res.statusCode !== 200 && res.statusCode !== 206)
          return reject(new Error('HTTP ' + res.statusCode));
        const cLen  = parseInt(res.headers['content-length'] || '0', 10);
        const total = res.statusCode === 206 ? startByte + cLen : cLen;
        let received = res.statusCode === 206 ? startByte : 0;
        let lastTime = Date.now(), lastBytes = received, lastSpeed = '';
        const file = res.statusCode === 206
          ? fs.createWriteStream(destPath, { flags: 'a' })
          : fs.createWriteStream(destPath);
        res.on('data', chunk => {
          if (_cancelled) { res.destroy(); file.destroy(); return reject(new Error('CANCELLED')); }
          received += chunk.length; file.write(chunk);
          const now = Date.now(), elapsed = (now - lastTime) / 1000;
          if (elapsed >= 0.5) {
            const bps = (received - lastBytes) / elapsed;
            lastTime = now; lastBytes = received;
            lastSpeed = bps > 1048576 ? (bps/1048576).toFixed(1)+' MB/s' : (bps/1024).toFixed(0)+' KB/s';
          }
          if (total > 0 && onProgress) onProgress(received / total, lastSpeed || null);
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

// Extrai ZIP — pula a pasta raiz que o GitHub adiciona (ex: p7vn-folder-main/)
function extractZip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    try {
      const buf = fs.readFileSync(zipPath);
      const u16 = o => buf[o] | (buf[o+1] << 8);
      const u32 = o => (buf[o] | (buf[o+1]<<8) | (buf[o+2]<<16) | (buf[o+3]<<24)) >>> 0;

      let eocd = -1;
      for (let i = buf.length - 22; i >= 0; i--) {
        if (u32(i) === 0x06054b50) { eocd = i; break; }
      }
      if (eocd === -1) return reject(new Error('ZIP inválido'));

      const count = u16(eocd + 8);
      let cdOffset = u32(eocd + 16);

      for (let i = 0; i < count; i++) {
        if (u32(cdOffset) !== 0x02014b50) return reject(new Error('ZIP: CD inválido'));
        const comp     = u16(cdOffset + 10);
        const compSz   = u32(cdOffset + 20);
        const nameLen  = u16(cdOffset + 28);
        const extraLen = u16(cdOffset + 30);
        const commLen  = u16(cdOffset + 32);
        const lhOffset = u32(cdOffset + 42);
        const name     = buf.slice(cdOffset+46, cdOffset+46+nameLen).toString('utf8');
        cdOffset += 46 + nameLen + extraLen + commLen;

        // Pula a pasta raiz do GitHub (ex: "p7vn-folder-main/arquivo.js")
        const parts = name.split('/');
        if (parts.length < 2) continue;
        const relativeName = parts.slice(1).join('/');
        if (!relativeName || relativeName.endsWith('/')) continue;

        // Nao sobrescreve o executavel principal
        if (relativeName === path.basename(process.execPath)) continue;

        const lnLen   = u16(lhOffset + 26);
        const leLen   = u16(lhOffset + 28);
        const dataOff = lhOffset + 30 + lnLen + leLen;
        const data    = buf.slice(dataOff, dataOff + compSz);
        const outPath = path.join(destDir, ...relativeName.split('/'));

        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        if (comp === 0) fs.writeFileSync(outPath, data);
        else if (comp === 8) fs.writeFileSync(outPath, zlib.inflateRawSync(data));
        else return reject(new Error(`Compressão não suportada: ${comp}`));
      }
      resolve();
    } catch(e) { reject(e); }
  });
}

function _getTmpPath() {
  return path.join(app.getPath('downloads'), 'HimariGames_update.zip');
}
function _getPartialSize() {
  try { const p = _getTmpPath(); if (fs.existsSync(p)) { const s = fs.statSync(p); return s.size > 0 ? s.size : 0; } } catch(e) {}
  return 0;
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
    const local  = app.getVersion();
    if (!isNewer(remote.version, local)) return;
    _pendingUpdate = { version: remote.version, notes: remote.notes || '', url: ZIP_URL };
    if (_mainWindow && !_mainWindow.isDestroyed())
      _mainWindow.webContents.send('update-available', _pendingUpdate);
  } catch(e) {
    console.log('[updater] Não foi possível checar atualizações:', e.message);
  }
}

ipcMain.handle('update-check-partial',   () => _getPartialSize());
ipcMain.handle('update-discard-partial', () => {
  try { const p = _getTmpPath(); if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e) {}
});

let _activeDownload = null;

ipcMain.handle('update-download', async (_event, url) => {
  if (_activeDownload?.cancel) { _activeDownload.cancel(); _activeDownload = null; await new Promise(r => setTimeout(r, 150)); }

  const tmpPath   = _getTmpPath();
  const startByte = _getPartialSize();

  try {
    _activeDownload = downloadFile(url, tmpPath, (pct, spd) => {
      if (_mainWindow && !_mainWindow.isDestroyed())
        _mainWindow.webContents.send('update-progress', Math.round(pct * 100), spd || '');
    }, startByte);

    await _activeDownload;
    _activeDownload = null;

    // Extrai zip por cima dos arquivos em AppData\HimariGames\
    await extractZip(tmpPath, APPDATA_DIR);
    try { fs.unlinkSync(tmpPath); } catch(e) {}

    // Remove arquivos deletados no repositorio
    const removedPath = path.join(APPDATA_DIR, 'removed.json');
    if (fs.existsSync(removedPath)) {
      try {
        const removed = JSON.parse(fs.readFileSync(removedPath, 'utf8'));
        for (const file of removed) {
          const target = path.join(APPDATA_DIR, ...file.split('/'));
          try { if (fs.existsSync(target)) fs.unlinkSync(target); } catch(e) {}
        }
        fs.writeFileSync(removedPath, '[]', 'utf8');
      } catch(e) { console.log('[updater] removed.json:', e.message); }
    }

    if (_mainWindow && !_mainWindow.isDestroyed())
      _mainWindow.webContents.send('update-ready');

    setTimeout(() => restartApp(), 1200);
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

module.exports = { setMainWindow, checkForUpdates };
