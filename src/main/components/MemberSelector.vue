<template>
  <Transition name="member-selector">
    <div
      v-show="open"
      class="member-selector select-none flex fixed top-20 inset-x-0 z-10 overflow-x-scroll overflow-y-hidden bg-white shadow-inner drop-shadow-xl h-[80px] px-4"
    >
      <!-- START: Loading state -->
      <div v-if="loading" class="self-center w-full text-center">
        {{ $t('members.loading') }}
      </div>

      <!-- START: Empty state -->
      <div
        v-if="!loading && !users.length"
        class="self-center w-full text-center"
      >
        {{ $t('members.noUsers') }}
      </div>

      <!-- START: Avatars -->
      <div
        v-if="!loading && users.length"
        class="flex items-center space-x-2 h-full px-2 pb-1 mx-auto avatars-container"
      >
        <div class="relative leading-[0]" v-for="user in users" :key="user.id">
          <router-link
            :to="{ name: 'team', params: { userId: user.id } }"
            class="avatar group no-drag"
            :class="{ placeholder: !user?.profilePicture }"
            replace
          >
            <div
              class="w-12 rounded-full"
              :class="{
                'bg-neutral-focus text-neutral-content': !user?.profilePicture,
                'ring ring-primary ring-offset-base-100 ring-offset-2':
                  active == user?.id
              }"
            >
              <img v-if="user?.profilePicture" :src="user.profilePicture" />
              <span v-else>{{ user?.initials }}</span>
            </div>
            <span
              class="pointer-events-none absolute z-30 top-0 left-1/2 w-0 h-12 rounded-full px-2 py-1.5 text-center text-sm transform-gpu -translate-x-1/2 opacity-0 transition-all group-hover:opacity-100 group-hover:w-56 bg-neutral-focus text-neutral-content"
              :class="{
                'ring ring-primary ring-offset-base-100 ring-offset-2':
                  active == user.id
              }"
            >
              {{ user.username }}
              <span class="block text-xs">
                {{ user.email }}
              </span>
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import clickupService from '@core/clickup/service';
import { RouterLink } from 'vue-router';

export default {
  props: {
    open: Boolean,
    active: String
  },

  components: { RouterLink },

  setup(props) {
    let loading = ref(true);
    let users = ref([]);

    onMounted(() => fetchUsers());

    const fetchUsers = function () {
      loading.value = true;

      clickupService.getCachedUsers().then((result) => {
        users.value = result;
        loading.value = false;
      });
    };

    watch(
      () => props.open,
      (open) => {
        // We need to also slide down the entire calendar so things look nice
        const vueCalRoots = document.getElementsByClassName('vuecal');

        if (!vueCalRoots.length) return;

        if (open) {
          return vueCalRoots[0].classList.add('vuecal--member-selector-open');
        }

        return vueCalRoots[0].classList.remove('vuecal--member-selector-open');
      }
    );

    return {
      loading,
      users,
      fetchUsers
    };
  }
};
</script>

<style>
.member-selector {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Member selection transition */
.member-selector-enter-active {
  transition: all 0.2s ease;
}

.member-selector-leave-active {
  transition: all 0.2s ease;
}

.member-selector-enter-from,
.member-selector-leave-to {
  top: -80px;
  opacity: 0;
}

/* VueCal top margin transition */
.vuecal {
  transition: all 0.2s ease;
}
.vuecal.vuecal--member-selector-open {
  margin-top: 80px;
}

/* Hide scrollbar */
.avatars-container::-webkit-scrollbar {
  display: none;
}

/* Sharper interpolation */
.avatars-container img {
  image-rendering: optimizeQuality;
}
</style>
