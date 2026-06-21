<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, CloudUpload, Bell } from '@lucide/vue'
import AppSidebar from './components/AppSidebar.vue'
import Drawer from '~/components/base/Drawer.vue'
import Notification from '~/components/notification/Notification.vue'
import UppyUploader from '~/components/uppy-uploader/UppyUploader.vue'
import { apiClient } from '~/lib/axios'
import { useGlobalStore, type DrawerPanel } from '~/stores/global.ts'
import { storeToRefs } from 'pinia'
import { syncThemeFromServer } from '~/css/themes/index'

const { drawerPanel } = storeToRefs(useGlobalStore())

const isMobile = ref(false)

const BREAKPOINT = 768

function openPanel(panel: DrawerPanel) {
  drawerPanel.value = panel
}

let mediaQuery: MediaQueryList

async function fetchAdminInfo() {
  try {
    const { data } = await apiClient.get('/admin/profile')
    localStorage.setItem('admin', JSON.stringify(data.data))
  } catch { /* 401 拦截器会处理 */ }
}

onMounted(() => {
  fetchAdminInfo()
  syncThemeFromServer()

  mediaQuery = window.matchMedia(`(width <= ${BREAKPOINT}px)`)
  isMobile.value = mediaQuery.matches

  mediaQuery.addEventListener('change', e => {
    isMobile.value = e.matches
    if (!e.matches) drawerPanel.value = null
  })
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', () => {})
})
</script>

<template>
  <div class="layout">
    <!-- Desktop Sidebar -->
    <aside class="sidebar">
      <AppSidebar />
    </aside>

    <!-- Mobile Bottom Drawer -->
    <Drawer :open="drawerPanel !== null" @update:open="(v) => !v && (drawerPanel = null)">
      <AppSidebar v-if="drawerPanel === 'menu'" mobile @close="drawerPanel = null" />
      <Notification v-else-if="drawerPanel === 'notify'" />
      <UppyUploader v-else-if="drawerPanel === 'upload'" />
    </Drawer>

    <!-- Main -->
    <div class="main-wrapper">
      <header v-if="isMobile" class="header">
        <div class="header-left">
          <button class="header-btn" @click="openPanel('menu')">
            <Menu style="width: 1.375rem; height: 1.375rem;" />
          </button>
        </div>
        <div class="header-right">
          <button class="header-btn" @click="openPanel('notify')">
            <Bell style="width: 1.375rem; height: 1.375rem;" />
          </button>
          <button class="header-btn" @click="openPanel('upload')">
            <CloudUpload style="width: 1.375rem; height: 1.375rem;" />
          </button>
        </div>
      </header>
      <main class="main">
        <router-view v-slot="{ Component }">
          <Transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped lang="less">
@sidebarWidth: 15rem;

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
  background: linear-gradient(to right, var(--color-base-200), var(--color-base-100));
  // background: linear-gradient(to right, var(--color-base-100), var(--color-base-200));
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
  padding: 0 .5rem;
  height: 3.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: .0625rem solid var(--color-border);
  background: var(--color-base-100);
  .header-left {
    display: flex;
    justify-content: start;
    align-items: center;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: .3125rem;
  }
  .header-btn {
    width: 2.75rem;
    height: 2.75rem;
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
  padding: 1.5rem 1.5rem 0rem;
}

/* --- Responsive --- */
@media (width <= 48rem) {
  .sidebar {
    width: 0;
  }

  .main {
    padding: 1rem 1rem 0rem;
  }
}

/* Page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity .12s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
