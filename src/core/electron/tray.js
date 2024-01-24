import { app, Menu, Tray, nativeImage } from 'electron';
import path from 'path';
import updater from '@core/electron/updater';
import {
  createWindow,
  createSettingsWindow,
  createCreateTimerWindow
} from '@core/electron/windows';
import { stopTimeTrackingEntry } from '@core/helpers/electron';
import i18next from '@core/i18n';
const i18n = i18next.init();

export default class TrayBuilder {
  tray;

  constructor() {
    const trayIcon = nativeImage
      .createFromPath(
        path.join(__dirname, 'assets/images/icon/trayTemplate.png')
      )
      .resize({ width: 16, height: 16 });
    trayIcon.setTemplateImage(true);
    this.tray = new Tray(trayIcon);

    global.currentTimerObserver.on('change', (timer) => {
      this.buildTray(timer);
    });
  }

  async buildTray(timer) {
    await i18n.changeLanguage(app.getLocale() ?? 'en');
    const template = this.buildTemplate(timer);
    const contextMenu = Menu.buildFromTemplate(template);

    if (timer) {
      contextMenu.getMenuItemById('stop-timer').enabled = true;
      this.tray.setToolTip(timer.task.name);
      this.tray.setTitle(global.currentTimerObserver?.getTime(), {
        fontType: 'monospacedDigit'
      });
    } else {
      this.tray.setToolTip(app.getName());
      this.tray.setTitle('');
    }
    this.tray.setContextMenu(contextMenu);
  }

  buildTemplate(timer) {
    const template = [
      {
        label: i18n.t('tray.startTimer'),
        accelerator: 'Shift+CommandOrControl+N',
        click: () => {
          createCreateTimerWindow();
        }
      },
      {
        id: 'stop-timer',
        label: i18n.t('tray.stopTimer'),
        accelerator: 'Shift+CommandOrControl+S',
        enabled: !!timer,
        click: () => {
          stopTimeTrackingEntry();
        }
      },
      { type: 'separator' },
      {
        label: i18n.t('tray.open', { name: app.getName() }),
        click() {
          createWindow();
        }
      },
      {
        label: i18n.t('tray.settings'),
        click() {
          createSettingsWindow();
        }
      },
      {
        label: i18n.t('tray.checkUpdate'),
        click: async (menuItem) => {
          await updater.checkForUpdates(menuItem);
        }
      },
      {
        label: i18n.t('tray.about', { name: app.getName() }),
        role: 'about'
      },
      { type: 'separator' },
      {
        label: i18n.t('tray.quit'),
        click() {
          app.quit();
        }
      }
    ];

    return template;
  }
}
