import { ipcMain } from 'electron';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';

let currentDirectory = os.homedir();

export function registerTerminalHandlers() {
  // Execute a command
  ipcMain.handle('terminal:execute', async (event, command) => {
    return new Promise((resolve) => {
      // Handle cd command specially to track directory changes
      const cdMatch = command.match(/^cd\s+(.+)$/i);
      if (cdMatch) {
        const newDir = cdMatch[1].trim().replace(/"/g, '');
        let targetDir;

        if (path.isAbsolute(newDir)) {
          targetDir = newDir;
        } else if (newDir === '..') {
          targetDir = path.dirname(currentDirectory);
        } else if (newDir === '~') {
          targetDir = os.homedir();
        } else {
          targetDir = path.join(currentDirectory, newDir);
        }

        // Check if directory exists
        exec(`cd /d "${targetDir}" && cd`, { shell: 'cmd.exe' }, (error, stdout) => {
          if (!error) {
            currentDirectory = stdout.trim() || targetDir;
            resolve({
              success: true,
              output: '',
              cwd: currentDirectory
            });
          } else {
            resolve({
              success: false,
              output: `The system cannot find the path specified: ${targetDir}`,
              error: error.message,
              cwd: currentDirectory
            });
          }
        });
        return;
      }

      // Execute other commands in current directory
      exec(command, {
        shell: 'cmd.exe',
        cwd: currentDirectory,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          output: stdout || stderr || (error ? error.message : ''),
          error: error ? error.message : null,
          cwd: currentDirectory
        });
      });
    });
  });

  // Get current working directory
  ipcMain.handle('terminal:getCwd', () => currentDirectory);

  // Clear and reset directory
  ipcMain.handle('terminal:reset', () => {
    currentDirectory = os.homedir();
    return currentDirectory;
  });
}
