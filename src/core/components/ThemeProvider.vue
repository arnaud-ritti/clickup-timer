<template>
  <div class="w-full min-h-full" :data-theme="state.theme">
    <slot />
  </div>
</template>

<script>
import { provide, reactive, readonly, toRefs } from 'vue';
import store from '@core/store';
import { ipcRenderer } from 'electron';

// We use symbols as unique identifiers.
export const ThemeStateSymbol = Symbol('Theme state provider identifier');
export const ThemeUpdateSymbol = Symbol('Theme update provider identifier');

export default {
  setup() {
    const state = reactive({
      theme: store.get('settings.theme') ?? 'system'
    });

    provide(ThemeStateSymbol, toRefs(readonly(state)));
    const update = (value) => {
      state.theme = value;
      document.body.dataset.theme = value;
    };
    provide(ThemeUpdateSymbol, update);

    return {
      state,
      update
    };
  },
  mounted() {
    if (
      !store.get('settings.theme') ||
      store.get('settings.theme') == 'system'
    ) {
      const isDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newColorScheme = isDark ? 'dark' : 'light';
      this.update(newColorScheme);
    }

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        const newColorScheme = event.matches ? 'dark' : 'light';
        if (
          !store.get('settings.theme') ||
          store.get('settings.theme') == 'system'
        ) {
          this.update(newColorScheme);
        }
      });

    ipcRenderer.on('update-theme', () => {
      this.update(store.get('settings.theme'));
    });
  }
};
</script>
