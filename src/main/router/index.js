import { createRouter, createWebHashHistory } from 'vue-router';
import TimeTracker from '@main/views/TimeTracker.vue';
import TeamMemberEntries from '@main/views/TeamMemberEntries.vue';
import { ipcRenderer } from 'electron';
import store from '@core/store';

const routes = [
  {
    path: '/',
    name: 'time-tracker',
    component: TimeTracker,
    beforeEnter: (to, from, next) => {
      // Redirect to settings view if required settings are not set
      if (
        store.get('settings.clickup_access_token') &&
        store.get('settings.clickup_team_id')
      ) {
        return next();
      }
      ipcRenderer.send('open-settings');
    }
  },
  {
    path: '/team/:userId',
    name: 'team',
    component: TeamMemberEntries,
    beforeEnter: (to, from, next) => {
      // Redirect to settings view if required settings are not set
      if (store.get('settings.admin_features_enabled')) {
        return next();
      }

      next({ name: 'time-tracker' });
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
