<template>
  <member-selector
    v-if="store.get('settings.admin_features_enabled')"
    :open="memberSelectorOpen"
  />

  <!-- START | Calendar view -->
  <vue-cal
    :editable-events="{ drag: true, resize: true, create: true }"
    :hide-weekends="!store.get('settings.show_weekend')"
    :disable-views="['years', 'year', 'month', 'day']"
    :on-event-dblclick="onTaskDoubleClick"
    :on-event-click="onTaskSingleClick"
    :on-event-create="onTaskCreate"
    :drag-to-create-threshold="20"
    :click-to-navigate="false"
    :hide-view-selector="true"
    :watch-real-time="true"
    :time-cell-height="90"
    :time-from="dayStart"
    :time-to="dayEnd"
    :snap-to-time="5"
    :events="events"
    @ready="fetchEvents"
    @view-change="fetchEvents"
    @event-drop="updateTimeTrackingEntry"
    @event-duration-change="updateTimeTrackingEntry"
    @mousedown="memberSelectorOpen = false"
    active-view="week"
    today-button
    :locale="$i18next.language"
    ref="calendar"
  >
    <template v-slot:title="{ title, view }">
      <div class="flex items-center space-x-4">
        <span type="false" aria-label="false">
          {{ title }}
          <div
            v-if="hasTimeTracked(view.events)"
            class="badge badge-neutral mx-2 p-1"
          >
            <clock-icon class="w-3 mr-1" />
            <span>{{ totalHours(view.events) }}</span>
          </div>
        </span>

        <!-- START | Extra controls -->
        <div
          class="flex space-x-1 text-base-content"
        >
          <button
            type="button"
            v-if="store.get('settings.admin_features_enabled')"
            @click="memberSelectorOpen = !memberSelectorOpen"
          >
            <users-icon class="w-5" />
          </button>
        </div>
        <!-- End | Extra controls -->
      </div>
    </template>

    <!-- START | Custom Day heading -->
    <template v-slot:weekday-heading="{ heading, view }">
      <div
        class="flex flex-col justify-center sm:flex-row sm:items-center text-base"
      >
        <div>
          <span class="full">{{ heading.label }}</span>
          <span class="small">{{
            heading.date.toLocaleDateString('en-US', {
              weekday: 'short'
            })
          }}</span>
          <span class="xsmall">{{ heading.label[0] }}</span>
          <span
            >&nbsp;{{
              heading.date.toLocaleDateString('en-US', {
                day: 'numeric'
              })
            }}</span
          >
        </div>

        <div
          v-if="hasTimeTrackedOn(heading.date, view.events)"
          class="badge badge-neutral mx-2 p-1"
        >
          <clock-icon class="w-3 mr-1" />
          <span>{{ totalHoursOnDate(heading.date, view.events) }}</span>
        </div>
      </div>
    </template>
    <!-- END | Custom Day heading -->

    <!-- START | Custom Event template -->
    <template v-slot:event="{ event }">
      <div class="vuecal__event-title">
        <!-- START | Task context popover -->
        <n-popover
          trigger="hover"
          :delay="500"
          placement="top"
          :duration="60"
          width="260"
        >
          <template #trigger>
            <div
              class="text-sm font-bold w-full overflow-hidden whitespace-nowrap text-ellipsis"
              v-text="event.title"
            ></div>
          </template>

          <template #header>
            <span class="font-semibold" v-text="event.title"></span>
            <div class="text-sm breadcrumbs" v-if="event.task_location">
              <ul>
                <li>
                  <span v-text="event.task_location.space_name"></span>
                </li>
                <li>
                  <span v-text="event.task_location.folder_name"></span>
                </li>
                <li>
                  <span v-text="event.task_location.list_name"></span>
                </li>
              </ul>
            </div>
          </template>

          <span
            v-if="event.description"
            v-text="event.description"
            class="whitespace-pre-wrap"
          ></span>
          <hr v-if="event.description" class="separator my-2 -mx-3.5" />

          <button
            @click="shell.openExternal(event.taskUrl)"
            class="flex items-center py-1 space-x-1"
          >
            <img class="mt-1 w-7" src="assets/images/white-rounded-logo.svg" />
            <span>{{ $t('action.openInClickUp') }}</span>
          </button>

          <button
            @click="onTaskDoubleClick(event)"
            class="flex items-center py-1 space-x-1"
          >
            <pencil-icon class="w-4 mx-1.5" />
            <span>{{ $t('action.openDetails') }}</span>
          </button>
        </n-popover>
        <!-- END | Task context popover -->
      </div>

      <!-- START | Time from/to -->
      <div class="vuecal__event-time">
        {{ event.start.formatTime('HH:mm') }}
        <span class="mx-1">-</span>
        {{ event.end.formatTime('HH:mm') }}
      </div>
      <!-- END | Time from/to -->

      <div class="text-xs font-normal" v-if="event.task_location">
        <ul>
          <li>
            <span v-text="event.task_location.folder_name"></span>
          </li>
          <li>
            <span v-text="event.task_location.list_name"></span>
          </li>
        </ul>
      </div>
    </template>
    <!-- END | Custom Event template -->
  </vue-cal>
  <!-- END | Calendar view -->
</template>

<script>
import { ref } from 'vue';
import { ipcRenderer, shell } from 'electron';

import VueCal from 'vue-cal';
import '@assets/vuecal.css';

import store from '@core/store';
import { isEmptyObject, timeToMinutes } from '@core/helpers';
import eventFactory from '@core/clickup/events-factory';
import clickupService from '@core/clickup/service';
import MemberSelector from '@main/components/MemberSelector.vue';
import { UsersIcon } from '@heroicons/vue/20/solid';
import { ClockIcon, PencilIcon } from '@heroicons/vue/24/outline';
import { NPopover } from 'naive-ui';

export default {
  components: {
    VueCal,
    MemberSelector,
    NPopover,
    ClockIcon,
    UsersIcon,
    PencilIcon
  },

  setup() {
    return {
      shell,
      store,

      startDate: ref(null),
      endDate: ref(null),

      events: ref([]),
      selectedTask: ref({}),

      clickupSpaces: ref([]),
      clickupCards: ref([]),
      clickupTags: ref([]),

      loadingClickupSpaces: ref(false),
      loadingClickupCards: ref(false),
      loadingClickupTags: ref(false),

      deleteCallable: ref(() => null),
      memberSelectorOpen: ref(false),

      error(options) {
        notification.error({ duration: 5000, ...options });

        if (options.error) {
          console.error(options.error);
        }
      }
    };
  },

  mounted() {
    // Register background process listeners
    ipcRenderer.on('refresh-events', () => {
      this.fetchEvents({
        startDate: this.startDate,
        endDate: this.endDate
      });
    });

    ipcRenderer.on('duplicate-selected-entry', () => {
      this.duplicateSelectedTask();
    });

    ipcRenderer.on('delete-selected-entry', () => {
      this.deleteSelectedTask();
    });

    ipcRenderer.on('detail-selected-entry', () => {
      if (isEmptyObject(this.selectedTask)) return;
      ipcRenderer.send('open-task-details', {
        entry: eventFactory.fromEvent(this.selectedTask)
      });
    });

    ipcRenderer.on('on-cancel-create', () => {
      if (typeof this.deleteCallable === 'function') {
        this.deleteCallable();
      }
    });

    this.getClickupSpaces();
  },

  computed: {
    dayStart() {
      if (!store.get('settings.day_start')) return 7 * 60;

      return timeToMinutes(store.get('settings.day_start'));
    },

    dayEnd() {
      if (!store.get('settings.day_end')) return 22 * 60;

      return timeToMinutes(store.get('settings.day_end'));
    }
  },

  methods: {
    fetchEvents: async function ({ startDate, endDate }) {
      this.startDate = startDate;
      this.endDate = endDate;
      let events = [];

      try {
        const entries = await clickupService.getTimeTrackingRange(
          startDate,
          endDate
        );

        events = entries
          .map((entry) => {
            return eventFactory.fromClickup(entry);
          })
          .filter((entry) => entry);
      } catch (error) {
        this.error({
          error,
          title: this.$t('notification.fetchEvents.title'),
          content: this.$t('notification.fetchEvents.content')
        });
      }

      try {
        const timer = await clickupService.currentTimeTrackingEntry();

        if (timer) {
          events = [...events, eventFactory.fromTimer(timer)];
        }
      } catch (error) {
        this.error({
          error,
          title: this.$t('notification.fetchCurrentTimer.title'),
          content: this.$t('notification.fetchCurrentTimer.content')
        });
      }

      this.events = events;
    },
    getClickupSpaces: function () {
      this.loadingClickupSpaces = true;
      ipcRenderer.send('get-clickup-spaces');
      console.info('Fetching Clickup spaces (from cache when available)...');
    },
    onTaskCreate: function (event, deleteCallable) {
      const openModalWhenMouseReleased = () => {
        ipcRenderer.send('open-create-entry', {
          entry: eventFactory.fromEvent(event)
        });
        document.removeEventListener('mouseup', openModalWhenMouseReleased);
      };
      document.addEventListener('mouseup', openModalWhenMouseReleased);
      this.deleteCallable = deleteCallable;
      this.selectedTask = event;
      return this.selectedTask;
    },
    duplicateSelectedTask: function () {
      if (isEmptyObject(this.selectedTask)) return;
      clickupService
        .createTimeTrackingEntry(
          this.selectedTask.taskId,
          this.selectedTask.description,
          this.selectedTask.start,
          this.selectedTask.end,
          this.selectedTask.tags,
          this.selectedTask.billable
        )
        .then((entry) => {
          this.events.push(eventFactory.fromClickup(entry));
          console.info(
            `Duplicated time tracking entry for: ${entry.task.name}`
          );
        })
        .catch((error) =>
          this.error({
            error,
            title: this.$t('notification.duplicate.title'),
            content: this.$t('notification.duplicate.content')
          })
        );
    },
    deleteSelectedTask: function () {
      if (isEmptyObject(this.selectedTask)) return;
      clickupService
        .deleteTimeTrackingEntry(this.selectedTask.entryId)
        .then(() => {
          const taskIndex = this.events.findIndex(
            (event) => event.entryId === this.selectedTask.entryId
          );

          this.events.splice(taskIndex, 1);
          this.selectedTask = {};
        })
        .catch((error) =>
          this.error({
            error,
            title: this.$t('notification.delete.title'),
            content: this.$t('notification.delete.content')
          })
        );
    },
    onTaskSingleClick: function (event, e) {
      this.selectedTask = event;
      e?.stopPropagation();
    },
    onTaskDoubleClick: function (event, e) {
      this.selectedTask = event;
      ipcRenderer.send('open-task-details', {
        entry: eventFactory.fromEvent(event)
      });
      e?.stopPropagation();
    },
    updateTimeTrackingEntry: function ({ event, originalEvent }) {
      clickupService
        .updateTimeTrackingEntry(
          event.entryId,
          event.description,
          event.start,
          event.end,
          event.tags,
          event.billable,
          event.task.id
        )
        .then((entry) => {
          // Update the modeled event so copy/paste/duplicate works properly
          const eventIndex = this.events.findIndex(
            (e) => e.entryId === event.entryId
          );

          if (eventIndex === -1) return;

          this.events[eventIndex] = eventFactory.updateFromRemote(
            this.events[eventIndex],
            entry
          );

          console.dir(`Updated time tracking entry for: ${entry.task.name}`);
        })
        .catch((error) => {
          this.error({
            error,
            duration: 5000,
            title: this.$t('notification.update.title'),
            content: this.$t('notification.update.content')
          });
        });

      originalEvent;
    },
    totalHoursOnDate: function (date, events) {
      let totalMinutes = events
        .filter((event) => event.start.getDate() == date.getDate())
        .reduce(
          (carry, event) =>
            carry + (event.endTimeMinutes - event.startTimeMinutes),
          0
        );

      let hours = Math.floor(totalMinutes / 60);
      let minutes = totalMinutes % 60;

      if (totalMinutes === 0) {
        return;
      }

      return hours + ':' + String(minutes).padStart(2, '0');
    },
    hasTimeTrackedOn: function (date, events) {
      return Boolean(
        events.find((event) => event.start.getDate() == date.getDate())
      );
    },
    totalHours: function (events) {
      let totalMinutes = events.reduce(
        (carry, event) =>
          carry + (event.endTimeMinutes - event.startTimeMinutes),
        0
      );
      let hours = Math.floor(totalMinutes / 60);
      let minutes = totalMinutes % 60;

      if (totalMinutes === 0) {
        return;
      }

      return hours + ':' + String(minutes).padStart(2, '0');
    },
    hasTimeTracked: function (events) {
      return Boolean(events.length);
    }
  }
};
</script>
