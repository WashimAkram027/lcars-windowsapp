import { ipcMain, app } from 'electron';
import os from 'node:os';

/**
 * Register all system information IPC handlers
 */
export function registerSystemHandlers() {
  // Get general system information
  ipcMain.handle('system:getSystemInfo', async () => {
    try {
      return {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        type: os.type(),
        endianness: os.endianness()
      };
    } catch (error) {
      console.error('Error getting system info:', error);
      throw error;
    }
  });

  // Get OS information
  ipcMain.handle('system:getOSInfo', async () => {
    try {
      const platform = os.platform();
      const release = os.release();

      // Format Windows version info
      let edition = 'Unknown';
      let version = release;

      if (platform === 'win32') {
        // Windows version mapping (approximate)
        const releaseNum = parseFloat(release);
        if (releaseNum >= 10.0) {
          edition = 'Windows 10/11';
          version = release;
        } else if (releaseNum >= 6.3) {
          edition = 'Windows 8.1';
        } else if (releaseNum >= 6.2) {
          edition = 'Windows 8';
        } else if (releaseNum >= 6.1) {
          edition = 'Windows 7';
        }
      } else if (platform === 'darwin') {
        edition = 'macOS';
      } else if (platform === 'linux') {
        edition = 'Linux';
      }

      return {
        platform: platform,
        edition: edition,
        release: release,
        version: os.version(),
        type: os.type()
      };
    } catch (error) {
      console.error('Error getting OS info:', error);
      throw error;
    }
  });

  // Get CPU information
  ipcMain.handle('system:getCPUInfo', async () => {
    try {
      const cpus = os.cpus();

      if (cpus.length === 0) {
        return {
          model: 'Unknown',
          cores: 0,
          speed: 0
        };
      }

      // Get info from first CPU (all cores usually have same model)
      const firstCpu = cpus[0];

      return {
        model: firstCpu.model,
        cores: cpus.length,
        speed: firstCpu.speed, // MHz
        architecture: os.arch()
      };
    } catch (error) {
      console.error('Error getting CPU info:', error);
      throw error;
    }
  });

  // Get memory information
  ipcMain.handle('system:getMemoryInfo', async () => {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      return {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        totalGB: (totalMem / (1024 ** 3)).toFixed(2),
        freeGB: (freeMem / (1024 ** 3)).toFixed(2),
        usedGB: (usedMem / (1024 ** 3)).toFixed(2),
        usagePercent: ((usedMem / totalMem) * 100).toFixed(1)
      };
    } catch (error) {
      console.error('Error getting memory info:', error);
      throw error;
    }
  });

  // Get application information
  ipcMain.handle('system:getAppInfo', async () => {
    try {
      return {
        name: app.getName(),
        version: app.getVersion(),
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        v8Version: process.versions.v8,
        chromeVersion: process.versions.chrome
      };
    } catch (error) {
      console.error('Error getting app info:', error);
      throw error;
    }
  });

  // Get system uptime
  ipcMain.handle('system:getUptime', async () => {
    try {
      const uptimeSeconds = os.uptime();

      // Convert to readable format
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);

      return {
        seconds: uptimeSeconds,
        days: days,
        hours: hours,
        minutes: minutes,
        formatted: `${days}d ${hours}h ${minutes}m`
      };
    } catch (error) {
      console.error('Error getting uptime:', error);
      throw error;
    }
  });
}
