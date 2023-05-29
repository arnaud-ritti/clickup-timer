<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-base-100"
    >
      <img class="absolute w-72 animate-pulse" src="assets/images/wave.gif" />
      <img
        class="absolute w-28 animate-pulse"
        style="filter: drop-shadow(0px 6px 6px #e2e2e2)"
        src="assets/images/icon/icon.png"
      />
    </div>
  </transition>
</template>

<script>
import { waitAsync } from '@core/helpers';
export default {
  data: () => ({
    visible: false
  }),

  mounted: function () {
    this.visible = true;
    document.body.classList.add('overflow-hidden');

    waitAsync(1900).then(() => {
      this.visible = false;
      document.body.classList.remove('overflow-hidden');
    });
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
