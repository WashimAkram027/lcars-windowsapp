/**
 * About page - System information display
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSystemInformation();
});

/**
 * Load all system information
 */
async function loadSystemInformation() {
  try {
    // Fetch all system data in parallel
    const [systemInfo, osInfo, cpuInfo, memoryInfo, appInfo, uptime] = await Promise.all([
      window.api.system.getSystemInfo(),
      window.api.system.getOSInfo(),
      window.api.system.getCPUInfo(),
      window.api.system.getMemoryInfo(),
      window.api.system.getAppInfo(),
      window.api.system.getUptime()
    ]);

    // Display Device Specifications
    displayDeviceSpecs(systemInfo, cpuInfo, memoryInfo);

    // Display Windows Specifications
    displayOSSpecs(osInfo);

    // Display System Status
    displaySystemStatus(uptime, memoryInfo);

    // Display Application Information
    displayAppInfo(appInfo);

  } catch (error) {
    console.error('Error loading system information:', error);
    showError();
  }
}

/**
 * Display Device Specifications section
 */
function displayDeviceSpecs(systemInfo, cpuInfo, memoryInfo) {
  // Device name
  setElementText('device-name', systemInfo.hostname || 'Unknown');

  // Processor
  const processorText = `${cpuInfo.model} (${cpuInfo.cores} cores @ ${cpuInfo.speed} MHz)`;
  setElementText('processor', processorText);

  // Installed RAM
  const ramText = `${memoryInfo.totalGB} GB`;
  setElementText('ram', ramText);

  // System type
  const systemType = `${systemInfo.arch}-based PC`;
  setElementText('system-type', systemType);
}

/**
 * Display Windows Specifications section
 */
function displayOSSpecs(osInfo) {
  // Edition
  setElementText('os-edition', osInfo.edition || 'Unknown');

  // Version
  setElementText('os-version', osInfo.version || osInfo.release);

  // OS build
  setElementText('os-build', osInfo.release || 'Unknown');

  // Platform
  const platformText = osInfo.type || osInfo.platform;
  setElementText('platform', platformText);
}

/**
 * Display System Status section
 */
function displaySystemStatus(uptime, memoryInfo) {
  // System uptime
  setElementText('uptime', uptime.formatted);

  // Memory usage
  const usageText = `${memoryInfo.usedGB} GB (${memoryInfo.usagePercent}%)`;
  setElementText('memory-usage', usageText);

  // Free memory
  const freeText = `${memoryInfo.freeGB} GB`;
  setElementText('free-memory', freeText);
}

/**
 * Display Application Information section
 */
function displayAppInfo(appInfo) {
  // App name
  setElementText('app-name', appInfo.name || 'LCARS Windows Overlay');

  // Version
  setElementText('app-version', `v${appInfo.version}`);

  // Runtime info
  const runtimeText = `Electron ${appInfo.electronVersion} • Node ${appInfo.nodeVersion} • Chrome ${appInfo.chromeVersion}`;
  setElementText('runtime-info', runtimeText);
}

/**
 * Set element text and remove loading class
 */
function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
    element.classList.remove('loading');
    element.classList.remove('error');
  }
}

/**
 * Show error state for all fields
 */
function showError() {
  const allFields = [
    'device-name', 'processor', 'ram', 'system-type',
    'os-edition', 'os-version', 'os-build', 'platform',
    'uptime', 'memory-usage', 'free-memory',
    'app-name', 'app-version', 'runtime-info'
  ];

  allFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.textContent = 'Error loading information';
      element.classList.remove('loading');
      element.classList.add('error');
    }
  });
}

let refreshInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await checkHomeConnection();
  startHomeAutoRefresh();
});

/**
 * Check internet connection and update home page indicator
 */
async function checkHomeConnection() {
  try {
    const result = await window.api.net.checkConnection();
    updateHomeConnectionStatus(result.connected);
  } catch (error) {
    console.error('Error checking connection:', error);
    updateHomeConnectionStatus(false);
  }
}

/**
 * Update the home page connection status
 */
function updateHomeConnectionStatus(isConnected) {
  const icon = document.querySelector('.network-status-icon');
  const valueText = document.querySelector('.network-status-value');
  
  if (!icon || !valueText) return;
  
  if (isConnected) {
    // Connected - use GIF
    icon.innerHTML = '<img src="src/images/Connected.gif" alt="Connected" style="width: 100%; height: 100%; border-radius: 50%;">';
    valueText.textContent = 'Connected';
  } else {
    // Disconnected - use different GIF
    icon.innerHTML = '<img src="src/images/DisconnectionSymbol.gif" alt="Disconnected" style="width: 100%; height: 100%; border-radius: 50%;">';
    valueText.textContent = 'Disconnected';
  }
}

/**
 * Start auto-refresh timer - every 5 seconds
 */
function startHomeAutoRefresh() {
  refreshInterval = setInterval(async () => {
    await checkHomeConnection();
  }, 1000); // 1 second
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

