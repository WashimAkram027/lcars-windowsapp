import { BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,             // hide until maximized
    frame: true,             // native window controls (minimize, maximize, close)
    transparent: false,      // set true later if you want HUD
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Load the Home page
  await win.loadFile(path.join(__dirname, '../renderer/home.html'));

  // Maximize and show the window
  win.maximize();
  win.show();

  // Optional: devtools while developing
  // win.webContents.openDevTools({ mode: 'detach' });

  return win;
}
