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
    global.currentTimerObserver.on('change', (timer) => {
      this.buildTray();
    });
  }

  async buildTray() {
    await i18n.changeLanguage(app.getLocale() ?? 'en');

    if (!this.tray) {
      const image = await nativeImage.createThumbnailFromPath(
        path.join(__dirname, 'assets/images/icon/trayTemplate.png'),
        {
          width: 16,
          height: 16
        }
      );
      image.setTemplateImage(true);
      this.tray = new Tray(image);
    }

    const template = this.buildTemplate();
    const contextMenu = Menu.buildFromTemplate(template);

    if (global.currentTimerObserver?.getTimer()) {
      contextMenu.getMenuItemById('stop-timer').enabled = true;
      this.tray.setToolTip(global.currentTimerObserver?.getTimer().task.name);
      this.tray.setTitle(global.currentTimerObserver?.getTime(), {
        fontType: 'monospacedDigit'
      });
    } else {
      this.tray.setToolTip(app.getName());
      this.tray.setTitle('');
    }
    this.tray.setContextMenu(contextMenu);
  }

  buildTemplate() {
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
        enabled: !!global.currentTimerObserver?.getTimer(),
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
