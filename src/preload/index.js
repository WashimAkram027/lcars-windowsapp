const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose a minimal, future-proof API surface to the renderer.
 */
contextBridge.exposeInMainWorld('api', {
  fs: {
    // Get root view items (This PC, Gallery, other drives, Recent)
    getDrives: () => ipcRenderer.invoke('fs:getDrives'),

    // Get This PC contents (C:, Desktop, Documents, Pictures)
    getThisPC: () => ipcRenderer.invoke('fs:getThisPC'),

    // Get recent photos from Pictures folder
    getRecentPhotos: () => ipcRenderer.invoke('fs:getRecentPhotos'),

    // Get recent files from Windows Recent folder
    getRecentFiles: () => ipcRenderer.invoke('fs:getRecentFiles'),

    // List contents of a directory
    listDirectory: (dirPath) => ipcRenderer.invoke('fs:listDirectory', dirPath),

    // Get detailed info about a file or directory
    getInfo: (itemPath) => ipcRenderer.invoke('fs:getInfo', itemPath),

    // Get parent directory path
    getParent: (currentPath) => ipcRenderer.invoke('fs:getParent', currentPath),

    // Get user's home directory
    getHomeDir: () => ipcRenderer.invoke('fs:getHomeDir'),

    // Check if path exists
    exists: (itemPath) => ipcRenderer.invoke('fs:exists', itemPath)
  },
  system: {
    // Get general system information
    getSystemInfo: () => ipcRenderer.invoke('system:getSystemInfo'),

    // Get OS information
    getOSInfo: () => ipcRenderer.invoke('system:getOSInfo'),

    // Get CPU information
    getCPUInfo: () => ipcRenderer.invoke('system:getCPUInfo'),

    // Get memory information
    getMemoryInfo: () => ipcRenderer.invoke('system:getMemoryInfo'),

    // Get application information
    getAppInfo: () => ipcRenderer.invoke('system:getAppInfo'),

    // Get system uptime
    getUptime: () => ipcRenderer.invoke('system:getUptime')
  },
  net: {
    // Check internet connectivity
    checkConnection: () => ipcRenderer.invoke('network:checkConnection'),

    // Get network interface information
    getNetworkInfo: () => ipcRenderer.invoke('network:getNetworkInfo')
  }
});
