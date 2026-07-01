<script setup lang="ts">
import { ref } from 'vue'
import NotificationList from './components/NotificationList.vue'
import NotificationDetail from './components/NotificationDetail.vue'
import BaseModal from '~/components/base/Modal.vue'
import type { NotificationItem } from '~/api/notifications/types'

const selectedItem = ref<NotificationItem | null>(null)
const showModal = ref(false)

function handleSelect(item: NotificationItem) {
  selectedItem.value = item
  if (window.innerWidth <= 768) {
    showModal.value = true
  }
}
</script>

<template>
  <div class="page">
    <div class="left">
      <NotificationList @select="handleSelect" />
    </div>
    <div class="right">
      <NotificationDetail :item="selectedItem" />
    </div>

    <BaseModal v-model:open="showModal">
      <div class="modal-card">
        <NotificationDetail :item="selectedItem" />
      </div>
    </BaseModal>
  </div>
</template>

<style scoped lang="less">
.page {
  display: flex;
  height: 100%;
}

.left {
  width: 22rem;
  flex-shrink: 0;
}

.right {
  flex: 1;
  min-width: 0;
}

.modal-card {
  background: var(--color-base-200);
  border-radius: .75rem;
  width: min(32rem, calc(100vw - 2rem));
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

@media (width <= 48rem) {
  .list-panel {
    border-right: none;
  }
  .left { width: 100%; }
  .right { display: none; }
}
</style>
