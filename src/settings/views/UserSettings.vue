<template>
  <div class="grid grid-cols-1 gap-4 p-3 pb-4 pt-0">
    <form ref="form">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{
            $t('settings.clickupAccessToken')
          }}</span>
        </label>
        <input
          v-model="model.clickup_access_token"
          type="text"
          placeholder="pk_"
          class="input input-bordered w-full"
          :class="{
            'input-error':
              v$.model.clickup_access_token?.$dirty &&
              v$.model.clickup_access_token?.$errors.length
          }"
        />
        <label
          class="label text-error"
          v-for="error of v$.model.clickup_access_token?.$errors"
          :key="error.$uid"
        >
          {{ error.$message }}
        </label>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('settings.clickupTeamId') }}</span>
        </label>
        <input
          v-model="model.clickup_team_id"
          type="text"
          class="input input-bordered w-full"
          :class="{
            'input-error':
              v$.model.clickup_team_id?.$dirty &&
              v$.model.clickup_team_id?.$errors.length
          }"
        />
        <label
          class="label text-error"
          v-for="error of v$.model.clickup_team_id?.$errors"
          :key="error.$uid"
        >
          {{ error.$message }}
        </label>
      </div>

      <div class="flex space-x-4">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('settings.dayStartsAt') }}</span>
          </label>
          <input
            v-model="model.day_start"
            type="time"
            class="input input-bordered w-full"
            :class="{
              'input-error':
                v$.model.day_start?.$dirty && v$.model.day_start?.$errors.length
            }"
          />
          <label
            class="label text-error"
            v-for="error of v$.model.day_start?.$errors"
            :key="error.$uid"
          >
            {{ error.$message }}
          </label>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('settings.dayEndsAt') }}</span>
          </label>
          <input
            v-model="model.day_end"
            type="time"
            class="input input-bordered w-full"
            pattern="[0-9]{2}:[0-9]{2}"
            :class="{
              'input-error':
                v$.model.day_end?.$dirty && v$.model.day_end?.$errors.length
            }"
          />
          <label
            class="label text-error"
            v-for="error of v$.model.day_end?.$errors"
            :key="error.$uid"
          >
            {{ error.$message }}
          </label>
        </div>
      </div>

      <!-- START | Feature toggles -->
      <div class="card card-compact bg-base-200 my-6 pt-2 pb-3">
        <div class="card-body">
          <h2 class="card-title">{{ $t('settings.optionalFeatures') }}</h2>

          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">{{ $t('settings.uiTheme') }}</span>
              <select
                v-model="model.theme"
                class="select select-bordered"
                @change="onThemeChange"
              >
                <option v-for="option in themes" :value="option" :key="option">
                  {{ $t(`themes.${option}`) }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">{{ $t('settings.showWeekends') }}</span>
              <input
                v-model="model.show_weekend"
                type="checkbox"
                class="toggle"
              />
            </label>
          </div>

          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">{{
                $t('settings.requireDescriptions')
              }}</span>
              <input
                v-model="model.require_description"
                type="checkbox"
                class="toggle"
              />
            </label>
          </div>

          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">{{
                $t('settings.defaultBillable')
              }}</span>
              <input
                v-model="model.billable_default"
                type="checkbox"
                class="toggle"
              />
            </label>
          </div>

          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">
                {{ $t('settings.showUnassingedTask') }}
              </span>
              <input
                v-model="model.show_unassigned_task"
                type="checkbox"
                class="toggle"
              />
            </label>
          </div>

          <div class="form-control w-full">
            <label class="label cursor-pointer">
              <span class="label-text">
                {{ $t('settings.enableAdmin.main') }}

                <span class="block label-text-alt">{{
                  $t('settings.enableAdmin.sub')
                }}</span>
              </span>
              <input
                v-model="model.admin_features_enabled"
                type="checkbox"
                class="toggle"
              />
            </label>
          </div>

          <div class="divider">{{ $t('settings.dangerZone') }}</div>

          <n-popconfirm
            :show-icon="false"
            v-model:show="flushConfirm"
            class="!rounded !p-4"
          >
            <template #trigger>
              <button type="button" class="btn btn-warning btn-sm">
                {{ $t('action.flushCaches') }}
              </button>
            </template>

            <p class="text-sm text-center w-full">
              {{ $t('action.flushCachesConfirm') }}
            </p>

            <template #action>
              <div class="flex w-full justify-center gap-2 pt-2">
                <button
                  type="button"
                  class="btn btn-sm btn-ghost"
                  @click="flushConfirm = false"
                >
                  {{ $t('action.cancel') }}
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-accent"
                  @click="flushCaches"
                >
                  {{ $t('action.confirm') }}
                </button>
              </div>
            </template>
          </n-popconfirm>
        </div>
      </div>
      <!-- END | Feature toggles -->

      <div class="flex justify-end mt-4 space-x-2">
        <button
          type="button"
          class="btn btn-outline btn-secondary"
          @click="cancel"
        >
          {{ $t('action.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" @click="persist">
          {{ $t('action.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, inject } from 'vue';
import { NPopconfirm } from 'naive-ui';
import clickupService from '@core/clickup/service';
import store from '@core/store';
import cache from '@core/store/cache';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, withI18nMessage } from '@core/i18n/validators';
import { timeToMinutes } from '@core/helpers';
import {
  ThemeStateSymbol,
  ThemeUpdateSymbol
} from '@core/components/ThemeProvider.vue';
import { ipcRenderer } from 'electron';

export default {
  components: { NPopconfirm },

  setup() {
    const form = ref(null);
    const model = ref(store.get('settings') || {});
    const { theme } = inject(ThemeStateSymbol);
    const updateTheme = inject(ThemeUpdateSymbol);
    model.value.theme = theme;
    const currentTheme = `${theme.value}`;
    const onThemeChange = (event) => {
      updateTheme(event.target.value);
    };

    return {
      flushConfirm: ref(false),
      form,
      currentTheme,
      model,
      onThemeChange,
      v$: useVuelidate()
    };
  },
  data() {
    return {
      themes: [
        'system',
        'light',
        'dark',
        'cupcake',
        'bumblebee',
        'emerald',
        'corporate',
        'synthwave',
        'retro',
        'cyberpunk',
        'valentine',
        'halloween',
        'garden',
        'forest',
        'aqua',
        'lofi',
        'pastel',
        'fantasy',
        'wireframe',
        'black',
        'luxury',
        'dracula',
        'cmyk',
        'autumn',
        'business',
        'acid',
        'lemonade',
        'night',
        'coffee',
        'winter'
      ]
    };
  },
  methods: {
    persist: async function (e) {
      e.preventDefault();
      const isFormCorrect = await this.v$.$validate();
      if (!isFormCorrect) {
        return;
      }

      const mustFlushCachesAfterPersist = () => {
        return (
          this.model.clickup_access_token !==
            store.get('settings.clickup_access_token') ||
          this.model.clickup_team_id !== store.get('settings.clickup_team_id')
        );
      };

      const mustReloadThemeAfterPersist = () => {
        return this.model.theme !== this.currentTheme;
      };

      if (mustFlushCachesAfterPersist()) {
        cache.flush();
      }

      store.set({ settings: this.model });

      if (mustReloadThemeAfterPersist()) {
        ipcRenderer.send('update-theme');
      }

      notification.success({
        title: this.$t('notification.settingsSaved'),
        duration: 1500
      });

      ipcRenderer.send('reload');
      window.close();
    },
    flushCaches: function () {
      cache.flush();
      this.flushConfirm = false;
      notification.success({
        title: this.$t('notification.cachesFlushed'),
        duration: 1500
      });
    },
    cancel: function () {
      window.close();
    }
  },
  validations() {
    return {
      model: {
        clickup_access_token: {
          required: withI18nMessage(required, {
            messagePath: () => 'validations.clickup_access_token.required'
          }),
          minLenght: withI18nMessage(minLength(43), {
            messagePath: () => 'validations.clickup_access_token.minLenght'
          }),
          valid: withI18nMessage(
            (value) => {
              try {
                return !!clickupService.tokenValid(value);
              } catch (error) {
                return false;
              }
            },
            { messagePath: () => 'validations.clickup_access_token.valid' }
          )
        },
        clickup_team_id: {
          required: withI18nMessage(required, {
            messagePath: () => 'validations.clickup_team_id.required'
          }),
          minLenght: withI18nMessage(minLength(1), {
            messagePath: () => 'validations.clickup_team_id.minLenght'
          })
        },
        day_start: {
          required,
          valid: withI18nMessage(
            (value, siblings) =>
              !(timeToMinutes(value) >= timeToMinutes(siblings.day_end)),
            { messagePath: () => 'validations.day_start.valid' }
          )
        },
        day_end: {
          required,
          valid: withI18nMessage(
            (value, siblings) =>
              !(timeToMinutes(value) <= timeToMinutes(siblings.day_start)),
            { messagePath: () => 'validations.day_end.valid' }
          )
        }
      }
    };
  }
};
</script>
