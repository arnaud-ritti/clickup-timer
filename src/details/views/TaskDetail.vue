<template>
  <div class="grid grid-cols-1 gap-4 p-3 pb-4 pt-0">
    <form @submit="updateTimeTrackingEntry">
      <div class="form-control w-full">
        <label class="label flex-col items-start pt-0">
          <div class="text-sm breadcrumbs">
            <ul>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="w-4 h-4 mr-2 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  ></path>
                </svg>
                <span v-text="timeEntry.task_location.space_name"></span>
              </li>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="w-4 h-4 mr-2 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  ></path>
                </svg>
                <span v-text="timeEntry.task_location.folder_name"></span>
              </li>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="w-4 h-4 mr-2 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  ></path>
                </svg>
                <span v-text="timeEntry.task_location.list_name"></span>
              </li>
            </ul>
          </div>
          <h2
            v-text="timeEntry.task.name"
            class="font-title text-2xl font-bold text-primary"
          ></h2>
        </label>

        <label class="label grid grid-cols-3">
          <div class="flex flex-col">
            <span class="label-text">{{ $t('entry.form.startDate') }}</span>
            <span
              v-text="toDate(timeEntry.start)"
              class="text-lg font-bold"
            ></span>
          </div>
          <div class="flex flex-col">
            <span class="label-text">{{ $t('entry.form.endDate') }}</span>
            <span
              v-text="toDate(timeEntry.end)"
              class="text-lg font-bold"
            ></span>
          </div>
          <div class="flex flex-col">
            <span class="label-text">{{ $t('entry.form.duration') }}</span>
            <span
              v-text="toTime(timeEntry.duration)"
              class="text-lg font-bold"
            ></span>
          </div>
        </label>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('entry.form.description') }}</span>
        </label>
        <textarea
          v-model="timeEntry.description"
          class="textarea textarea-bordered h-24 w-full"
          :class="{
            'input-error':
              v$.timeEntry?.description?.$dirty &&
              v$.timeEntry?.description?.$errors.length
          }"
        ></textarea>
        <label
          class="label text-error"
          v-for="error of v$.timeEntry?.description?.$errors"
          :key="error.$uid"
        >
          {{ error.$message }}
        </label>
      </div>

      <div class="form-control w-full">
        <label class="label cursor-pointer">
          <span class="label-text">{{ $t('entry.form.billable') }}</span>
          <input
            v-model="timeEntry.billable"
            type="checkbox"
            class="toggle toggle-primary"
          />
        </label>
      </div>

      <div class="flex justify-end mt-4 space-x-2">
        <button
          type="button"
          @click="shell.openExternal(timeEntry.task_url)"
          class="btn btn-ghost"
        >
          <img class="mt-1 w-7" src="assets/images/white-rounded-logo.svg" />
          <span>{{ $t('action.openInClickUp') }}</span>
        </button>

        <n-popconfirm
          :show-icon="false"
          v-model:show="deleteEntry"
          class="!rounded !p-4"
        >
          <template #trigger>
            <button type="button" class="btn btn-outline btn-error">
              <trash-icon class="w-5 mr-1" /><span>{{
                $t('action.delete')
              }}</span>
            </button>
          </template>

          <p class="text-sm text-center w-full">
            {{ $t('action.deleteConfirm') }}
          </p>

          <template #action>
            <div class="flex w-full justify-center gap-2 pt-2">
              <button
                type="button"
                class="btn btn-sm btn-ghost"
                @click="deleteEntry = false"
              >
                {{ $t('action.cancel') }}
              </button>
              <button
                type="button"
                class="btn btn-sm btn-accent"
                @click="deleteTimeEntry"
              >
                {{ $t('action.confirm') }}
              </button>
            </div>
          </template>
        </n-popconfirm>
        <button
          type="button"
          class="btn btn-outline btn-secondary"
          @click="cancel"
        >
          {{ $t('action.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" @click="updateTimeEntry">
          {{ $t('action.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, toRef } from 'vue';
import { NPopconfirm } from 'naive-ui';
import { TrashIcon } from '@heroicons/vue/24/outline';
import clickupService from '@core/clickup/service';
import { useVuelidate } from '@vuelidate/core';
import { ipcRenderer, shell } from 'electron';

export default {
  components: { NPopconfirm, TrashIcon },

  async setup() {
    const timeEntry = toRef(await clickupService.getTimeEntry(window.entry.id));
    return {
      shell,
      timeEntry,
      deleteEntry: ref(false),
      v$: useVuelidate(),
      error: function (options) {
        notification.error({ duration: 5000, ...options });

        if (options.error) {
          console.error(options.error);
        }
      }
    };
  },
  methods: {
    toTime: function (seconds) {
      const date = new Date(null);
      date.setMilliseconds(seconds);
      return date.toISOString().slice(11, 19);
    },
    toDate: function (timestamp) {
      const date = new Date(null);
      date.setMilliseconds(timestamp);
      return date.toLocaleString();
    },
    cancel: function () {
      window.close();
    },
    updateTimeEntry: function (event) {
      event.preventDefault();
      clickupService
        .updateTimeTrackingEntry(
          this.timeEntry.id,
          this.timeEntry.description,
          this.timeEntry.start,
          this.timeEntry.end,
          this.timeEntry.tags,
          this.timeEntry.billable,
          this.timeEntry.task.id
        )
        .then(() => {
          console.dir(
            `Updated time tracking entry for: ${this.timeEntry.task.name}`
          );
          ipcRenderer.send('request-events-refresh');
          window.close();
        })
        .catch((error) => {
          this.error({
            error,
            duration: 5000,
            title: this.$t('notification.update.title'),
            content: this.$t('notification.update.content')
          });
        });
    },
    deleteTimeEntry: async function (event) {
      event.preventDefault();
      clickupService
        .deleteTimeTrackingEntry(this.timeEntry.id)
        .then(() => {
          console.dir(
            `Deleted time tracking entry for: ${this.timeEntry.task.name}`
          );
          ipcRenderer.send('request-events-refresh');
          window.close();
        })
        .catch((error) =>
          this.error({
            error,
            title: this.$t('notification.delete.title'),
            content: this.$t('notification.delete.content')
          })
        );
    }
  }
};
</script>
