const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow = null;
let floatingButton = null;
let tray = null;
let isLoggedIn = false;

// Configuration
const API_URL = store.get('apiUrl', 'http://localhost:3000');
const BUTTON_SIZE = 56;
const POPUP_WIDTH = 360;
const POPUP_HEIGHT = 400;

function createFloatingButton() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Get saved position or default to bottom-right
  const savedPosition = store.get('buttonPosition', {
    x: width - BUTTON_SIZE - 20,
    y: height - BUTTON_SIZE - 20
  });

  floatingButton = new BrowserWindow({
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    x: savedPosition.x,
    y: savedPosition.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  floatingButton.loadFile(path.join(__dirname, 'floating-button.html'));
  floatingButton.setVisibleOnAllWorkspaces(true);

  // Make it draggable but save position
  floatingButton.on('moved', () => {
    const [x, y] = floatingButton.getPosition();
    store.set('buttonPosition', { x, y });
  });
}

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  const buttonBounds = floatingButton.getBounds();

  mainWindow = new BrowserWindow({
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
    x: buttonBounds.x - POPUP_WIDTH + BUTTON_SIZE,
    y: buttonBounds.y - POPUP_HEIGHT - 10,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'popup.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Create a simple tray icon
  const icon = nativeImage.createFromDataURL(`data:image/png;base64,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`);

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Apri',
      click: () => {
        createMainWindow();
      }
    },
    {
      label: 'Impostazioni',
      click: () => {
        // Open settings
      }
    },
    { type: 'separator' },
    {
      label: 'Esci',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Allos WorkField Agent');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    createMainWindow();
  });
}

// IPC handlers
ipcMain.on('toggle-popup', () => {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    createMainWindow();
  }
});

ipcMain.on('close-popup', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
});

ipcMain.on('save-note', async (event, noteData) => {
  try {
    const token = store.get('authToken');
    if (!token) {
      event.reply('note-saved', { error: 'Non autenticato' });
      return;
    }

    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(noteData)
    });

    const result = await response.json();
    event.reply('note-saved', result);
  } catch (error) {
    event.reply('note-saved', { error: error.message });
  }
});

ipcMain.on('login', async (event, credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (response.ok) {
      isLoggedIn = true;
      store.set('credentials', credentials);
      event.reply('login-result', { success: true });
    } else {
      event.reply('login-result', { success: false, error: 'Credenziali non valide' });
    }
  } catch (error) {
    event.reply('login-result', { success: false, error: error.message });
  }
});

ipcMain.on('get-settings', (event) => {
  event.reply('settings', {
    apiUrl: store.get('apiUrl', 'http://localhost:3000'),
    isLoggedIn: isLoggedIn
  });
});

ipcMain.on('save-settings', (event, settings) => {
  store.set('apiUrl', settings.apiUrl);
  event.reply('settings-saved');
});

app.whenReady().then(() => {
  createFloatingButton();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createFloatingButton();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevent app from closing when all windows are closed (stay in tray)
app.on('before-quit', () => {
  isLoggedIn = false;
});
