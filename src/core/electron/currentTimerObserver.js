import { BrowserWindow } from 'electron';
import { EventEmitter } from 'events';

class currentTimerObserver extends EventEmitter {
  currentTimer;
  clock;
  time;

  init() {
    const getCurrentTimer = function () {
      clickupService
        .currentTimeTrackingEntry()
        .then((timer) => {
          this.setTimer(timer);
          BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send('refresh-events');
            window.webContents.send('set-clickup-timer', timer);
          });
        })
        .catch((err) => {
          console.error(err);
        });
    };

    setInterval(() => {
      getCurrentTimer();
    }, 10 * 1000);

    getCurrentTimer();
  }
  getTimer() {
    return this.currentTimer;
  }
  getTime() {
    return new Date(this.time).toISOString().slice(11, 19);
  }
  setTimer(timer) {
    this.currentTimer = timer;

    if (this.clock) {
      clearInterval(this.clock);
      this.clock = null;
      this.time = null;
    }
    if (timer) {
      this.time = Date.now() - timer.start;
      this.clock = setInterval(() => {
        this.time += 1000;
        this.emit('change', timer);
      }, 1000);
    } else {
      this.emit('change', null);
    }
  }
  resetTimer() {
    this.setTimer(null);
  }
}

export default new currentTimerObserver();
