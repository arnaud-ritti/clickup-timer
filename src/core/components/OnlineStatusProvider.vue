<template>
  <v-offline @detected-condition="onlineStatusChanged">
    <slot v-if="online" />

    <template v-else>
      <div class="fixed inset-0 flex flex-col items-center justify-center">
        <wifi-icon class="h-6 mb-2 text-error -mt-14 w- animate-ping" />

        <h1 class="my-3 text-3xl text-gray-700">
          {{ $t('offline.title') }}
        </h1>

        <p class="mb-3">
          {{ $t('offline.hint') }}
        </p>
        <kbd class="kbd"> ⌘ + R </kbd>
      </div>
    </template>
  </v-offline>
</template>

<script>
import { ref } from 'vue';
import { VOffline } from 'v-offline';
import { WifiIcon } from '@heroicons/vue/24/solid';

export default {
  components: {
    VOffline,
    WifiIcon
  },

  setup() {
    const online = ref(true);
    return {
      online,
      onlineStatusChanged: function (e) {
        online.value = e;
      }
    };
  }
};
</script>
