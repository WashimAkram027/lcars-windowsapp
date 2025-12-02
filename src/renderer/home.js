//Home.html has a function called: 
// .network-status-container
// .network-status-container:hover 
//.network-status-icon
//.network-status-text
//.network-status-label
//.network-status-value
//.network-status-arrow
//HTML for network: <!--Network Status Indicator-->
//    <a href="./network.html" style="text-decoration: none;">
 //     <div class="network-status-container">
 //       <div class="network-status-icon">✓</div>
 //       <div class="network-status-text">
 //         <div class="network-status-label">Network Status</div>
 //         <div class="network-status-value">Click for Details</div>
 //       </div>
 //       <div class="network-status-arrow">→</div>
 //     </div>
 //   </a>

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

