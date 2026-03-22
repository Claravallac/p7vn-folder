const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow:   () => ipcRenderer.send('close-window'),
  setFullscreen: (enabled) => ipcRenderer.invoke('set-fullscreen', !!enabled),
  getFullscreen: () => ipcRenderer.invoke('get-fullscreen'),

  // Lançador de DLCs
  launchDlc: (dlcName) => ipcRenderer.invoke('launch-dlc', dlcName),

  // Himari Editor (debug)
  openEditor: () => ipcRenderer.send('open-editor'),

  // Saves async via arquivo
  saveSet:    (key, value) => ipcRenderer.invoke('save-set', key, value),
  saveGet:    (key)        => ipcRenderer.invoke('save-get', key),
  saveRemove: (key)        => ipcRenderer.invoke('save-remove', key),

  // Versão síncrona
  saveGetSync:    (key)        => ipcRenderer.sendSync('save-get-sync',    key),
  saveSetSync:    (key, value) => ipcRenderer.sendSync('save-set-sync',    key, value),
  saveRemoveSync: (key)        => ipcRenderer.sendSync('save-remove-sync', key),

  // Discord Rich Presence
  discordUpdate: (payload) => ipcRenderer.send('discord-update', payload),

  // Versão do app
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Bug Reporter
  submitBugReport: (data) => ipcRenderer.invoke('submit-bug-report', data),

  // ── Auto-updater ────────────────────────────────────────────────────────────
  updateDownload:       (url) => ipcRenderer.invoke('update-download', url),
  updateCancel:         ()    => ipcRenderer.invoke('update-cancel'),
  updateRestart:        ()    => ipcRenderer.invoke('update-restart'),
  updateCheckPartial:   ()    => ipcRenderer.invoke('update-check-partial'),
  updateDiscardPartial: ()    => ipcRenderer.invoke('update-discard-partial'),
  checkPendingUpdate:   ()    => ipcRenderer.invoke('update-check-pending'),
  onUpdateAvailable:   (cb)  => ipcRenderer.on('update-available', (_e, info) => cb(info)),
  onUpdateProgress:    (cb)  => ipcRenderer.on('update-progress',  (_e, pct, speed) => cb(pct, speed)),
  onUpdateReady:       (cb)  => ipcRenderer.on('update-ready',     ()         => cb()),
});