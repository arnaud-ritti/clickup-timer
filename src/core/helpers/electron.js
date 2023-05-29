import clickupService from '@core/clickup/service';

export function stopTimeTrackingEntry() {
  clickupService
    .stopTimeTrackingEntry()
    .then(() => {
      global.currentTimerObserver.resetTimer();
      global.windows.get('main')?.webContents.send('set-clickup-timer', null);
      global.windows.get('main')?.webContents.send('refresh-events');
    })
    .catch((err) =>
      global.windows
        .get('main')
        ?.webContents.send('fetch-clickup-timer-error', err)
    );
}
