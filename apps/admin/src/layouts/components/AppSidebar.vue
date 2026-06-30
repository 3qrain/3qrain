<script lang="ts" setup>
import { menuRoutes } from '~/router/routes'
import ThemeToggle from '~/components/theme/ThemeToggle.vue'
import { Bell } from '@lucide/vue'
import { useGlobalStore } from '~/stores/global.ts'
import { useAppStore } from '~/stores/app'
import { storeToRefs } from 'pinia'

defineProps<{
  mobile?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { drawerPanel } = storeToRefs(useGlobalStore())
const appStore = useAppStore()

function handleClick() {
  emit('close')
}

function openNotifications() {
  drawerPanel.value = 'notify'
  if (window.innerWidth <= 768) return
  // desktop: toggle
  drawerPanel.value = drawerPanel.value === 'notify' ? 'notify' : 'notify'
  // 实际上 drawer 在桌面端才显示，但桌面端一般用抽屉不太合适
  // 这里在桌面端也打开抽屉
}
</script>

<template>
  <div class="sidebar-root">
    <!-- Logo -->
    <div class="logo">
      <span class="logo-text">3qrain</span>
      <span class="logo-badge">Admin</span>
    </div>

    <!-- Nav -->
    <nav class="nav">
      <router-link
        v-for="route in menuRoutes"
        :key="route.path"
        :to="route.path"
        class="nav-item"
        active-class="nav-item-active"
        @click="mobile && handleClick()"
      >
        <component
          :is="route.meta?.icon"
          v-if="route.meta?.icon"
          style="width: 1.125rem; height: 1.125rem"
          class="nav-icon"
        />
        <span>{{ route.meta?.title }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="notify-btn" @click="openNotifications">
        <Bell style="width: 1.125rem; height: 1.125rem;" />
        <span v-if="appStore.unreadCount > 0" class="notify-badge">
          {{ appStore.unreadCount > 99 ? '99+' : appStore.unreadCount }}
        </span>
      </button>
      <ThemeToggle />
    </div>
  </div>
</template>

<style scoped lang="less">
.sidebar-root {
  display: flex;
  flex-direction: column;
  min-width: 15rem;
  height: 100%;
  padding: 0 0.75rem;
}

/* --- Logo --- */
.logo {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  padding: 1.25rem 0.75rem 1.5rem;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.0313rem;
}

.logo-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
  opacity: 0.4;
}

/* --- Nav --- */
.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border-radius: .375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-base-content);
  opacity: 0.6;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;

  &:not(&-active):hover {
    opacity: 0.9;
    background: color-mix(in oklab, var(--color-base-content) 10%, transparent);
  }

  &-active {
    opacity: 1;
    background: var(--color-menu-active-bg);
    box-shadow: 0 0.125rem 0.1875rem -0.125rem var(--color-menu-active-bg);
    color: var(--color-menu-active-fg);
  }
}

.nav-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.nav-item--active .nav-icon {
  opacity: 1;
}

/* --- Footer --- */
.sidebar-footer {
  flex-shrink: 0;
  padding: 1rem 0.75rem;
  border-top: 0.0625rem solid var(--color-border);
  display: flex;
  align-items: center;
  gap: .5rem;
}

.notify-btn {
  position: relative;
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-base-content);
  opacity: .5;
  cursor: pointer;
  border-radius: .375rem;
  transition: opacity .15s, background .15s;
  &:hover { opacity: .8; background: color-mix(in oklab, var(--color-base-content) 10%, transparent); }
}

.notify-badge {
  position: absolute;
  top: .125rem;
  right: .125rem;
  min-width: 1rem;
  height: 1rem;
  padding: 0 .1875rem;
  border-radius: 62.4375rem;
  background: #ef4444;
  color: #fff;
  font-size: .5625rem;
  font-weight: 700;
  line-height: 1rem;
  text-align: center;
}
</style>
