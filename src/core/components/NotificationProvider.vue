<template>
  <div>
    <slot />
  </div>
</template>

<script>
import { provide, reactive, readonly, toRefs } from 'vue';

// We use symbols as unique identifiers.
export const NotificationStateSymbol = Symbol(
  'Notification state provider identifier'
);
export const NotificationUpdateymbol = Symbol(
  'Notification update provider identifier'
);

export default {
  setup() {
    const state = reactive({
      notification: 'dark'
    });

    provide(NotificationStateSymbol, toRefs(readonly(state)));
    const update = (property, value) => {
      state[property] = value;
    };
    provide(NotificationUpdateymbol, update);
    return {
      state
    };
  }
};
</script>
