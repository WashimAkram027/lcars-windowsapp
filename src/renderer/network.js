/**
 * Network page - Connection status and network information
 */

let refreshInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkConnection();
  await loadNetworkInterfaces();
  startAutoRefresh();
});

/**
 * Set up event listeners
 */
function setupEventListeners() {
  const refreshButton = document.getElementById('refresh-button');
  if (refreshButton) {
    refreshButton.addEventListener('click', async () => {
      await checkConnection();
      await loadNetworkInterfaces();
    });
  }
}

/**
 * Check internet connection
 */
async function checkConnection() {
  try {
    const result = await window.api.net.checkConnection();

    updateConnectionStatus(result);

  } catch (error) {
    console.error('Error checking connection:', error);
    showConnectionError();
  }
}

/**
 * Update connection status UI
 */
function updateConnectionStatus(result) {
  const indicator = document.getElementById('status-indicator');
  const title = document.getElementById('status-title');
  const details = document.getElementById('status-details');

  if (!indicator || !title || !details) return;

  // Clear existing classes
  indicator.className = 'status-indicator';
  title.className = 'status-title';

  if (result.connected) {
    // Online
    indicator.classList.add('online');
    indicator.textContent = '✓';
    title.classList.add('online');
    title.textContent = 'Connected to Internet';

    const checks = [];
    if (result.dnsWorking) checks.push('DNS working');
    if (result.httpsWorking) checks.push('HTTPS working');

    details.textContent = `${checks.join(' • ')} • Last checked: ${formatTime(result.checkedAt)}`;
  } else {
    // Offline
    indicator.classList.add('offline');
    indicator.textContent = '✗';
    title.classList.add('offline');
    title.textContent = 'No Internet Connection';

    details.textContent = `Unable to reach internet • Last checked: ${formatTime(result.checkedAt)}`;
  }
}

/**
 * Show connection error
 */
function showConnectionError() {
  const indicator = document.getElementById('status-indicator');
  const title = document.getElementById('status-title');
  const details = document.getElementById('status-details');

  if (!indicator || !title || !details) return;

  indicator.className = 'status-indicator offline';
  indicator.textContent = '?';
  title.className = 'status-title offline';
  title.textContent = 'Error Checking Connection';
  details.textContent = 'Failed to check network status';
}

/**
 * Load and display network interfaces
 */
async function loadNetworkInterfaces() {
  try {
    const interfaces = await window.api.net.getNetworkInfo();

    displayNetworkInterfaces(interfaces);

  } catch (error) {
    console.error('Error loading network interfaces:', error);
    showInterfaceError();
  }
}

/**
 * Display network interfaces
 */
function displayNetworkInterfaces(interfaces) {
  const container = document.getElementById('interfaces-container');

  if (!container) return;

  // Clear container
  container.innerHTML = '';

  if (interfaces.length === 0) {
    container.innerHTML = '<div style="color: #666;">No network interfaces found</div>';
    return;
  }

  interfaces.forEach(iface => {
    const item = createInterfaceItem(iface);
    container.appendChild(item);
  });
}

/**
 * Create network interface item
 */
function createInterfaceItem(iface) {
  const item = document.createElement('div');
  item.className = 'interface-item';

  const name = document.createElement('div');
  name.className = 'interface-name';
  name.textContent = iface.name;

  item.appendChild(name);

  // IPv4 addresses
  if (iface.ipv4 && iface.ipv4.length > 0) {
    iface.ipv4.forEach(addr => {
      const addrDiv = document.createElement('div');
      addrDiv.className = 'interface-address';
      addrDiv.textContent = `IPv4: ${addr.address}${addr.internal ? ' (Internal)' : ''}`;
      item.appendChild(addrDiv);
    });
  }

  // IPv6 addresses
  if (iface.ipv6 && iface.ipv6.length > 0) {
    iface.ipv6.forEach(addr => {
      const addrDiv = document.createElement('div');
      addrDiv.className = 'interface-address';
      addrDiv.textContent = `IPv6: ${addr.address}${addr.internal ? ' (Internal)' : ''}`;
      item.appendChild(addrDiv);
    });
  }

  return item;
}

/**
 * Show interface error
 */
function showInterfaceError() {
  const container = document.getElementById('interfaces-container');
  if (container) {
    container.innerHTML = '<div style="color: #ff6666;">Error loading network interfaces</div>';
  }
}

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
  // Refresh every 10 seconds
  refreshInterval = setInterval(async () => {
    await checkConnection();
  }, 10000);
}

/**
 * Format time from ISO string
 */
function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
