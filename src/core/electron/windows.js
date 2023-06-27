import { BrowserWindow } from 'electron';
import MenuBuilder from '@core/electron/menu';
import TouchBarBuilder from '@core/electron/touchbar';

export async function createWindow() {
  if (global.windows.has('main')) {
    const window = global.windows.get('main');
    window.show();
    window.focus();
    return window;
  }

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    titleBarStyle: 'hiddenInset',
    icon: './src/assets/images/icon/icon.png',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  require('@electron/remote/main').enable(mainWindow.webContents);

  mainWindow.on('closed', () => {
    global.windows.delete('main');
  });

  await new MenuBuilder(mainWindow).buildMenu();
  await new TouchBarBuilder(mainWindow).buildTouchBar();

  global.windows.set('main', mainWindow);

  return mainWindow;
}

export function createSettingsWindow() {
  if (global.windows.has('settings')) {
    const window = global.windows.get('settings');
    window.show();
    window.focus();
    return window;
  }

  const mainWindow = new BrowserWindow({
    width: 480,
    maxWidth: 480,
    minWidth: 480,
    height: 760,
    minHeight: 760,
    titleBarStyle: 'hiddenInset',
    modal: true,
    center: true,
    title: '',
    fullscreenable: false,
    maximizable: false,
    icon: './src/assets/images/icon/icon.png',
    webPreferences: {
      preload: SETTINGS_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  mainWindow.loadURL(SETTINGS_WINDOW_WEBPACK_ENTRY);
  require('@electron/remote/main').enable(mainWindow.webContents);

  mainWindow.on('closed', () => {
    global.windows.delete('settings');
  });

  global.windows.set('settings', mainWindow);

  return mainWindow;
}

export function createTaskDetailsWindow(entry) {
  if (global.windows.has(`details:${entry}`)) {
    const window = global.windows.get(`details:${entry}`);
    window.show();
    window.focus();
    return window;
  }

  const mainWindow = new BrowserWindow({
    width: 720,
    maxWidth: 1024,
    minWidth: 720,
    height: 480,
    minHeight: 480,
    titleBarStyle: 'hiddenInset',
    modal: true,
    center: true,
    title: '',
    fullscreenable: false,
    maximizable: false,
    icon: './src/assets/images/icon/icon.png',
    webPreferences: {
      preload: DETAILS_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  mainWindow.loadURL(`${DETAILS_WINDOW_WEBPACK_ENTRY}?entryId=${entry.id}`);
  require('@electron/remote/main').enable(mainWindow.webContents);

  mainWindow.on('closed', () => {
    global.windows.delete(`details:${entry}`);
  });

  global.windows.set(`details:${entry}`, mainWindow);

  return mainWindow;
}

export function createCreateEntryWindow(entry) {
  if (global.windows.has('create')) {
    const window = global.windows.get('create');
    window.show();
    window.focus();
    return window;
  }

  const mainWindow = new BrowserWindow({
    width: 1024,
    maxWidth: 1280,
    minWidth: 720,
    height: 450,
    minHeight: 450,
    titleBarStyle: 'hiddenInset',
    modal: true,
    center: true,
    title: '',
    fullscreenable: false,
    maximizable: false,
    icon: './src/assets/images/icon/icon.png',
    webPreferences: {
      preload: CREATE_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  mainWindow.loadURL(`${CREATE_WINDOW_WEBPACK_ENTRY}`).then(() => {
    mainWindow.webContents.send('new-event', entry);
  });

  require('@electron/remote/main').enable(mainWindow.webContents);

  mainWindow.on('closed', () => {
    global.windows.delete('create');
  });

  global.windows.set('create', mainWindow);

  return mainWindow;
}

export function createCreateTimerWindow() {
  if (global.windows.has('timer')) {
    const window = global.windows.get('timer');
    window.show();
    window.focus();
    return window;
  }

  const mainWindow = new BrowserWindow({
    width: 1024,
    maxWidth: 1280,
    minWidth: 720,
    height: 450,
    minHeight: 450,
    titleBarStyle: 'hiddenInset',
    modal: true,
    center: true,
    title: '',
    fullscreenable: false,
    maximizable: false,
    icon: './src/assets/images/icon/icon.png',
    webPreferences: {
      preload: TIMER_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  mainWindow.loadURL(`${TIMER_WINDOW_WEBPACK_ENTRY}`);
  require('@electron/remote/main').enable(mainWindow.webContents);

  mainWindow.on('closed', () => {
    global.windows.delete('timer');
  });

  global.windows.set('timer', mainWindow);

  return mainWindow;
}
