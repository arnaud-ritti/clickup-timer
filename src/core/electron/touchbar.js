import { app, TouchBar, nativeImage } from 'electron';
import path from 'path';
import { createCreateTimerWindow } from '@core/electron/windows';
import { stopTimeTrackingEntry } from '@core/helpers/electron';
import i18next from '@core/i18n';
const i18n = i18next.init();

const { TouchBarButton, TouchBarSegmentedControl } = TouchBar;

export default class TouchBarBuilder {
  mainWindow;

  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    global.currentTimerObserver.on('change', (timer) => {
      this.buildTouchBar();
    });
  }

  async buildTouchBar() {
    if (process.platform !== 'darwin') {
      return;
    }

    await i18n.changeLanguage(app.getLocale() ?? 'en');

    const startIcon = nativeImage.createFromPath(
      path.join(__dirname, 'assets/images/icon/startTemplate.png')
    );
    startIcon.setTemplateImage(true);

    const stopIcon = nativeImage.createFromPath(
      path.join(__dirname, 'assets/images/icon/stopTemplate.png')
    );
    stopIcon.setTemplateImage(true);

    const startTimer = new TouchBarButton({
      label: i18n.t('touchbar.startTimer'),
      accessibilityLabel: i18n.t('touchbar.startTimer'),
      icon: startIcon,
      iconPosition: 'left',
      backgroundColor: '#00CA4E',
      click: () => {
        createCreateTimerWindow();
      }
    });

    const stopTimer = new TouchBarButton({
      label: i18n.t('touchbar.stopTimer'),
      accessibilityLabel: i18n.t('touchbar.stopTimer'),
      icon: stopIcon,
      iconPosition: 'left',
      backgroundColor: '#FF605C',
      click: () => {
        stopTimeTrackingEntry();
      }
    });

    const timerLabel = new TouchBarSegmentedControl({
      segmentStyle: 'automatic',
      mode: 'buttons',
      segments: []
    });

    let items = [];
    if (global.currentTimerObserver?.getTimer()) {
      timerLabel.segments = [
        { label: global.currentTimerObserver?.getTimer().task.name },
        { label: global.currentTimerObserver?.getTime() }
      ];
      items.push(stopTimer);
      items.push(timerLabel);
    } else {
      items.push(startTimer);
    }

    const touchBar = new TouchBar({ items });
    this.mainWindow.setTouchBar(touchBar);

    return touchBar;
  }
}
