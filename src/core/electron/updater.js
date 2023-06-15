import { app, dialog, shell } from 'electron';

import i18next from '@core/i18n';
const i18n = i18next.init();

const GH_UPDATE_TOKEN = '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';
const GH_UPDATE_REPO = 'arnaud-ritti/clickup-timer';

class AppUpdater {
  updater;
  repository;
  token;
  constructor(repository, token) {
    this.repository = repository;
    this.token = token;
    this.updater = new Set();
  }

  async checkUpdates() {
    await i18n.changeLanguage(app.getLocale() ?? 'en');
    if (!app.isPackaged) return;

    try {
      const res = await fetch(
        `https://api.github.com/repos/${this.repository}/releases`,
        {
          headers: this.token ? { authorization: `token ${this.token}` } : {}
        }
      );
      const json = await res.json();
      const latest = json[0];
      if (!latest) return;

      // Remove leading v
      const latestVersion = latest.tag_name.startsWith('v')
        ? latest.tag_name.slice(1)
        : latest.tag_name;

      if (latestVersion != app.getVersion()) {
        dialog.showMessageBox(
          {
            type: 'info',
            title: i18n.t('update.available.title'),
            message: i18n.t('update.available.message', {
              name: app.getName()
            }),
            buttons: [
              i18n.t('update.available.buttons.download'),
              i18n.t('update.available.buttons.sponsor'),
              i18n.t('update.available.buttons.cancel')
            ],
            defaultId: 0
          },
          (res) => {
            this.updater.forEach((item) => {
              item.enabled = false;
            });
            switch (result.response) {
              case 0:
                shell.openExternal(latest.html_url);
                break;
              case 1:
                shell.openExternal('https://ko-fi.com/arnaudritti');
                break;
            }
          }
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  checkForUpdates(menuItem) {
    if (menuItem) {
      if (!this.updater.has(menuItem)) {
        this.updater.add(menuItem);
      }
      this.updater.forEach((item) => {
        item.enabled = false;
      });
    }

    this.checkUpdates();
  }
}

export default new AppUpdater(GH_UPDATE_REPO, GH_UPDATE_TOKEN);
