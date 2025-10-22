import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { createMainWindow } from './windows.js';

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on('ready', async () => {
  await createMainWindow();
});

app.on('second-instance', () => {
  // Focus the window if a second instance is started
  const all = BrowserWindow.getAllWindows();
  if (all[0]) {
    if (all[0].isMinimized()) all[0].restore();
    all[0].focus();
  }
});

app.on('window-all-closed', () => {
  // On Windows it's fine to quit when all windows are closed
  app.quit();
});
