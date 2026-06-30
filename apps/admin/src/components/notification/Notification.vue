<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bell, MessageCircle, Reply, Trash2, CheckCheck } from '@lucide/vue'
import { useAppStore } from '~/stores/app'
import { getNotifications, markRead, markAllRead, deleteNotification, clearRead } from '~/api/notifications'
import type { NotificationItem } from '~/api/notifications/types'
import { formatDate } from '~/utils/date'

const store = useAppStore()
const list = ref<NotificationItem[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const pageSize = 20

function typeIcon(type: string) {
  return type === 'new_reply' ? Reply : MessageCircle
}

function typeLabel(type: string) {
  switch (type) {
    case 'new_reply': return '新回复'
    case 'new_comment': return '新评论'
    default: return '系统'
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getNotifications({ page: page.value, pageSize })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function handleMarkRead(item: NotificationItem) {
  if (item.isRead) return
  await markRead(item.id)
  item.isRead = 1
  if (store.unreadCount > 0) store.unreadCount--
}

async function handleMarkAllRead() {
  await markAllRead()
  for (const item of list.value) item.isRead = 1
  store.unreadCount = 0
}

async function handleDelete(item: NotificationItem) {
  await deleteNotification(item.id)
  if (!item.isRead && store.unreadCount > 0) store.unreadCount--
  list.value = list.value.filter(n => n.id !== item.id)
  total.value--
}

async function handleClearRead() {
  const readIds = list.value.filter(n => n.isRead).map(n => n.id)
  if (readIds.length === 0) return
  await clearRead()
  list.value = list.value.filter(n => !n.isRead)
  total.value = list.value.length
}

onMounted(fetchList)
</script>

<template>
  <div class="notify-panel">
    <!-- Header -->
    <div class="notify-header">
      <span class="notify-title">
        通知
        <span v-if="store.unreadCount > 0" class="badge">{{ store.unreadCount }}</span>
      </span>
      <div class="notify-actions">
        <button v-if="store.unreadCount > 0" class="act-btn" @click="handleMarkAllRead">全部已读</button>
        <button v-if="list.some(n => n.isRead)" class="act-btn" @click="handleClearRead">清空已读</button>
      </div>
    </div>

    <!-- List -->
    <div v-if="loading" class="notify-loading">加载中...</div>

    <div v-else-if="list.length === 0" class="notify-empty">
      <Bell :size="36" :stroke-width="1" />
      <p>暂无通知</p>
    </div>

    <div v-else class="notify-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="notify-item"
        :class="{ unread: !item.isRead }"
        @click="handleMarkRead(item)"
      >
        <div class="item-icon">
          <component :is="typeIcon(item.type)" :size="16" :stroke-width="1.5" />
        </div>
        <div class="item-body">
          <div class="item-title">
            <span class="item-type">{{ typeLabel(item.type) }}</span>
            {{ item.title }}
          </div>
          <p v-if="item.content" class="item-content">{{ item.content }}</p>
          <span class="item-time">{{ formatDate(item.createdAt) }}</span>
        </div>
        <button class="item-delete" title="删除" @click.stop="handleDelete(item)">
          <Trash2 :size="14" :stroke-width="1.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.notify-panel {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notify-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem .75rem;
  flex-shrink: 0;
}

.notify-title {
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: .5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 .3125rem;
  border-radius: 62.4375rem;
  background: #ef4444;
  color: #fff;
  font-size: .6875rem;
  font-weight: 600;
}

.notify-actions {
  display: flex;
  gap: .5rem;
}

.act-btn {
  font-size: .75rem;
  border: none;
  background: transparent;
  color: var(--color-base-content);
  opacity: .5;
  cursor: pointer;
  &:hover { opacity: .8; }
}

.notify-loading {
  text-align: center;
  padding: 3rem 0;
  font-size: .875rem;
  color: var(--color-base-content);
  opacity: .4;
}

.notify-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  color: var(--color-base-content);
  opacity: .3;
  p { font-size: .875rem; margin: 0; }
}

.notify-list {
  flex: 1;
  overflow-y: auto;
}

.notify-item {
  display: flex;
  gap: .625rem;
  padding: .75rem 1rem;
  cursor: pointer;
  transition: background .15s;
  border-bottom: .0625rem solid var(--color-border);

  &:hover { background: color-mix(in oklab, var(--color-base-content) 5%, transparent); }

  &.unread {
    background: color-mix(in oklab, var(--color-base-content) 3%, transparent);
    .item-title { font-weight: 600; }
  }
}

.item-icon {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: .375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklab, var(--color-base-content) 8%, transparent);
  color: var(--color-base-content);
  opacity: .6;
  margin-top: .125rem;
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: .8125rem;
  line-height: 1.4;
  color: var(--color-base-content);
}

.item-type {
  font-size: .6875rem;
  padding: .0625rem .375rem;
  border-radius: .1875rem;
  background: color-mix(in oklab, var(--color-base-content) 10%, transparent);
  margin-right: .375rem;
}

.item-content {
  margin: .25rem 0 0;
  font-size: .75rem;
  color: var(--color-base-content);
  opacity: .5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  display: block;
  margin-top: .25rem;
  font-size: .6875rem;
  color: var(--color-base-content);
  opacity: .35;
}

.item-delete {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0;
  cursor: pointer;
  border-radius: .25rem;
  transition: opacity .15s, background .15s;
  &:hover { background: color-mix(in oklab, #ef4444 15%, transparent); color: #ef4444; }
  .notify-item:hover & { opacity: .3; }
  .notify-item:hover &:hover { opacity: 1; }
}
</style>
