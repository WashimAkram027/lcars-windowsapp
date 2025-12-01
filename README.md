# LCARS Windows Overlay

A Star Trek LCARS-inspired desktop overlay application built with Electron. This project provides a futuristic interface for interacting with your Windows system, featuring file system access, media gallery, network monitoring, and system information.

## What is LCARS?

LCARS (Library Computer Access/Retrieval System) is the iconic computer interface from Star Trek: The Next Generation and subsequent series. This project aims to bring that futuristic aesthetic to your desktop as an overlay application.

## Project Structure

```
lcars-windowsapp/
├── src/
│   ├── main/                    # Electron main process (Node.js backend)
│   │   ├── app.js              # Application entry point & IPC registration
│   │   ├── windows.js          # Window management
│   │   ├── filesystem.js       # File system operations handler
│   │   ├── network.js          # Network monitoring handler
│   │   └── system.js           # System information handler
│   ├── preload/                # Preload scripts (secure bridge)
│   │   └── index.js            # API exposure to renderer (window.api)
│   └── renderer/               # Frontend UI (HTML/CSS/JS)
│       ├── home.html           # Home page with LCARS design
│       ├── filesystem.html     # File system browser
│       ├── filesystem.js       # File browser client logic
│       ├── gallery.html        # Photo gallery
│       ├── gallery.js          # Gallery client logic
│       ├── about.html          # System information page
│       ├── about.js            # System info client logic
│       ├── network.html        # Network monitoring page
│       ├── network.js          # Network client logic
│       └── src/images/         # UI assets (enterprise, startup gifs)
├── package.json                # Project dependencies
├── package-lock.json           # Dependency lock file
├── README.md                   # This file
└── .gitignore                  # Git ignore rules
```

## Architecture

This application follows Electron's three-process architecture:

- **Main Process** (`src/main/`): Node.js backend that manages application lifecycle and window creation
- **Preload Scripts** (`src/preload/`): Secure bridge between main and renderer processes using Context Isolation
- **Renderer Process** (`src/renderer/`): Frontend UI built with HTML/CSS

## Current Features

### Core Functionality ✅

- ✅ **LCARS-themed UI** - Full Star Trek-inspired interface design
- ✅ **Frameless overlay window** - Always-on-top, 1200x800 frameless window
- ✅ **Single instance lock** - Prevents multiple app instances
- ✅ **Secure architecture** - Context Isolation, Sandbox enabled, CSP headers
- ✅ **IPC Communication** - Full main-renderer process communication

### Implemented Pages

1. **Home** (`home.html`)
   - Main navigation hub with LCARS design
   - Network status indicator (clickable)
   - Navigation to all other pages

2. **File System** (`filesystem.html`)
   - Browse local drives and directories
   - Navigate directory tree
   - View file/folder information
   - File size and modification dates

3. **Gallery** (`gallery.html`)
   - Recent photos from Pictures folder
   - Photo grid display with metadata
   - Click for detailed photo information

4. **About** (`about.html`)
   - Device specifications (CPU, RAM, system type)
   - OS information (edition, version, build)
   - System status (uptime, memory usage)
   - Application version and runtime info

5. **Network** (`network.html`)
   - Real-time internet connection status
   - Network interface information (IP addresses)
   - Auto-refresh every 10 seconds
   - DNS and HTTPS connectivity checks

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

## Git Workflow

This repository uses a multi-branch development strategy to keep the main branch stable.

### Branch Structure

```
main          ← Stable, production-ready code
├── washim-dev   ← Washim's development branch
└── chase-dev    ← Chase's development branch (UI/Design)
```

### Working with Your Development Branch

#### **For Washim (Backend & Integration)**

**Switch to your branch:**
```bash
git checkout washim-dev
```

**Pull latest changes:**
```bash
git pull origin washim-dev
```

**Make changes, then commit and push:**
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin washim-dev
```

#### **For Chase (UI & Design)**

**Switch to your branch:**
```bash
git checkout chase-dev
```

**Pull latest changes:**
```bash
git pull origin chase-dev
```

**Make changes, then commit and push:**
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin chase-dev
```

### Merging to Main

When your feature is ready:

1. **Create a Pull Request** on GitHub from your dev branch to `main`
2. **Request review** from team members
3. **Merge** after approval (this keeps main stable)

**Quick PR Links:**
- Washim: https://github.com/WashimAkram027/lcars-windowsapp/pull/new/washim-dev
- Chase: https://github.com/WashimAkram027/lcars-windowsapp/pull/new/chase-dev

### Syncing with Main

To get latest changes from main into your dev branch:

```bash
git checkout washim-dev  # or chase-dev
git pull origin main      # Pull latest from main
git push origin washim-dev  # Push merged changes
```

## Security Features

This project implements Electron security best practices:

- **Context Isolation**: Enabled to prevent renderer process from accessing Node.js APIs directly
- **Node Integration**: Disabled in renderer process
- **Sandbox**: Enabled for additional security
- **Content Security Policy**: Restricts resource loading to prevent XSS attacks
- **Preload Script**: Provides controlled API exposure through `contextBridge`

## Development Status

✅ **Current Status**: Active Development - Core Features Implemented

This project now includes:
- ✅ Full LCARS UI design and theming
- ✅ Working backend modules (filesystem, network, system info)
- ✅ IPC communication between main and renderer processes
- ✅ All core pages functional with live data
- ⚠️ Network status on home page (placeholder - needs real-time implementation)

### Collaborators

- **Washim Akram** - Backend development, integration, architecture
- **Chase (CloggedOsprey4)** - UI/UX design, LCARS interface implementation

## Window Configuration

The main window is configured as:
- **Size**: 1200x800 pixels
- **Frame**: Frameless (no title bar or borders)
- **Always on Top**: Stays above other windows
- **Transparent**: Currently disabled (can be enabled for HUD effect)

## Next Steps

Planned enhancements:
- 🔄 Real-time network status on home page
- 🎨 Additional LCARS UI polish and animations
- 🖼️ Image thumbnail support in gallery
- 📁 Enhanced file operations (copy, move, delete)
- ⚙️ User settings and preferences
- 🎯 Custom hotkeys for show/hide overlay
- 📦 Build and packaging for Windows installer


