const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    isDesktop: true,
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    loadData: () => ipcRenderer.invoke('load-data'),
    onAppReady: (callback) => ipcRenderer.on('app-ready', (event, data) => callback(data))
});
