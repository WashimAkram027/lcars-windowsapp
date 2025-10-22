# LCARS Windows Overlay

A Star Trek LCARS-inspired desktop overlay application built with Electron. This project provides a futuristic interface for interacting with your Windows system, featuring file system access, media gallery, network monitoring, and system information.

## What is LCARS?

LCARS (Library Computer Access/Retrieval System) is the iconic computer interface from Star Trek: The Next Generation and subsequent series. This project aims to bring that futuristic aesthetic to your desktop as an overlay application.

## Project Structure

```
lcars-windowsapp/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── app.js           # Application entry point
│   │   └── windows.js       # Window management
│   ├── preload/             # Preload scripts (secure bridge)
│   │   └── index.js         # API exposure to renderer
│   └── renderer/            # Frontend UI (HTML/CSS/JS)
│       ├── index.html       # Home page
│       ├── filesystem.html  # File system browser
│       ├── gallery.html     # Media gallery
│       ├── about.html       # System information
│       └── network.html     # Network monitoring
├── package.json             # Project dependencies
├── package-lock.json        # Dependency lock file
└── .gitignore              # Git ignore rules
```

## Architecture

This application follows Electron's three-process architecture:

- **Main Process** (`src/main/`): Node.js backend that manages application lifecycle and window creation
- **Preload Scripts** (`src/preload/`): Secure bridge between main and renderer processes using Context Isolation
- **Renderer Process** (`src/renderer/`): Frontend UI built with HTML/CSS

## Current Features

This is a skeleton/starter project with the following foundation:

- ✅ Frameless, always-on-top window (overlay mode)
- ✅ Single instance lock (prevents multiple app instances)
- ✅ Secure architecture (Context Isolation, Sandbox enabled)
- ✅ Content Security Policy (CSP) implementation
- ✅ Navigation between placeholder pages
- ✅ ES6 module support throughout

### Planned Pages

1. **Home** - Main navigation hub
2. **File System** - Browse and interact with local files
3. **Gallery** - View images and media
4. **About** - System and application information
5. **Network** - Network status and connectivity monitoring

## Requirements

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Operating System**: Windows (primary target), macOS, Linux (compatible)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lcars-windowsapp
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Electron v38.4.0
- All required dependencies

### 3. Run the Application

```bash
npm run dev
```

The LCARS overlay window will open on your desktop.

## Available Scripts

- **`npm run dev`** - Start the Electron application in development mode
- **`npm run clean`** - Clean the project (removes node_modules and build artifacts)

## Security Features

This project implements Electron security best practices:

- **Context Isolation**: Enabled to prevent renderer process from accessing Node.js APIs directly
- **Node Integration**: Disabled in renderer process
- **Sandbox**: Enabled for additional security
- **Content Security Policy**: Restricts resource loading to prevent XSS attacks
- **Preload Script**: Provides controlled API exposure through `contextBridge`

## Development Status

⚠️ **Current Status**: Early development / Skeleton phase

This project currently consists of:
- Basic application structure
- Placeholder pages with minimal styling
- Security foundation
- No functional features yet (API methods are placeholders)

## Window Configuration

The main window is configured as:
- **Size**: 1200x800 pixels
- **Frame**: Frameless (no title bar or borders)
- **Always on Top**: Stays above other windows
- **Transparent**: Currently disabled (can be enabled for HUD effect)

## Next Steps

Future development will include:
- LCARS-themed UI design (colors, fonts, layouts)
- IPC (Inter-Process Communication) implementation
- Real functionality for file system browsing
- Network monitoring capabilities
- System information display
- Media gallery with image/video support


