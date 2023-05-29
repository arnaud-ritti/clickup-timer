import { app, dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import i18next from '@core/i18n';
const i18n = i18next.init();

class AppUpdater {
  updater;

  constructor() {
    autoUpdater.autoDownload = true;
  }

  async bindEvents() {
    await i18n.changeLanguage(app.getLocale() ?? 'en');

    autoUpdater.on('error', (error) => {
      dialog
        .showMessageBox({
          type: 'error',
          title: i18n.t('update.error.title'),
          message: i18n.t('update.error.message'),
          buttons: [
            i18n.t('update.error.buttons.download'),
            i18n.t('update.error.buttons.cancel')
          ]
        })
        .then((result) => {
          if (result.response === 0) {
            shell.openExternal(
              'https://github.com/arnaud-ritti/clickup-timer/releases/latest'
            );
          }
        });

      console.error(error);
    });

    autoUpdater.on('update-available', () => {
      dialog
        .showMessageBox({
          type: 'info',
          title: i18n.t('update.available.title'),
          message: i18n.t('update.available.message', { name: app.getName() }),
          buttons: [
            i18n.t('update.available.buttons.download'),
            i18n.t('update.available.buttons.sponsor'),
            i18n.t('update.available.buttons.cancel')
          ]
        })
        .then((result) => {
          if (this.updater) {
            this.updater.enabled = true;
          }
          switch (result.response) {
            case 0:
              shell.openExternal(
                'https://github.com/arnaud-ritti/clickup-timer/releases/latest'
              );
              break;
            case 1:
              shell.openExternal('https://ko-fi.com/arnaudritti');
              break;
          }
        });
    });

    autoUpdater.on('update-not-available', () => {
      dialog.showMessageBox({
        title: i18n.t('update.noUpdate.title'),
        message: i18n.t('update.noUpdate.message')
      });
      if (this.updater) {
        this.updater.enabled = true;
        this.updater = null;
      }
    });
  }

  checkForUpdatesAndNotify() {
    autoUpdater.checkForUpdatesAndNotify();
  }

  checkForUpdates(menuItem) {
    this.updater = menuItem;
    if (this.updater) {
      this.updater.enabled = false;
    }
    autoUpdater.checkForUpdates();
  }
}

export default new AppUpdater();
