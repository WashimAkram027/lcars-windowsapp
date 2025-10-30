/**
 * Gallery page - Display recent photos from Pictures folder
 */

let photos = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadGallery();
});

/**
 * Load and display recent photos
 */
async function loadGallery() {
  try {
    updateStatus('Loading recent photos...');

    // Fetch recent photos using existing filesystem API
    photos = await window.api.fs.getRecentPhotos();

    displayPhotos(photos);
    updateStatus(`${photos.length} photo(s) found`);

  } catch (error) {
    console.error('Error loading gallery:', error);
    showError('Error loading photos: ' + error.message);
  }
}

/**
 * Display photos in grid
 */
function displayPhotos(photoList) {
  const container = document.getElementById('gallery-container');

  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Show empty message if no photos
  if (photoList.length === 0) {
    container.innerHTML = '<div class="empty-message">No photos found in your Pictures folder</div>';
    return;
  }

  // Create grid
  const grid = document.createElement('div');
  grid.className = 'photo-grid';

  photoList.forEach(photo => {
    const photoItem = createPhotoItem(photo);
    grid.appendChild(photoItem);
  });

  container.appendChild(grid);
}

/**
 * Create photo item element
 */
function createPhotoItem(photo) {
  const item = document.createElement('div');
  item.className = 'photo-item';
  item.dataset.path = photo.path;

  // Thumbnail (icon for now, could be actual image later)
  const thumbnail = document.createElement('div');
  thumbnail.className = 'photo-thumbnail';
  thumbnail.textContent = '🖼️';

  // Photo info
  const info = document.createElement('div');
  info.className = 'photo-info';

  const name = document.createElement('div');
  name.className = 'photo-name';
  name.textContent = photo.name;
  name.title = photo.name; // Show full name on hover

  const details = document.createElement('div');
  details.className = 'photo-details';

  const size = document.createElement('span');
  size.textContent = formatSize(photo.size);

  const date = document.createElement('span');
  date.textContent = formatDate(photo.modified);

  details.appendChild(size);
  details.appendChild(date);

  info.appendChild(name);
  info.appendChild(details);

  item.appendChild(thumbnail);
  item.appendChild(info);

  // Click handler - show photo info
  item.addEventListener('click', () => showPhotoInfo(photo));

  return item;
}

/**
 * Show photo information
 */
function showPhotoInfo(photo) {
  const info = `
Name: ${photo.name}
Path: ${photo.path}
Size: ${formatSize(photo.size)}
Modified: ${formatDate(photo.modified)}
Type: ${photo.extension}
  `.trim();

  updateStatus(info);
}

/**
 * Update status bar
 */
function updateStatus(message) {
  const status = document.getElementById('status');
  if (status) {
    status.textContent = message;
  }
}

/**
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('gallery-container');
  if (container) {
    container.innerHTML = `<div class="error-message">${message}</div>`;
  }
  updateStatus(message);
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString();
}
