<template>
  <member-selector :open="true" :active="$route.params.userId" />

  <!-- START | Calendar view -->
  <vue-cal
    :editable-events="false"
    :hide-weekends="false"
    :disable-views="['years', 'year', 'month', 'day']"
    :on-event-dblclick="onTaskDoubleClick"
    :on-event-click="onTaskSingleClick"
    :click-to-navigate="false"
    :hide-view-selector="true"
    :watch-real-time="true"
    :time-cell-height="90"
    :time-from="6 * 60"
    :time-to="24 * 60"
    :events="events"
    @ready="fetchEvents"
    @view-change="fetchEvents"
    active-view="week"
    today-button
    :locale="$i18next.language"
    class="mt-[80px]"
    ref="calendar"
  >
    <template v-slot:title="{ title }">
      <div class="flex items-center space-x-4">
        <span type="false" aria-label="false">{{ title }}</span>

        <!-- START | Extra controls -->
        <div
          class="flex space-x-1 text-base-content"
          style="-webkit-app-region: no-drag"
        >
          <router-link :to="{ name: 'time-tracker' }" replace>
            <user-icon class="w-5" />
          </router-link>
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
            <span
              class="font-semibold text-gray-700"
              v-text="event.title"
            ></span>
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
            class="flex items-center py-1 space-x-1 text-gray-500 hover:text-gray-700"
          >
            <img class="mt-1 w-7" src="assets/images/white-rounded-logo.svg" />
            <span>{{ $t('action.openInClickUp') }}</span>
          </button>

          <button
            @click="onTaskDoubleClick(event)"
            class="flex items-center py-1 space-x-1 text-gray-500 hover:text-gray-700"
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
  </vue-cal>
  <!-- END | Calendar view -->
</template>

<script>
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ipcRenderer, shell } from 'electron';

import VueCal from 'vue-cal';
import '@assets/vuecal.css';

import store from '@core/store';
import eventFactory from '@core/clickup/events-factory';
import clickupService from '@core/clickup/service';

import { UserIcon } from '@heroicons/vue/20/solid';
import { ClockIcon, PencilIcon } from '@heroicons/vue/24/outline';
import { NPopover } from 'naive-ui';
import MemberSelector from '@main/components/MemberSelector.vue';

export default {
  components: {
    MemberSelector,
    VueCal,
    RouterLink,
    NPopover,
    UserIcon,
    ClockIcon,
    PencilIcon
  },

  setup() {
    return {
      shell,
      store,

      events: ref([]),
      selectedTask: ref({}),

      clickupCards: ref([]),
      loadingClickupCards: ref(false),

      error: function (options) {
        notification.error({ duration: 5000, ...options });
        if (options.error) {
          console.error(options.error);
        }
      }
    };
  },

  mounted() {
    watch(
      () => this.$route.params.userId,
      () => {
        const startDate = this.$refs.calendar.$data.view.startDate;
        const endDate = this.$refs.calendar.$data.view.endDate;

        this.events = [];
        this.fetchEvents({ startDate, endDate });
      }
    );
  },

  methods: {
    fetchEvents: async function ({ startDate, endDate }) {
      clickupService
        .getTimeTrackingRange(startDate, endDate, this.$route.params.userId)
        .then((entries) => {
          this.events = entries
            .map((entry) => eventFactory.fromClickup(entry))
            .filter((entry) => entry);
        })
        .catch((error) => {
          if (error === 'You have no access') {
            this.error({
              error,
              title: this.$t('notification.noAccess.title'),
              content: this.$t('notification.noAccess.content')
            });
            return;
          }

          this.error({
            error,
            title: this.$t('notification.fetchEvents.title'),
            content: this.$t('notification.fetchEvents.content')
          });
        });
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
    }
  }
};
</script>
