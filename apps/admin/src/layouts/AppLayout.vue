<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, CloudUpload, Bell } from '@lucide/vue'
import AppSidebar from './components/AppSidebar.vue'
import { apiClient } from '~/lib/axios'

const menuOpen = ref(false)
const isMobile = ref(false)

const BREAKPOINT = 768

function closeMenu() {
  menuOpen.value = false
}

let mediaQuery: MediaQueryList

async function fetchAdminInfo() {
  try {
    const { data } = await apiClient.get('/admin/config/personalInfo')
    localStorage.setItem('admin', JSON.stringify(data.data.personalInfo))
  } catch { /* 401 拦截器会处理 */ }
}

onMounted(() => {
  fetchAdminInfo()

  mediaQuery = window.matchMedia(`(width <= ${BREAKPOINT}px)`)
  isMobile.value = mediaQuery.matches

  mediaQuery.addEventListener('change', e => {
    isMobile.value = e.matches
    if (!e.matches) {
      menuOpen.value = false
    }
  })
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', () => {})
})
</script>

<template>
  <div class="layout">
    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="menuOpen" class="overlay" @click="closeMenu" />
    </Transition>

    <!-- Desktop Sidebar -->
    <aside class="sidebar">
      <AppSidebar />
    </aside>

    <!-- Mobile Bottom Drawer -->
    <Transition name="drawer">
      <aside v-if="menuOpen" class="mobile-drawer">
        <div class="drawer-header">
          <div class="drawer-handle" />
        </div>
        <div class="drawer-content">
          <AppSidebar mobile @close="closeMenu" />
        </div>
      </aside>
    </Transition>

    <!-- Main -->
    <div class="main-wrapper">
      <header v-if="isMobile" class="header">
        <div class="header-left">
          <button class="header-btn" @click="menuOpen = true">
            <Menu :size="22" />
          </button>
        </div>
        <div class="header-right">
          <button class="header-btn">
            <Bell :size="22" />
          </button>
          <button class="header-btn">
            <CloudUpload :size="22" />
          </button>
        </div>
      </header>
      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped lang="less">
@sidebarWidth: 240px;
@drawerRadius: 20px;

.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--color-base-100);
}

/* --- Sidebar --- */
.sidebar {
  width: @sidebarWidth;
  flex-shrink: 0;
  background: var(--color-base-200);
  overflow: hidden;
  transition: width 0.3s ease;
}

/* --- Main --- */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: flex-basis 0.3s ease;
}

.header {
  padding: 0 8px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-base-100);
  .header-left {
    display: flex;
    justify-content: start;
    align-items: center;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .header-btn {
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
  }
}

.main {
  flex: 1;
  overflow-y: auto;
  padding: 24px 24px 0px;
}

/* --- Overlay --- */
.overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.5);
  z-index: 40;
}

/* --- Mobile Bottom Drawer --- */
.mobile-drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 75vh;
  background: var(--color-base-200);
  border-top-left-radius: @drawerRadius;
  border-top-right-radius: @drawerRadius;
  box-shadow:
    0 -10px 30px rgb(0 0 0 / 0.12),
    0 -2px 10px rgb(0 0 0 / 0.08);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px 8px;
  flex-shrink: 0;
}

.drawer-handle {
  width: 48px;
  height: 5px;
  border-radius: 999px;
  background: rgb(120 120 120 / 0.35);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
}

/* --- Responsive --- */
@media (width <= 768px) {
  .sidebar {
    width: 0;
  }

  .main {
    padding: 16px 16px 0px;
  }
}

/* --- Transitions --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.28s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}
</style>
