<script lang="ts" setup>
import { menuRoutes } from "~/router/routes";
import ThemeToggle from "~/components/theme/ThemeToggle.vue";

defineProps<{
  mobile?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleClick() {
  emit("close");
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
        active-class="nav-item--active"
        @click="mobile && handleClick()"
      >
        <component
          :is="route.meta?.icon"
          v-if="route.meta?.icon"
          :size="18"
          class="nav-icon"
        />
        <span>{{ route.meta?.title }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <ThemeToggle />
    </div>
  </div>
</template>

<style scoped lang="less">
.sidebar-root {
  display: flex;
  flex-direction: column;
  min-width: 240px;
  height: 100%;
  padding: 0 12px;
}

/* --- Logo --- */
.logo {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 20px 12px 24px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.4;
}

/* --- Nav --- */
.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-base-content);
  opacity: 0.6;
  text-decoration: none;
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
    background: rgb(128 128 128 / 0.1);
  }

  &--active {
    opacity: 1;
    background: rgb(128 128 128 / 0.15);
    color: var(--color-primary);
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
  padding: 16px 12px;
  border-top: 1px solid var(--color-border);
}
</style>
