<script lang="ts" setup>
import { ref } from "vue";
import { Menu } from "@lucide/vue";

const menuOpen = ref(false);
</script>

<template>
  <div class="layout">
    <!-- Overlay -->
    <div v-if="menuOpen" class="overlay" @click="menuOpen = false" />

    <!-- Sidebar -->
    <aside class="sidebar">
      <slot name="sidebar">
        <nav class="nav">
          <router-link to="/dashboard">仪表盘</router-link>
        </nav>
      </slot>
    </aside>

    <!-- Mobile drawer -->
    <Transition name="slide">
      <aside v-if="menuOpen" class="drawer">
        <slot name="sidebar">
          <nav class="nav">
            <router-link to="/dashboard" @click="menuOpen = false">仪表盘</router-link>
          </nav>
        </slot>
      </aside>
    </Transition>

    <!-- Main -->
    <main class="main">
      <button class="menu-btn" @click="menuOpen = !menuOpen">
        <Menu :size="24" />
      </button>
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="less">
@sidebarWidth: 240px;

/* --- Sidebar --- */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: @sidebarWidth;
  background: var(--color-base-200);
  border-right: 1px solid var(--color-border);
  padding: 20px;
  overflow-y: auto;
  z-index: 30;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.drawer,
.overlay,
.menu-btn {
  display: none;
}

/* --- Main --- */
.main {
  margin-left: @sidebarWidth;
  padding: 24px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

/* --- Responsive --- */
@media (width <= 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .main {
    margin-left: 0;
  }

  .menu-btn {
    display: block;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 16px;
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 20;
  }

  .drawer {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 40;
    background: var(--color-base-200);
    border-radius: 16px 16px 0 0;
    padding: 24px 20px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.25s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(100%);
  }
}
</style>
