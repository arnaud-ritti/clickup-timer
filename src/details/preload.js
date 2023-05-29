// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer } from 'electron';
import { preloadBindings } from '@core/i18n/backend';

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

window.api = {
  i18nextElectronBackend: preloadBindings(ipcRenderer, process)
};

window.notification = {
  success: (options) => ipcRenderer.invoke('notification', 'success', options),
  error: (options) => ipcRenderer.invoke('notification', 'error', options)
};

window.isPackaged = require('@electron/remote').app.isPackaged;
window.entry = {
  id: params.entryId
};
