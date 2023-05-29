<template>
  <div class="grid grid-cols-1 gap-4 p-3 pb-4 pt-0">
    <form>
      <ul
        class="steps steps-vertical md:steps-horizontal !overflow-visible md:gap-4 w-full items-start mb-4"
      >
        <li class="step step-primary md:before:width-[calc(100% + 1rem)]">
          <div class="form-control w-full">
            <label class="label md:justify-center">
              <span class="label-text font-bold">{{
                $t('entry.form.space')
              }}</span>
            </label>
            <Combobox
              v-model="model.space"
              @update:modelValue="getClickupFolders"
            >
              <div class="relative mt-1">
                <div class="w-full">
                  <ComboboxInput
                    @change="querySpace = $event.target.value"
                    autofocus
                    :displayValue="(space) => space?.name"
                    class="input input-bordered w-full"
                    :class="{
                      'input-error':
                        v$.model?.space?.$dirty &&
                        v$.model?.space?.$errors.length
                    }"
                  />
                  <ComboboxButton
                    class="absolute inset-y-0 right-0 flex items-center pr-2"
                  >
                    <ChevronUpDownIcon
                      class="h-5 w-5 text-current"
                      aria-hidden="true"
                    />
                  </ComboboxButton>
                </div>
                <TransitionRoot
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  @after-leave="querySpace = ''"
                >
                  <ComboboxOptions
                    class="flex flex-col z-10 p-2 shadow absolute bg-base-100 rounded mt-4 max-h-60 w-full overflow-auto text-left outline outline-2 outline-offset-2 outline-opa outline-base-content/20"
                  >
                    <div
                      v-if="filterSpaces.length === 0 && querySpace !== ''"
                      class="relative cursor-default select-none py-2 px-4"
                    >
                      {{ $t('entry.empty', { type: 'space' }) }}
                    </div>
                    <div
                      v-if="filterSpaces.length === 0 && loadingClickupSpaces"
                      class="relative cursor-default select-none py-2 px-4 flex justify-center gap-2"
                    >
                      <ArrowPathIcon class="w-7 h-7 animate-spin" /><span>{{
                        $t('entry.loading')
                      }}</span>
                    </div>
                    <ComboboxOption
                      v-for="option in filterSpaces"
                      :key="option.id"
                      :value="option"
                      as="template"
                      v-slot="{ active, selected }"
                    >
                      <li
                        class="relative cursor-pointer select-none py-2 px-4 grid grid-flow-col items-center content-start transition-all rounded"
                        :class="{
                          'bg-neutral text-neutral-content bg-opacity-100':
                            selected,
                          'bg-base-content bg-opacity-10': active
                        }"
                      >
                        <span
                          class="block truncate"
                          :class="{
                            'font-medium': selected,
                            'font-normal': !selected
                          }"
                        >
                          {{ option.name }}
                        </span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
            <label
              class="label text-error"
              v-for="error of v$.model?.space?.$errors"
              :key="error.$uid"
            >
              {{ error.$message }}
            </label>
          </div>
        </li>
        <li
          class="step md:before:width-[calc(100% + 1rem)]"
          :class="{ 'step-primary': model.space }"
        >
          <div class="form-control w-full">
            <label class="label md:justify-center">
              <span class="label-text font-bold">{{
                $t('entry.form.folder')
              }}</span>
            </label>
            <Combobox
              v-model="model.folder"
              @update:modelValue="getClickupLists"
              :disabled="!model.space"
            >
              <div class="relative mt-1">
                <div class="w-full">
                  <ComboboxInput
                    @change="queryFolder = $event.target.value"
                    :displayValue="(folder) => folder?.name"
                    class="input input-bordered w-full"
                    :class="{
                      'input-error':
                        v$.model?.folder?.$dirty &&
                        v$.model?.folder?.$errors.length
                    }"
                  />
                  <ComboboxButton
                    class="absolute inset-y-0 right-0 flex items-center pr-2"
                  >
                    <ChevronUpDownIcon
                      class="h-5 w-5 text-current"
                      aria-hidden="true"
                    />
                  </ComboboxButton>
                </div>
                <TransitionRoot
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  @after-leave="queryFolder = ''"
                >
                  <ComboboxOptions
                    class="flex flex-col z-10 p-2 shadow absolute bg-base-100 rounded mt-4 max-h-60 w-full overflow-auto text-left outline outline-2 outline-offset-2 outline-opa outline-base-content/20"
                  >
                    <div
                      v-if="filterFolders.length === 0 && queryFolder !== ''"
                      class="relative cursor-default select-none py-2 px-4 text-center"
                    >
                      {{ $t('entry.empty', { type: 'folder' }) }}
                    </div>
                    <div
                      v-if="filterFolders.length === 0 && loadingClickupFolders"
                      class="relative cursor-default select-none py-2 px-4 flex justify-center gap-2"
                    >
                      <ArrowPathIcon class="w-7 h-7 animate-spin" /><span>{{
                        $t('entry.loading')
                      }}</span>
                    </div>
                    <ComboboxOption
                      v-for="option in filterFolders"
                      :key="option.id"
                      :value="option"
                      as="template"
                      v-slot="{ active, selected }"
                    >
                      <li
                        class="relative cursor-pointer select-none py-2 px-4 grid grid-flow-col items-center content-start transition-all rounded"
                        :class="{
                          'bg-neutral text-neutral-content bg-opacity-100':
                            selected,
                          'bg-base-content bg-opacity-10': active
                        }"
                      >
                        <span
                          class="block truncate"
                          :class="{
                            'font-medium': selected,
                            'font-normal': !selected
                          }"
                        >
                          {{ option.name }}
                        </span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
            <label
              class="label text-error"
              v-for="error of v$.model?.folder?.$errors"
              :key="error.$uid"
            >
              {{ error.$message }}
            </label>
          </div>
        </li>
        <li
          class="step md:before:width-[calc(100% + 1rem)]"
          :class="{ 'step-primary': model.folder }"
        >
          <div class="form-control w-full">
            <label class="label md:justify-center">
              <span class="label-text font-bold">{{
                $t('entry.form.list')
              }}</span>
            </label>
            <Combobox
              v-model="model.list"
              @update:modelValue="getClickupTasks"
              :disabled="!model.folder"
            >
              <div class="relative mt-1">
                <div class="w-full">
                  <ComboboxInput
                    @change="queryList = $event.target.value"
                    :displayValue="(list) => list?.name"
                    class="input input-bordered w-full"
                    :class="{
                      'input-error':
                        v$.model?.list?.$dirty && v$.model?.list?.$errors.length
                    }"
                  />
                  <ComboboxButton
                    class="absolute inset-y-0 right-0 flex items-center pr-2"
                  >
                    <ChevronUpDownIcon
                      class="h-5 w-5 text-current"
                      aria-hidden="true"
                    />
                  </ComboboxButton>
                </div>
                <TransitionRoot
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  @after-leave="queryList = ''"
                >
                  <ComboboxOptions
                    class="flex flex-col z-10 p-2 shadow absolute bg-base-100 rounded mt-4 max-h-60 w-full overflow-auto text-left outline outline-2 outline-offset-2 outline-opa outline-base-content/20"
                  >
                    <div
                      v-if="filterLists.length === 0 && queryList !== ''"
                      class="relative cursor-default select-none py-2 px-4"
                    >
                      {{ $t('entry.empty', { type: 'list' }) }}
                    </div>
                    <div
                      v-if="filterLists.length === 0 && loadingClickupLists"
                      class="relative cursor-default select-none py-2 px-4 flex justify-center gap-2"
                    >
                      <ArrowPathIcon class="w-7 h-7 animate-spin" /><span>{{
                        $t('entry.loading')
                      }}</span>
                    </div>
                    <ComboboxOption
                      v-for="option in filterLists"
                      :key="option.id"
                      :value="option"
                      as="template"
                      v-slot="{ active, selected }"
                    >
                      <li
                        class="relative cursor-pointer select-none py-2 px-4 grid grid-flow-col items-center content-start transition-all rounded"
                        :class="{
                          'bg-neutral text-neutral-content bg-opacity-100':
                            selected,
                          'bg-base-content bg-opacity-10': active
                        }"
                      >
                        <span
                          class="block truncate"
                          :class="{
                            'font-medium': selected,
                            'font-normal': !selected
                          }"
                        >
                          {{ option.name }}
                        </span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
            <label
              class="label text-error"
              v-for="error of v$.model?.list?.$errors"
              :key="error.$uid"
            >
              {{ error.$message }}
            </label>
          </div>
        </li>
        <li
          class="step md:before:width-[calc(100% + 1rem)]"
          :class="{ 'step-primary': model.list }"
        >
          <div class="form-control w-full">
            <label class="label md:justify-center">
              <span class="label-text font-bold">{{
                $t('entry.form.task')
              }}</span>
            </label>
            <Combobox
              v-model="model.task"
              @update:modelValue="focusNext"
              :disabled="!model.list"
            >
              <div class="relative mt-1">
                <div class="w-full">
                  <ComboboxInput
                    @change="queryTask = $event.target.value"
                    :displayValue="(task) => task?.name"
                    class="input input-bordered w-full"
                    :class="{
                      'input-error':
                        v$.model?.task?.$dirty && v$.model?.task?.$errors.length
                    }"
                  />
                  <ComboboxButton
                    class="absolute inset-y-0 right-0 flex items-center pr-2"
                  >
                    <ChevronUpDownIcon
                      class="h-5 w-5 text-current"
                      aria-hidden="true"
                    />
                  </ComboboxButton>
                </div>
                <TransitionRoot
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  @after-leave="queryTask = ''"
                >
                  <ComboboxOptions
                    class="flex flex-col z-10 p-2 shadow absolute bg-base-100 rounded mt-4 max-h-60 w-full overflow-auto text-left outline outline-2 outline-offset-2 outline-opa outline-base-content/20"
                  >
                    <div
                      v-if="filterTasks.length === 0 && queryTask !== ''"
                      class="relative cursor-default select-none py-2 px-4"
                    >
                      {{ $t('entry.empty', { type: 'task' }) }}
                    </div>
                    <div
                      v-if="filterTasks.length === 0 && loadingClickupTasks"
                      class="relative cursor-default select-none py-2 px-4 flex justify-center gap-2"
                    >
                      <ArrowPathIcon class="w-7 h-7 animate-spin" /><span>{{
                        $t('entry.loading')
                      }}</span>
                    </div>
                    <ComboboxOption
                      v-for="option in filterTasks"
                      :key="option.id"
                      :value="option"
                      as="template"
                      v-slot="{ active, selected }"
                    >
                      <li
                        class="relative cursor-pointer select-none py-2 px-4 grid grid-flow-col items-center content-start transition-all rounded"
                        :class="{
                          'bg-neutral text-neutral-content bg-opacity-100':
                            selected,
                          'bg-base-content bg-opacity-10': active
                        }"
                      >
                        <span
                          class="block truncate"
                          :class="{
                            'font-medium': selected,
                            'font-normal': !selected
                          }"
                        >
                          {{ option.name }}
                        </span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
            <label
              class="label text-error"
              v-for="error of v$.model?.task?.$errors"
              :key="error.$uid"
            >
              {{ error.$message }}
            </label>
          </div>
        </li>
      </ul>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('entry.form.description') }}</span>
        </label>
        <textarea
          v-model="model.description"
          class="textarea textarea-bordered h-24 w-full"
          :class="{
            'input-error':
              v$.model?.description?.$dirty &&
              v$.model?.description?.$errors.length
          }"
        ></textarea>
        <label
          class="label text-error"
          v-for="error of v$.model?.description?.$errors"
          :key="error.$uid"
        >
          {{ error.$message }}
        </label>
      </div>

      <div class="form-control w-full">
        <label class="label cursor-pointer">
          <span class="label-text">{{ $t('entry.form.billable') }}</span>
          <input
            v-model="model.billable"
            type="checkbox"
            class="toggle toggle-primary"
          />
        </label>
      </div>

      <div class="flex justify-end mt-4 space-x-2">
        <button
          v-if="model.task"
          type="button"
          @click="shell.openExternal(model.task.task_url)"
          class="btn btn-ghost"
          tabindex="-1"
        >
          <img class="mt-1 w-7" src="assets/images/white-rounded-logo.svg" />
          <span>{{ $t('action.openInClickUp') }}</span>
        </button>

        <button
          type="button"
          class="btn btn-outline btn-secondary"
          @click="cancel"
        >
          {{ $t('action.cancel') }}
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          @click="createTimeEntry"
          v-if="model.task"
        >
          {{ $t('action.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, toRef } from 'vue';
import { ChevronUpDownIcon, ArrowPathIcon } from '@heroicons/vue/20/solid';
import store from '@core/store';
import clickupService from '@core/clickup/service';
import { useVuelidate } from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import { withI18nMessage } from '@core/i18n/validators';
import { ipcRenderer, shell } from 'electron';
import uFuzzy from '@leeoniya/ufuzzy';

import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot
} from '@headlessui/vue';

export default {
  components: {
    ArrowPathIcon,
    ChevronUpDownIcon,
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot
  },

  async setup() {
    const event = toRef({});
    const model = toRef({
      billable: store.get('settings.billable_default') || false
    });

    const ufOpts = { letters: 'a-z' };

    return {
      shell,
      event,
      model,

      clickupSpaces: ref([]),
      clickupFolders: ref([]),
      clickupLists: ref([]),
      clickupTasks: ref([]),

      clickupTags: ref([]),

      loadingClickupSpaces: ref(false),
      loadingClickupFolders: ref(false),
      loadingClickupLists: ref(false),
      loadingClickupTasks: ref(false),

      loadingClickupTags: ref(false),

      querySpace: ref(''),
      queryFolder: ref(''),
      queryList: ref(''),
      queryTask: ref(''),

      uf: new uFuzzy(ufOpts),

      v$: useVuelidate()
    };
  },
  computed: {
    filterSpaces: function () {
      return this.querySpace === ''
        ? this.clickupSpaces
        : this.search(this.clickupSpaces, this.querySpace);
    },
    filterFolders: function () {
      return this.queryFolder === ''
        ? this.clickupFolders
        : this.search(this.clickupFolders, this.queryFolder);
    },
    filterLists: function () {
      return this.queryList === ''
        ? this.clickupLists
        : this.search(this.clickupLists, this.queryList);
    },
    filterTasks: function () {
      return this.queryTask === ''
        ? this.clickupTasks
        : this.search(this.clickupTasks, this.queryTask);
    }
  },
  mounted() {
    // Register background process listeners
    ipcRenderer.on('new-event', (event, entry) => {
      this.event = entry;
    });

    ipcRenderer.on('set-clickup-spaces', (event, spaces) =>
      this.onClickupSpacesRefreshed(spaces)
    );

    ipcRenderer.on('fetch-clickup-spaces-error', (event, error) =>
      this.error({
        error,
        title: this.$t('notification.fetchSpaces.title'),
        content: this.$t('notification.fetchSpaces.content')
      })
    );

    ipcRenderer.on('set-clickup-folders', (event, folders) =>
      this.onClickupFoldersRefreshed(folders)
    );

    ipcRenderer.on('fetch-clickup-folders-error', (event, error) =>
      this.error({
        error,
        title: this.$t('notification.fetchFolders.title'),
        content: this.$t('notification.fetchFolders.content')
      })
    );

    ipcRenderer.on('set-clickup-lists', (event, lists) =>
      this.onClickupListsRefreshed(lists)
    );

    ipcRenderer.on('fetch-clickup-lists-error', (event, error) =>
      this.error({
        error,
        title: this.$t('notification.fetchLists.title'),
        content: this.$t('notification.fetchLists.content')
      })
    );

    ipcRenderer.on('set-clickup-tasks', (event, tasks) =>
      this.onClickupTasksRefreshed(tasks)
    );

    ipcRenderer.on('fetch-clickup-tasks-error', (event, error) =>
      this.error({
        error,
        title: this.$t('notification.fetchTasks.title'),
        content: this.$t('notification.fetchTasks.content')
      })
    );

    this.getClickupSpaces();
  },
  methods: {
    search: function (haystack, needle) {
      let names = haystack.map((object) => object.name);
      names = uFuzzy.latinize(names);
      let filtered = [];
      let idxs = this.uf.filter(names, needle);
      if (idxs != null && idxs.length > 0) {
        let infoThresh = 1e3;
        if (idxs.length <= infoThresh) {
          let info = this.uf.info(idxs, names, needle);
          let order = this.uf.sort(info, names, needle);
          for (let i = 0; i < order.length; i++) {
            filtered.push(haystack[info.idx[order[i]]]);
          }
        } else {
          for (let i = 0; i < idxs.length; i++) {
            filtered.push(haystack[idxs[i]]);
          }
        }
      }
      return filtered;
    },
    focusNext: function () {
      setTimeout(() => {
        const elem = document.activeElement
          .closest('.form-control')
          .querySelector('input, textarea');
        const elements = Array.from(elem.form.elements).filter(
          (field) =>
            field.nodeName == 'INPUT' ||
            field.nodeName == 'TEXTAREA' ||
            field.nodeName == 'CHECKBOX'
        );
        const currentIndex = elements.indexOf(elem);

        const newTarget =
          elements[currentIndex < elements.length - 1 ? currentIndex + 1 : 0];

        newTarget.focus();
        newTarget.scrollIntoView();
      }, 1);
    },
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

    getClickupSpaces: function () {
      this.loadingClickupSpaces = true;
      ipcRenderer.send('get-clickup-spaces');
    },
    refreshClickupSpaces: function () {
      this.loadingClickupSpaces = true;
      ipcRenderer.send('refresh-clickup-spaces');
    },
    onClickupSpacesRefreshed: function (spaces) {
      this.clickupSpaces = spaces.map((space) => ({
        ...space,
        value: space.id
      }));
      this.loadingClickupSpaces = false;
    },

    getClickupFolders: function () {
      if (this.model.space) {
        this.model.folder = null;
        this.model.list = null;
        this.model.task = null;
        this.loadingClickupFolders = true;
        ipcRenderer.send('get-clickup-folders', this.model.space.id);
        this.focusNext();
      }
    },
    refreshClickupFolders: function () {
      if (this.model.space) {
        this.loadingClickupFolders = true;
        ipcRenderer.send('refresh-clickup-folders', this.model.space.id);
      }
    },
    onClickupFoldersRefreshed: function (folders) {
      this.clickupFolders = folders.map((folder) => ({
        ...folder,
        value: folder.id
      }));
      this.loadingClickupFolders = false;
    },

    getClickupLists: function () {
      if (this.model.folder) {
        this.model.list = null;
        this.model.task = null;
        this.loadingClickupLists = true;
        ipcRenderer.send('get-clickup-lists', this.model.folder.id);
        this.focusNext();
      }
    },
    refreshClickupLists: function () {
      if (this.model.folder) {
        this.loadingClickupLists = true;
        ipcRenderer.send('refresh-clickup-lists', this.model.folder.id);
      }
    },
    onClickupListsRefreshed: function (lists) {
      this.clickupLists = lists.map((list) => ({
        ...list,
        value: list.id
      }));
      this.loadingClickupLists = false;
    },

    getClickupTasks: function () {
      if (this.model.list) {
        this.model.task = null;
        this.loadingClickupTasks = true;
        ipcRenderer.send('get-clickup-tasks', this.model.list.id);
        this.focusNext();
      }
    },
    refreshClickupTasks: function () {
      if (this.model.list) {
        this.loadingClickupTasks = true;
        ipcRenderer.send('refresh-clickup-tasks', this.model.list.id);
      }
    },
    onClickupTasksRefreshed: function (tasks) {
      this.clickupTasks = tasks.map((task) => ({
        ...task,
        value: task.id
      }));
      this.loadingClickupTasks = false;
    },

    cancel: function () {
      ipcRenderer.send('cancel-create');
      window.close();
    },

    createTimeEntry: async function (event) {
      event.preventDefault();
      const isFormCorrect = await this.v$.$validate();
      if (!isFormCorrect) {
        return;
      }
      clickupService
        .createTimeTrackingEntry(
          this.model.task.id,
          this.model.description,
          this.event.start,
          this.event.end,
          [],
          this.model.billable
        )
        .then((entry) => {
          console.info(`Created time tracking entry for: ${entry.task.name}`);
          ipcRenderer.send('request-events-refresh');
          window.close();
        })
        .catch((error) => {
          this.error({
            error,
            title: this.$t('notification.createTimerError.title'),
            content: this.$t('notification.createTimerError.content')
          });
        });
    },
    error: function (options) {
      notification.error({ duration: 5000, ...options });
      if (options.error) {
        console.error(options.error);
      }
    }
  },
  validations() {
    return {
      model: {
        space: {
          rrequired: withI18nMessage(required, {
            messagePath: () => 'validations.space.required'
          })
        },
        folder: {
          required: withI18nMessage(required, {
            messagePath: () => 'validations.folder.required'
          })
        },
        list: {
          required: withI18nMessage(required, {
            messagePath: () => 'validations.list.required'
          })
        },
        task: {
          required: withI18nMessage(required, {
            messagePath: () => 'validations.task.required'
          })
        },
        description: {
          required: withI18nMessage(
            requiredIf(store.get('settings.require_description')),
            { messagePath: () => 'validations.description.required' }
          )
        }
      }
    };
  }
};
</script>
