import { BrowserWindow, Notification, app, ipcMain } from 'electron';
import clickupService from '@core/clickup/service';
import {
  createSettingsWindow,
  createTaskDetailsWindow,
  createCreateEntryWindow,
  createCreateTimerWindow
} from '@core/electron/windows';

ipcMain.on('get-clickup-spaces', (event) => {
  clickupService
    .getCachedSpaces()
    .then((spaces) => event.reply('set-clickup-spaces', spaces))
    .catch((err) => event.reply('fetch-clickup-spaces-error', err));
});

ipcMain.on('refresh-clickup-spaces', (event) => {
  clickupService.clearCachedSpaces();
  clickupService
    .getCachedSpaces()
    .then((spaces) => event.reply('set-clickup-spaces', spaces))
    .catch((err) => event.reply('fetch-clickup-spaces-error', err));
});

ipcMain.on('get-clickup-folders', (event, space) => {
  clickupService
    .getCachedFolders(space)
    .then((folders) => event.reply('set-clickup-folders', folders))
    .catch((err) => event.reply('fetch-clickup-folders-error', err));
});

ipcMain.on('refresh-clickup-folders', (event, space) => {
  clickupService.clearCachedFolders();
  clickupService
    .getCachedFolders(space)
    .then((folders) => event.reply('set-clickup-folders', folders))
    .catch((err) => event.reply('fetch-clickup-folders-error', err));
});

ipcMain.on('get-clickup-lists', (event, folder) => {
  clickupService.clearCachedLists();
  clickupService
    .getCachedLists(folder)
    .then((lists) => event.reply('set-clickup-lists', lists))
    .catch((err) => event.reply('fetch-clickup-lists-error', err));
});

ipcMain.on('refresh-clickup-lists', (event, folder) => {
  clickupService.clearCachedLists();
  clickupService
    .getCachedLists(folder)
    .then((lists) => event.reply('set-clickup-lists', lists))
    .catch((err) => event.reply('fetch-clickup-lists-error', err));
});

ipcMain.on('get-clickup-tasks', (event, list) => {
  clickupService
    .getCachedTasks(list)
    .then((tasks) => event.reply('set-clickup-tasks', tasks))
    .catch((err) => event.reply('fetch-clickup-tasks-error', err));
});

ipcMain.on('refresh-clickup-tasks', (event, list) => {
  clickupService.clearCachedTasks();
  clickupService
    .getCachedTasks(list)
    .then((tasks) => event.reply('set-clickup-tasks', tasks))
    .catch((err) => event.reply('fetch-clickup-tasks-error', err));
});

ipcMain.on('get-clickup-tags', (event) => {
  clickupService
    .getCachedTags()
    .then((tags) => event.reply('set-clickup-tags', tags))
    .catch((err) => event.reply('fetch-clickup-tags-error', err));
});

ipcMain.on('refresh-clickup-tags', (event) => {
  clickupService.clearCachedTags();
  clickupService
    .getCachedTags()
    .then((tags) => event.reply('set-clickup-tags', tags))
    .catch((err) => event.reply('fetch-clickup-tags-error', err));
});

ipcMain.on('new-clickup-timer', (event) => {
  clickupService
    .startTimeTrackingEntry()
    .then((timer) => {
      global.currentTimerObserver.setTimer(timer);
      event.reply('set-clickup-timer', timer);
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('refresh-events');
      });
    })
    .catch((err) => event.reply('fetch-clickup-timer-error', err));
});

ipcMain.on('get-clickup-timer', (event) => {
  clickupService
    .currentTimeTrackingEntry()
    .then((timer) => {
      global.currentTimerObserver.setTimer(timer);
      event.reply('set-clickup-timer', timer);
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('refresh-events');
      });
    })
    .catch((err) => event.reply('fetch-clickup-timer-error', err));
});

ipcMain.on('stop-clickup-timer', (event) => {
  clickupService
    .stopTimeTrackingEntry()
    .then((timer) => {
      global.currentTimerObserver.resetTimer();
      event.reply('set-clickup-timer', null);
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('refresh-events');
      });
    })
    .catch((err) => event.reply('fetch-clickup-timer-error', err));
});

ipcMain.on('new-timer-created', () => {
  clickupService
    .currentTimeTrackingEntry()
    .then((timer) => {
      global.currentTimerObserver.setTimer(timer);
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('refresh-events');
        window.webContents.send('set-clickup-timer', timer);
      });
    })
    .catch((err) => event.reply('fetch-clickup-timer-error', err));
});

ipcMain.on('request-events-refresh', () => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('refresh-events');
  });
});

ipcMain.on('update-theme', () => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('update-theme');
  });
});

ipcMain.on('cancel-create', () => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('on-cancel-create');
  });
});

ipcMain.on('open-settings', () => {
  createSettingsWindow();
});

ipcMain.on('open-task-details', (event, { entry }) => {
  createTaskDetailsWindow(entry);
});

ipcMain.on('open-create-entry', (event, { entry }) => {
  createCreateEntryWindow(entry);
});

ipcMain.on('create-timer', (event) => {
  createCreateTimerWindow();
});

ipcMain.on('getPath', (event, path) => {
  event.returnValue = app.getPath(path);
});

ipcMain.on('sync', (event) => {
  //clickupService.sync();
});

ipcMain.on('reload', (event) => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.reload()
  });
});

ipcMain.on('quit-app', (event) => {
  app.quit();
});

ipcMain.handle('notification', (event, type, { title, content, duration }) => {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body: content ?? undefined
    }).show();
  }
});
