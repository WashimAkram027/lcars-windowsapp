/**
 * LCARS Terminal - Command execution interface
 */

const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const currentDirDisplay = document.getElementById('current-dir');
const promptDisplay = document.getElementById('prompt');
const clearBtn = document.getElementById('clear-btn');

// Command history
let commandHistory = [];
let historyIndex = -1;
let networkRefreshInterval = null;

// Initialize terminal
document.addEventListener('DOMContentLoaded', async () => {
  await updateCwd();
  terminalInput.focus();
  await checkNetworkConnection();
  startNetworkAutoRefresh();
});

/**
 * Check internet connection and update network status indicator
 */
async function checkNetworkConnection() {
  try {
    const result = await window.api.net.checkConnection();
    updateNetworkStatus(result.connected);
  } catch (error) {
    console.error('Error checking connection:', error);
    updateNetworkStatus(false);
  }
}

/**
 * Update the network status indicator
 */
function updateNetworkStatus(isConnected) {
  const icon = document.querySelector('.network-status-icon');
  const valueText = document.querySelector('.network-status-value');

  if (!icon || !valueText) return;

  if (isConnected) {
    icon.innerHTML = '<img src="src/images/Connected.gif" alt="Connected" style="width: 100%; height: 100%; border-radius: 50%;">';
    valueText.textContent = 'Connected';
  } else {
    icon.innerHTML = '<img src="src/images/DisconnectionSymbol.gif" alt="Disconnected" style="width: 100%; height: 100%; border-radius: 50%;">';
    valueText.textContent = 'Disconnected';
  }
}

/**
 * Start auto-refresh timer for network status
 */
function startNetworkAutoRefresh() {
  networkRefreshInterval = setInterval(async () => {
    await checkNetworkConnection();
  }, 1000);
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (networkRefreshInterval) {
    clearInterval(networkRefreshInterval);
  }
});

// Update current working directory display
async function updateCwd() {
  try {
    const cwd = await window.api.terminal.getCwd();
    currentDirDisplay.textContent = cwd;
    promptDisplay.textContent = `${cwd}>`;
  } catch (error) {
    console.error('Error getting cwd:', error);
  }
}

// Add output to terminal
function addOutput(text, className = 'output-text') {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text;
  terminalOutput.appendChild(div);
  scrollToBottom();
}

// Add command line to output
function addCommandLine(command) {
  const cwd = currentDirDisplay.textContent;
  addOutput(`${cwd}> ${command}`, 'command-line');
}

// Scroll to bottom of output
function scrollToBottom() {
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Execute command
async function executeCommand(command) {
  if (!command.trim()) return;

  // Add to history
  commandHistory.push(command);
  historyIndex = commandHistory.length;

  // Display the command
  addCommandLine(command);

  // Handle built-in commands
  const lowerCommand = command.toLowerCase().trim();

  if (lowerCommand === 'clear' || lowerCommand === 'cls') {
    terminalOutput.innerHTML = '';
    addOutput('Terminal cleared.');
    await updateCwd();
    return;
  }

  if (lowerCommand === 'help') {
    addOutput('Available Commands:', 'output-text');
    addOutput('  help     - Show this help message', 'output-text');
    addOutput('  clear    - Clear the terminal screen', 'output-text');
    addOutput('  cls      - Clear the terminal screen', 'output-text');
    addOutput('  cd <dir> - Change directory', 'output-text');
    addOutput('  dir      - List directory contents', 'output-text');
    addOutput('  pwd      - Print working directory', 'output-text');
    addOutput('  exit     - Close terminal (go to home)', 'output-text');
    addOutput('', 'output-text');
    addOutput('You can also run any Windows command.', 'output-text');
    return;
  }

  if (lowerCommand === 'exit') {
    window.location.href = './home.html';
    return;
  }

  if (lowerCommand === 'pwd') {
    addOutput(currentDirDisplay.textContent);
    return;
  }

  // Execute command via IPC
  try {
    const result = await window.api.terminal.execute(command);

    if (result.output) {
      // Split output into lines and add each
      const lines = result.output.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          addOutput(line, result.success ? 'output-text' : 'error-text');
        }
      });
    }

    // Update current directory (in case of cd command)
    if (result.cwd) {
      currentDirDisplay.textContent = result.cwd;
      promptDisplay.textContent = `${result.cwd}>`;
    }

  } catch (error) {
    addOutput(`Error: ${error.message}`, 'error-text');
  }
}

// Handle input
terminalInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const command = terminalInput.value;
    terminalInput.value = '';
    await executeCommand(command);
  }

  // Command history navigation
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      terminalInput.value = commandHistory[historyIndex];
    }
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      terminalInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      terminalInput.value = '';
    }
  }
});

// Clear button
clearBtn.addEventListener('click', () => {
  terminalOutput.innerHTML = '';
  addOutput('Terminal cleared.');
  terminalInput.focus();
});

// Keep focus on input
terminalOutput.addEventListener('click', () => {
  terminalInput.focus();
});
