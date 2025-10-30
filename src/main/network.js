import { ipcMain } from 'electron';
import os from 'node:os';
import https from 'node:https';
import dns from 'node:dns/promises';

/**
 * Register all network-related IPC handlers
 */
export function registerNetworkHandlers() {
  // Check internet connectivity
  ipcMain.handle('network:checkConnection', async () => {
    try {
      // Try multiple methods to determine connectivity
      const [dnsCheck, httpsCheck] = await Promise.allSettled([
        checkDNS(),
        checkHTTPS()
      ]);

      const isConnected =
        dnsCheck.status === 'fulfilled' ||
        httpsCheck.status === 'fulfilled';

      return {
        connected: isConnected,
        dnsWorking: dnsCheck.status === 'fulfilled',
        httpsWorking: httpsCheck.status === 'fulfilled',
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking connection:', error);
      return {
        connected: false,
        dnsWorking: false,
        httpsWorking: false,
        error: error.message,
        checkedAt: new Date().toISOString()
      };
    }
  });

  // Get network interface information
  ipcMain.handle('network:getNetworkInfo', async () => {
    try {
      const interfaces = os.networkInterfaces();
      const networkInfo = [];

      for (const [name, addresses] of Object.entries(interfaces)) {
        const ipv4Addresses = addresses.filter(addr => addr.family === 'IPv4');
        const ipv6Addresses = addresses.filter(addr => addr.family === 'IPv6');

        if (ipv4Addresses.length > 0 || ipv6Addresses.length > 0) {
          networkInfo.push({
            name: name,
            ipv4: ipv4Addresses.map(addr => ({
              address: addr.address,
              netmask: addr.netmask,
              internal: addr.internal
            })),
            ipv6: ipv6Addresses.map(addr => ({
              address: addr.address,
              netmask: addr.netmask,
              internal: addr.internal
            }))
          });
        }
      }

      return networkInfo;
    } catch (error) {
      console.error('Error getting network info:', error);
      throw error;
    }
  });
}

/**
 * Check DNS resolution (try to resolve google.com)
 */
async function checkDNS() {
  try {
    await dns.resolve4('google.com');
    return true;
  } catch (error) {
    throw new Error('DNS resolution failed');
  }
}

/**
 * Check HTTPS connectivity (try to reach Google DNS over HTTPS)
 */
async function checkHTTPS() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'dns.google',
      port: 443,
      path: '/resolve?name=google.com',
      method: 'GET',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`HTTPS check failed with status ${res.statusCode}`));
      }
      // Consume response data to free up memory
      res.resume();
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HTTPS request timeout'));
    });

    req.end();
  });
}
