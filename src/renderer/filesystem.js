/**
 * Filesystem browser client-side logic
 */

let currentPath = null;
let currentItems = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadDrives();
});


//Lines 15-42 display host name
document.addEventListener('DOMContentLoaded', async () => {
  await loadHostName();
});

async function loadHostName()
{
  const [hostName] = await Promise.all([
    window.api.system.getSystemInfo(),
  ])

  displayHostName(hostName);
} 

function displayHostName(hostName)
{
  setElementText('host-name', hostName.hostname);
}

function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
    element.classList.remove('loading');
    element.classList.remove('error');
    element.classList.remove('LCARS-interface-online-text');
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateUp();
    });
  }

  // Home button - Note: This navigates to home directory, not home page
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateHome();
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      refreshCurrent();
    });
  }
}

/**
 * Load and display all drives (My PC view)
 */
async function loadDrives() {
  try {
    updateStatus('Loading drives...');
    const drives = await window.api.fs.getDrives();
    currentPath = null;
    currentItems = drives;

    displayItems(drives, 'My PC');
    updateStatus(`Found ${drives.length} drive(s)`);
  } catch (error) {
    console.error('Error loading drives:', error);
    updateStatus('Error loading drives: ' + error.message);
  }
}

/**
 * Load and display directory contents
 */
async function loadDirectory(dirPath) {
  try {
    updateStatus(`Loading ${dirPath}...`);
    const items = await window.api.fs.listDirectory(dirPath);
    currentPath = dirPath;
    currentItems = items;

    displayItems(items, dirPath);
    updateStatus(`${items.length} item(s)`);
  } catch (error) {
    console.error('Error loading directory:', error);
    updateStatus('Error: ' + error.message);
  }
}

/**
 * Load and display This PC contents
 */
async function loadThisPC() {
  try {
    updateStatus('Loading This PC...');
    const items = await window.api.fs.getThisPC();
    currentPath = '__THIS_PC__';
    currentItems = items;

    displayItems(items, 'This PC');
    updateStatus(`${items.length} item(s)`);
  } catch (error) {
    console.error('Error loading This PC:', error);
    updateStatus('Error: ' + error.message);
  }
}

/**
 * Load and display Gallery (recent photos)
 */
async function loadGallery() {
  try {
    updateStatus('Loading recent photos...');
    const items = await window.api.fs.getRecentPhotos();
    currentPath = '__GALLERY__';
    currentItems = items;

    displayItems(items, 'Gallery - Recent Photos');
    updateStatus(`${items.length} photo(s)`);
  } catch (error) {
    console.error('Error loading gallery:', error);
    updateStatus('Error: ' + error.message);
  }
}

/**
 * Load and display Recent files
 */
async function loadRecent() {
  try {
    updateStatus('Loading recent files...');
    const items = await window.api.fs.getRecentFiles();
    currentPath = '__RECENT__';
    currentItems = items;

    displayItems(items, 'Recent Files');
    updateStatus(`${items.length} recent file(s)`);
  } catch (error) {
    console.error('Error loading recent files:', error);
    updateStatus('Error: ' + error.message);
  }
}

/**
 * Display items in the file list
 */
function displayItems(items, pathLabel) {
  // Update current path display
  const pathDisplay = document.getElementById('current-path');
  if (pathDisplay) {
    pathDisplay.textContent = pathLabel;
  }

  // Get container
  const container = document.getElementById('file-list');
  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  // Display message if empty
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-message">This folder is empty</div>';
    return;
  }

  // Create list
  const list = document.createElement('div');
  list.className = 'item-list';

  items.forEach(item => {
    const itemEl = createItemElement(item);
    list.appendChild(itemEl);
  });

  container.appendChild(list);
}

/**
 * Create DOM element for a file/folder/drive item
 */
function createItemElement(item) {
  const div = document.createElement('div');
  div.className = `item item-${item.type}`;
  div.dataset.path = item.path;
  div.dataset.type = item.type;

  // Icon
  const icon = document.createElement('span');
  icon.className = 'item-icon';
  icon.textContent = getIcon(item);

  // Name
  const name = document.createElement('span');
  name.className = 'item-name';
  name.textContent = item.name;

  // Size (for files)
  const size = document.createElement('span');
  size.className = 'item-size';
  if (item.type === 'file' && item.size !== undefined) {
    size.textContent = formatSize(item.size);
  } else {
    size.textContent = '';
  }

  // Modified date
  const modified = document.createElement('span');
  modified.className = 'item-modified';
  if (item.modified) {
    modified.textContent = formatDate(item.modified);
  }

  div.appendChild(icon);
  div.appendChild(name);
  div.appendChild(size);
  div.appendChild(modified);

  // Click handler
  div.addEventListener('click', () => handleItemClick(item));

  return div;
}

/**
 * Handle click on an item
 */
async function handleItemClick(item) {
  if (item.type === 'special') {
    // Handle special folders
    if (item.path === '__THIS_PC__') {
      await loadThisPC();
    } else if (item.path === '__GALLERY__') {
      await loadGallery();
    } else if (item.path === '__RECENT__') {
      await loadRecent();
    }
  } else if (item.type === 'directory' || item.type === 'drive') {
    await loadDirectory(item.path);
  } else {
    // File clicked - show info for now
    showItemInfo(item);
  }
}

/**
 * Show detailed info about an item
 */
async function showItemInfo(item) {
  try {
    const info = await window.api.fs.getInfo(item.path);
    const message = `
Name: ${info.name}
Type: ${info.type}
Path: ${info.path}
${info.size !== undefined ? 'Size: ' + formatSize(info.size) : ''}
${info.extension ? 'Extension: ' + info.extension : ''}
Modified: ${formatDate(info.modified)}
Created: ${formatDate(info.created)}
    `.trim();

    updateStatus(message);
  } catch (error) {
    updateStatus('Error getting info: ' + error.message);
  }
}

/**
 * Navigate to parent directory
 */
async function navigateUp() {
  if (!currentPath) {
    // Already at root view
    return;
  }

  if (currentPath === '__THIS_PC__' || currentPath === '__GALLERY__' || currentPath === '__RECENT__') {
    // Go back to root view
    await loadDrives();
    return;
  }

  try {
    const parent = await window.api.fs.getParent(currentPath);
    if (parent === null || parent === currentPath) {
      // At root, go back to drives
      await loadDrives();
    } else {
      await loadDirectory(parent);
    }
  } catch (error) {
    console.error('Error navigating up:', error);
    updateStatus('Error: ' + error.message);
  }
}

/**
 * Navigate to home directory
 */
async function navigateHome() {
  try {
    const homeDir = await window.api.fs.getHomeDir();
    await loadDirectory(homeDir);
    navigateUp();
  } catch (error) {
    console.error('Error navigating home:', error);
    updateStatus('Error: ' + error.message);
  }
}

/**
 * Refresh current view
 */
async function refreshCurrent() {
  if (currentPath) {
    await loadDirectory(currentPath);
  } else {
    await loadDrives();
  }
}

/**
 * Update status message
 */
function updateStatus(message) {
  const status = document.getElementById('status');
  if (status) {
    status.textContent = message;
  }
}

/**
 * Get icon for item type
 */
function getIcon(item) {
  switch (item.type) {
    case 'special':
      if (item.path === '__THIS_PC__') {
        return '💻';
      } else if (item.path === '__GALLERY__') {
        return '🖼️';
      } else if (item.path === '__RECENT__') {
        return '🕒';
      }
      return '⭐';
    case 'drive':
      return '💾';
    case 'directory':
      return '📁';
    case 'file':
      // Could add specific icons based on extension
      const ext = item.extension?.toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
        return '🖼️';
      } else if (['.mp4', '.avi', '.mkv', '.mov', '.wmv'].includes(ext)) {
        return '🎬';
      } else if (['.mp3', '.wav', '.flac', '.ogg', '.m4a'].includes(ext)) {
        return '🎵';
      } else if (['.txt', '.md', '.log'].includes(ext)) {
        return '📝';
      } else if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) {
        return '📦';
      } else if (['.exe', '.msi', '.bat', '.cmd'].includes(ext)) {
        return '⚙️';
      } else if (['.pdf'].includes(ext)) {
        return '📄';
      }
      return '📄';
    default:
      return '❓';
  }
}

/**
 * Format file size in human-readable format
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date in readable format
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

const hostName = window.api.system.getSystemInfo();

function displayHostName(hostName)
{
  setElementText('host-name', hostName.hostname)
}

