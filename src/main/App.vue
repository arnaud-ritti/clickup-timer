<template>
  <theme-provider>
    <notification-provider>
      <online-status-provider>
        <splash-screen />
        <header-view />
        <router-view />
      </online-status-provider>
    </notification-provider>
  </theme-provider>
</template>

<script>
import HeaderView from '@main/components/Header.vue';
import OnlineStatusProvider from '@core/components/OnlineStatusProvider.vue';
import SplashScreen from '@core/components/SplashScreen.vue';
import '@assets/tailwind.css';
import ThemeProvider from '@core/components/ThemeProvider.vue';
import NotificationProvider from '@core/components/NotificationProvider.vue';

export default {
  name: 'App',
  components: {
    ThemeProvider,
    NotificationProvider,
    OnlineStatusProvider,
    SplashScreen,
    HeaderView
  },
  setup() {
    return {};
  }
};
</script>
