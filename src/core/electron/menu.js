import { app, Menu, shell, BrowserWindow } from 'electron';
import {
  createSettingsWindow,
  createCreateTimerWindow
} from '@core/electron/windows';
import { stopTimeTrackingEntry } from '@core/helpers/electron';
import updater from '@core/electron/updater';
import i18next from '@core/i18n';
const i18n = i18next.init();

export default class MenuBuilder {
  mainWindow;

  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    global.currentTimerObserver.on('change', (timer) => {
      this.buildMenu();
    });
  }

  async buildMenu() {
    await i18n.changeLanguage(app.getLocale() ?? 'en');

    const template = this.buildTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  buildTemplate() {
    const subMenuAbout = {
      label: app.getName(),
      submenu: [
        {
          label: i18n.t('menu.about', { name: app.getName() }),
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        {
          label: i18n.t('menu.settings'),
          accelerator: 'Command+,',
          click() {
            createSettingsWindow();
          }
        },
        {
          label: i18n.t('menu.checkUpdate'),
          click: async (menuItem) => {
            await updater.checkForUpdates(menuItem);
          }
        },
        { type: 'separator' },
        {
          label: i18n.t('menu.hide', { name: app.getName() }),
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: i18n.t('menu.hideOthers'),
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        { label: i18n.t('menu.showAll'), selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: i18n.t('menu.quit'),
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    };
    const subMenuEdit = {
      label: i18n.t('menu.edit'),
      submenu: [
        {
          label: i18n.t('menu.undo'),
          accelerator: 'Command+Z',
          selector: 'undo:'
        },
        {
          label: i18n.t('menu.redo'),
          accelerator: 'Shift+Command+Z',
          selector: 'redo:'
        },
        { type: 'separator' },
        {
          label: i18n.t('menu.cut'),
          accelerator: 'Command+X',
          selector: 'cut:'
        },
        {
          label: i18n.t('menu.copy'),
          accelerator: 'Command+C',
          selector: 'copy:'
        },
        {
          label: i18n.t('menu.paste'),
          accelerator: 'Command+V',
          selector: 'paste:'
        },
        {
          label: i18n.t('menu.selectAll'),
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    };
    const subMenuTimer = {
      label: i18n.t('menu.timer'),
      submenu: [
        {
          label: i18n.t('menu.startTimer'),
          accelerator: 'CommandOrControl+N',
          click: () => {
            createCreateTimerWindow();
          }
        },
        {
          id: 'stop-timer',
          label: i18n.t('menu.stopTimer'),
          accelerator: 'CommandOrControl+S',
          enabled: !!global.currentTimerObserver?.getTimer(),
          click: () => {
            stopTimeTrackingEntry();
          }
        }
      ]
    };
    const subMenuTimeTracker = {
      label: i18n.t('menu.timeTracker'),
      submenu: [
        {
          label: i18n.t('menu.openSelected'),
          accelerator: 'CommandOrControl+O',
          click: () => {
            global.windows
              .get('main')
              ?.webContents.send('detail-selected-entry');
          }
        },
        {
          label: i18n.t('menu.duplicateSelected'),
          accelerator: 'CommandOrControl+D',
          click: () => {
            global.windows
              .get('main')
              ?.webContents.send('duplicate-selected-entry');
          }
        },
        {
          label: i18n.t('menu.deleteSelected'),
          accelerator: 'CommandOrControl+Backspace',
          click: () => {
            global.windows
              .get('main')
              ?.webContents.send('delete-selected-entry');
          }
        }
      ]
    };
    const subMenuViewDev = {
      label: i18n.t('menu.view'),
      submenu: [
        {
          label: i18n.t('menu.reload'),
          accelerator: 'Command+R',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.reload();
          }
        },
        {
          label: i18n.t('menu.toggleFullScreen'),
          accelerator: 'Ctrl+Command+F',
          click: () => {
            BrowserWindow.getFocusedWindow().setFullScreen(
              !BrowserWindow.getFocusedWindow().isFullScreen()
            );
          }
        },
        {
          label: i18n.t('menu.toggleDevTools'),
          accelerator: 'Alt+Command+I',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: i18n.t('menu.view'),
      submenu: [
        {
          label: i18n.t('menu.reload'),
          accelerator: 'Command+R',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.reload();
          }
        },
        {
          label: i18n.t('menu.toggleFullScreen'),
          accelerator: 'Ctrl+Command+F',
          click: () => {
            BrowserWindow.getFocusedWindow().setFullScreen(
              !BrowserWindow.getFocusedWindow().isFullScreen()
            );
          }
        }
      ]
    };
    const subMenuWindow = {
      label: i18n.t('menu.window'),
      role: 'windowMenu'
    };
    const subMenuHelp = {
      label: i18n.t('menu.help'),
      submenu: [
        {
          label: i18n.t('menu.publicRepo'),
          click: async () =>
            await shell.openExternal(
              'https://github.com/arnaud-ritti/clickup-timer'
            )
        },
        {
          label: i18n.t('menu.sponsorMe'),
          click: async () =>
            await shell.openExternal('https://ko-fi.com/arnaudritti')
        }
      ]
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd;

    return process.platform === 'darwin'
      ? [
          subMenuAbout,
          subMenuEdit,
          subMenuTimer,
          subMenuTimeTracker,
          subMenuView,
          subMenuWindow,
          subMenuHelp
        ]
      : [
          subMenuEdit,
          subMenuTimer,
          subMenuTimeTracker,
          subMenuView,
          subMenuWindow,
          subMenuHelp
        ];
  }
}
