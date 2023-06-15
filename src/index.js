import {
  app,
  protocol,
  BrowserWindow,
  globalShortcut,
  ipcMain
} from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import currentTimerObserver from '@core/electron/currentTimerObserver';
import updater from '@core/electron/updater';
import TrayBuilder from '@core/electron/tray';
import { createWindow, createCreateTimerWindow } from '@core/electron/windows';
import { stopTimeTrackingEntry } from '@core/helpers/electron';
import { mainBindings, clearMainBindings } from '@core/i18n/backend';
import fs from 'fs';

global.mainWindow = null;
global.share = { app, ipcMain };
global.windows = new Map();
global.currentTimerObserver = currentTimerObserver;

require('@electron/remote/main').initialize();
require('@core/electron/ipc');

if (require('electron-squirrel-startup')) {
  app.quit();
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'clickup-timer', privileges: { secure: true, standard: true } }
]);

const isProduction = process.env.NODE_ENV === 'production';
const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isProduction) {
  require('source-map-support').install();
}

app.setAboutPanelOptions({
  applicationName: app.name
});

app.on('ready', async () => {
  if (isDebug) {
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }

  globalShortcut.register('Shift+CommandOrControl+N', createCreateTimerWindow);
  globalShortcut.register('Shift+CommandOrControl+S', stopTimeTrackingEntry);

  clearMainBindings(ipcMain);
  mainBindings(ipcMain, fs);

  await new TrayBuilder().buildTray();

  await createWindow();

  await updater.checkForUpdates();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

app.on('will-quit', () => {
  clearMainBindings(ipcMain);
  globalShortcut.unregisterAll();
});

if (isDebug) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
