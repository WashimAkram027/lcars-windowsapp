import { ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

/**
 * Register all filesystem-related IPC handlers
 */
export function registerFilesystemHandlers() {
  // Get root view items: This PC, Gallery, other drives (not C:), Recent
  ipcMain.handle('fs:getDrives', async () => {
    try {
      const items = [];
      const homeDir = os.homedir();

      // Add "This PC" virtual folder
      items.push({
        name: 'This PC',
        path: '__THIS_PC__',
        type: 'special'
      });

      // Add Gallery (Pictures) folder - try multiple common paths
      const possiblePicturesPaths = [
        path.join(homeDir, 'Pictures'),
        path.join(homeDir, 'My Pictures'),
        path.join(homeDir, 'OneDrive', 'Pictures'),
        'C:\\Users\\Public\\Pictures'
      ];

      for (const picturesPath of possiblePicturesPaths) {
        try {
          await fs.access(picturesPath);
          const stats = await fs.stat(picturesPath);
          if (stats.isDirectory()) {
            items.push({
              name: 'Gallery',
              path: '__GALLERY__',
              type: 'special',
              realPath: picturesPath // Store actual path for reference
            });
            break; // Found one, stop looking
          }
        } catch {
          // Try next path
        }
      }

      if (process.platform !== 'win32') {
        // For non-Windows systems, return root directory
        items.push({ name: '/', path: '/', type: 'drive' });
        items.push({
          name: 'Recent',
          path: '__RECENT__',
          type: 'special'
        });
        return items;
      }

      // Windows: Get drives (excluding C:)
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      for (const letter of letters) {
        if (letter === 'C') continue; // Skip C: drive (it's in This PC)

        const drivePath = `${letter}:\\`;
        try {
          await fs.access(drivePath);
          const stats = await fs.stat(drivePath);
          items.push({
            name: `${letter}: Drive`,
            path: drivePath,
            type: 'drive'
          });
        } catch {
          // Drive doesn't exist or not accessible, skip it
        }
      }

      // Add Recent virtual folder
      items.push({
        name: 'Recent',
        path: '__RECENT__',
        type: 'special'
      });

      return items;
    } catch (error) {
      console.error('Error getting drives:', error);
      throw error;
    }
  });

  // Get recent files from Windows Recent folder
  ipcMain.handle('fs:getRecentFiles', async () => {
    try {
      const homeDir = os.homedir();
      const recentPath = path.join(homeDir, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Recent');

      // Check if Recent folder exists
      try {
        await fs.access(recentPath);
      } catch {
        console.log('Recent folder not found at:', recentPath);
        return [];
      }

      // Read Recent folder contents
      const entries = await fs.readdir(recentPath, { withFileTypes: true });
      const recentItems = [];

      for (const entry of entries) {
        try {
          const fullPath = path.join(recentPath, entry.name);
          const stats = await fs.stat(fullPath);

          // Skip folders and only process files
          if (entry.isFile()) {
            // Get file extension
            const ext = path.extname(entry.name).toLowerCase();

            // Clean up the display name (remove .lnk extension for shortcuts)
            let displayName = entry.name;
            if (ext === '.lnk') {
              displayName = entry.name.slice(0, -4); // Remove .lnk extension
            }

            recentItems.push({
              name: displayName,
              path: fullPath,
              type: 'file',
              size: stats.size,
              modified: stats.mtime.toISOString(),
              accessed: stats.atime.toISOString(),
              extension: ext,
              isShortcut: ext === '.lnk'
            });
          }
        } catch (err) {
          // Skip files we can't access
          console.warn(`Skipping ${entry.name}:`, err.message);
        }
      }

      // Sort by access time (most recently accessed first)
      recentItems.sort((a, b) => {
        return new Date(b.accessed) - new Date(a.accessed);
      });

      // Return top 100 most recent files
      return recentItems.slice(0, 100);

    } catch (error) {
      console.error('Error getting recent files:', error);
      throw error;
    }
  });

  // Get recent photos from Pictures folder (recursive search)
  ipcMain.handle('fs:getRecentPhotos', async () => {
    try {
      const homeDir = os.homedir();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.heic', '.heif'];

      // Find Pictures folder
      const possiblePicturesPaths = [
        path.join(homeDir, 'Pictures'),
        path.join(homeDir, 'My Pictures'),
        path.join(homeDir, 'OneDrive', 'Pictures')
      ];

      let picturesPath = null;
      for (const testPath of possiblePicturesPaths) {
        try {
          await fs.access(testPath);
          const stats = await fs.stat(testPath);
          if (stats.isDirectory()) {
            picturesPath = testPath;
            break;
          }
        } catch {
          // Try next path
        }
      }

      if (!picturesPath) {
        return []; // No Pictures folder found
      }

      // Recursively find all image files
      const imageFiles = [];

      async function scanDirectory(dirPath, depth = 0) {
        // Limit recursion depth to avoid going too deep
        if (depth > 5) return;

        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });

          for (const entry of entries) {
            try {
              const fullPath = path.join(dirPath, entry.name);

              if (entry.isDirectory()) {
                // Skip hidden folders and common system folders
                if (!entry.name.startsWith('.') &&
                    !entry.name.startsWith('$') &&
                    entry.name.toLowerCase() !== 'thumbs') {
                  await scanDirectory(fullPath, depth + 1);
                }
              } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (imageExtensions.includes(ext)) {
                  const stats = await fs.stat(fullPath);
                  imageFiles.push({
                    name: entry.name,
                    path: fullPath,
                    type: 'file',
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    extension: ext
                  });
                }
              }
            } catch (err) {
              // Skip files/folders we can't access
            }
          }
        } catch (err) {
          // Skip directories we can't read
        }
      }

      await scanDirectory(picturesPath);

      // Sort by modification date (newest first)
      imageFiles.sort((a, b) => {
        return new Date(b.modified) - new Date(a.modified);
      });

      // Return top 100 most recent photos
      return imageFiles.slice(0, 100);

    } catch (error) {
      console.error('Error getting recent photos:', error);
      throw error;
    }
  });

  // Get "This PC" contents: C: drive, Desktop, Documents, Pictures
  ipcMain.handle('fs:getThisPC', async () => {
    try {
      const items = [];
      const homeDir = os.homedir();

      // Add C: drive
      try {
        await fs.access('C:\\');
        items.push({
          name: 'C: (Local Disk)',
          path: 'C:\\',
          type: 'drive'
        });
      } catch {
        // C: drive not accessible
      }

      // Add Desktop
      const desktopPath = path.join(homeDir, 'Desktop');
      try {
        await fs.access(desktopPath);
        items.push({
          name: 'Desktop',
          path: desktopPath,
          type: 'directory'
        });
      } catch {
        // Desktop not accessible
      }

      // Add Documents
      const documentsPath = path.join(homeDir, 'Documents');
      try {
        await fs.access(documentsPath);
        items.push({
          name: 'Documents',
          path: documentsPath,
          type: 'directory'
        });
      } catch {
        // Documents not accessible
      }

      // Add Pictures
      const possiblePicturesPaths = [
        path.join(homeDir, 'Pictures'),
        path.join(homeDir, 'My Pictures'),
        path.join(homeDir, 'OneDrive', 'Pictures')
      ];

      for (const picturesPath of possiblePicturesPaths) {
        try {
          await fs.access(picturesPath);
          const stats = await fs.stat(picturesPath);
          if (stats.isDirectory()) {
            items.push({
              name: 'Pictures',
              path: picturesPath,
              type: 'directory'
            });
            break;
          }
        } catch {
          // Try next path
        }
      }

      return items;
    } catch (error) {
      console.error('Error getting This PC:', error);
      throw error;
    }
  });

  // List directory contents
  ipcMain.handle('fs:listDirectory', async (event, dirPath) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const items = [];

      for (const entry of entries) {
        try {
          const fullPath = path.join(dirPath, entry.name);
          const stats = await fs.stat(fullPath);

          items.push({
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime.toISOString(),
            isHidden: entry.name.startsWith('.'),
            extension: entry.isFile() ? path.extname(entry.name) : null
          });
        } catch (err) {
          // Skip files that can't be accessed (permissions, etc.)
          console.warn(`Skipping ${entry.name}:`, err.message);
        }
      }

      // Sort: directories first, then files, alphabetically
      items.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        }
        return a.type === 'directory' ? -1 : 1;
      });

      return items;
    } catch (error) {
      console.error('Error listing directory:', error);
      throw error;
    }
  });

  // Get file/directory info
  ipcMain.handle('fs:getInfo', async (event, itemPath) => {
    try {
      const stats = await fs.stat(itemPath);
      const info = {
        path: itemPath,
        name: path.basename(itemPath),
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString()
      };

      if (stats.isFile()) {
        info.extension = path.extname(itemPath);
      }

      return info;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  });

  // Get parent directory path
  ipcMain.handle('fs:getParent', async (event, currentPath) => {
    try {
      const parentPath = path.dirname(currentPath);

      // Don't go above drive root on Windows
      if (process.platform === 'win32') {
        if (parentPath === currentPath) {
          return null; // Already at root
        }
      }

      return parentPath;
    } catch (error) {
      console.error('Error getting parent directory:', error);
      throw error;
    }
  });

  // Get user's home directory
  ipcMain.handle('fs:getHomeDir', async () => {
    try {
      return os.homedir();
    } catch (error) {
      console.error('Error getting home directory:', error);
      throw error;
    }
  });

  // Check if path exists and is accessible
  ipcMain.handle('fs:exists', async (event, itemPath) => {
    try {
      await fs.access(itemPath);
      return true;
    } catch {
      return false;
    }
  });
}
