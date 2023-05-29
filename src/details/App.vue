<template>
  <theme-provider>
    <notification-provider>
      <online-status-provider>
        <splash-screen />
        <div
          class="h-10 fixed w-full top-0 z-10 flex items-center justify-center drag bg-base-100"
        >
          <span class="text-base font-bold"></span>
        </div>
        <div class="h-10"></div>
        <suspense>
          <task-detail />
        </suspense>
      </online-status-provider>
    </notification-provider>
  </theme-provider>
</template>

<script>
import OnlineStatusProvider from '@core/components/OnlineStatusProvider.vue';
import SplashScreen from '@core/components/SplashScreen.vue';
import '@assets/tailwind.css';
import ThemeProvider from '@core/components/ThemeProvider.vue';
import NotificationProvider from '@core/components/NotificationProvider.vue';
import TaskDetail from '@details/views/TaskDetail.vue';

export default {
  name: 'App',
  components: {
    ThemeProvider,
    NotificationProvider,
    OnlineStatusProvider,
    SplashScreen,
    TaskDetail
  },
  setup() {
    return {};
  }
};
</script>
