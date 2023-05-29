import { app } from 'electron';
import path from 'path';
import i18next from 'i18next';
import backend from '@core/i18n/backend';

const mainProcess = typeof window === 'undefined';

const lng = mainProcess
  ? app.getLocale()
  : navigator.languages && navigator.languages.length
  ? navigator.languages[0]
  : navigator.userLanguage ||
    navigator.language ||
    navigator.browserLanguage ||
    'en';

const options = {
  backend: {
    loadPath: path.join(
      (app || window).isPackaged ? __dirname : './src',
      '/locales/{{lng}}/{{ns}}.json'
    ),
    addPath: path.join(
      (app || window).isPackaged ? __dirname : './src',
      '/locales/{{lng}}/{{ns}}.missing.json'
    ),
    ipcRenderer: mainProcess ? undefined : window.api.i18nextElectronBackend
  },
  debug: !(app || window).isPackaged,
  saveMissing: false,
  saveMissingTo: 'current',
  namespace: 'translation',
  lng: lng,
  fallbackLng: 'en',
  whitelist: ['fr', 'en', 'de', 'es']
};

const i18n = () => {
  i18next.use(backend).init(options);
  return i18next;
};

export default {
  init: i18n
};
