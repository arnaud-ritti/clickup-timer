<template>
  <div class="navbar fixed z-20 bg-base-100 shadow-md drag">
    <div class="w-16"></div>
    <div class="flex flex-grow justify-end gap-4">
      <!--  rounded-r-lg -->
      <div
        class="stats bg-primary text-primary-content h-[64px] rounded-l-[64px] rounded-r-[64px] no-drag"
        :class="{ 'rounded-r-lg w-full': timer }"
      >
        <div class="stat p-2 flex items-center">
          <div
            class="stat-figure text-secondary col-start-1 justify-self-start"
          >
            <div
              class="flex items-center bg-neutral text-neutral-content rounded-l-[64px] rounded-r-[64px]"
            >
              <button
                class="btn btn-circle btn-md btn-error"
                @click="stopTimer"
                v-if="timer && isRunning"
              >
                <StopIcon class="h-6 w-6 text-current" />
              </button>
              <div
                class="pr-4 pl-2 text-2xl font-semibold w-36 text-center"
                v-if="timer && isRunning"
              >
                {{ prettyTime }}
              </div>
              <div :class="{ indicator: timer && !isRunning }">
                <button
                  class="btn btn-circle btn-md btn-success"
                  @click="createTimer"
                  v-if="!timer || (timer && !isRunning)"
                >
                  <PlayIcon class="h-6 w-6 text-current" />
                </button>

                <span class="indicator-item top-2 right-2">
                  <button
                    class="btn btn-circle btn-xs btn-neutral"
                    @click="resetTimer"
                    v-if="timer && !isRunning"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </span>
              </div>
            </div>
          </div>
          <div
            class="stat-value flex-1 col-start-2 text-base overflow-hidden text-ellipsis"
            v-if="timer"
          >
            <span class="text-xl" v-text="timer.task.name"></span>
          </div>
          <div
            class="stat-actions mt-0 leading-none justify-self-end shrink-0"
            v-if="timer"
          >
            <button
              v-if="timer"
              type="button"
              @click="shell.openExternal(timer.task_url)"
              class="btn btn-ghost btn-sm"
              tabindex="-1"
            >
              <img
                class="mt-1 w-7"
                src="assets/images/white-rounded-logo.svg"
              />
              <span>{{ $t('action.openInClickUp') }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="dropdown dropdown-end no-drag">
        <label
          tabindex="0"
          class="btn btn-ghost btn-circle avatar"
          :class="{ placeholder: !user?.profilePicture }"
        >
          <div
            class="w-16 rounded-full"
            :class="{
              'bg-neutral-focus text-neutral-content': !user?.profilePicture
            }"
          >
            <img v-if="user?.profilePicture" :src="user.profilePicture" />
            <span v-else>{{ user?.initials ?? '' }}</span>
          </div>
        </label>
        <ul
          tabindex="0"
          class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 z-10 rounded-box w-52"
        >
          <li>
            <button @click="openSettings">
              <cog-icon class="w-5 mr-1" /><span>{{
                $t('action.settings')
              }}</span>
            </button>
          </li>
          <li>
            <button @click="close">
              <arrow-right-on-rectangle-icon class="w-5 mr-1" />
              <span>{{ $t('action.quit') }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="h-20"></div>
</template>

<script>
import clickupService from '@core/clickup/service';
import { ipcRenderer, shell } from 'electron';
import i18next from 'i18next';

import {
  CogIcon,
  ArrowRightOnRectangleIcon,
  PlayIcon,
  StopIcon,
  XMarkIcon
} from '@heroicons/vue/20/solid';
import { ref } from 'vue';
export default {
  components: {
    CogIcon,
    PlayIcon,
    StopIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon
  },
  data: () => ({}),
  setup: () => {
    const user = ref(null);
    const timer = ref(null);
    const time = ref(0);
    const clock = ref(null);

    return {
      user,
      timer,
      shell,
      clock,
      time,
      error(options) {
        notification.error({ duration: 5000, ...options });

        if (options.error) {
          console.error(options.error);
        }
      }
    };
  },
  computed: {
    prettyTime: function () {
      return new Date(this.time).toISOString().slice(11, 19);
    },
    isRunning: function () {
      return this.timer && this.timer.duration < 0;
    }
  },
  mounted() {
    ipcRenderer.on('set-clickup-timer', (event, timer) =>
      this.onClickupTimer(timer)
    );
    ipcRenderer.on('fetch-clickup-timer-error', (event, error) =>
      this.error({
        error,
        title: i18next.t('notification.fetchCurrentTimer.title'),
        content: i18next.t('notification.fetchCurrentTimer.content')
      })
    );

    clickupService
      .getUser()
      .then((user) => {
        this.user = user;
      })
      .catch(() => {
        this.user = null;
      });

    this.getCurrentTimer();
  },
  methods: {
    createTimer: function () {
      if (this.timer) {
        clickupService
          .startTimeTrackingEntry(
            this.timer.task.id,
            this.timer.description,
            [],
            this.timer.billable
          )
          .then((entry) => {
            console.info(`Created new timer entry for: ${entry.task.name}`);
            ipcRenderer.send('request-events-refresh');
            this.timer = entry;
            this.stopCounter();
            this.startCounter(Date.now() - entry.start);
          })
          .catch((error) => {
            this.error({
              error,
              title: i18next.t('notification.createTimerError.title'),
              content: i18next.t('notification.createTimerError.content')
            });
          });
      } else {
        ipcRenderer.send('create-timer');
      }
    },
    stopTimer: function () {
      this.stopCounter();
      ipcRenderer.send('stop-clickup-timer');
    },
    resetTimer: function () {
      this.timer = null;
      ipcRenderer.send('create-timer');
    },
    getCurrentTimer: function () {
      ipcRenderer.send('get-clickup-timer');
    },
    onClickupTimer: function (timer) {
      this.timer = timer;
      this.stopCounter();
      if (timer) {
        this.startCounter(Date.now() - timer.start);
      }
    },
    startCounter: function (initialTime = 0) {
      this.time = initialTime;
      this.clock = setInterval(() => {
        this.time += 1000;
      }, 1000);
    },
    stopCounter: function () {
      if (this.clock) {
        clearInterval(this.clock);
        this.clock = null;
        this.time = null;
      }
    },
    openSettings: function () {
      ipcRenderer.send('open-settings');
    },
    close: function () {
      ipcRenderer.send('quit-app');
    }
  }
};
</script>
