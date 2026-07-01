<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Bell, MessageCircle, Link2, Settings, Trash2 } from '@lucide/vue'
import { getNotifications, markRead, deleteNotifications } from '~/api/notifications'
import type { NotificationItem } from '~/api/notifications/types'
import { formatDate } from '~/utils/date'
import { useAppStore } from '~/stores/app'

const emit = defineEmits<{
  select: [item: NotificationItem]
}>()

const store = useAppStore()
const list = ref<NotificationItem[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const activeCategory = ref('')
const activeFilter = ref<'all' | 'unread'>('all')
const selectedId = ref<number | null>(null)

// UI 分类 → 后端 type 值映射
const categoryTypeMap: Record<string, string[]> = {
  comment: ['new_comment', 'new_reply'],
  friend_link: ['friend_apply'],
  system: ['system'],
}

const categories = [
  { value: '', label: '全部类型' },
  { value: 'comment', label: '评论' },
  { value: 'friend_link', label: '友链申请' },
  { value: 'system', label: '系统' },
]

const filters = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读' },
]

// 根据 type 推导图标
function typeIcon(type: string) {
  if (type === 'new_comment' || type === 'new_reply') return MessageCircle
  if (type === 'friend_apply') return Link2
  return Settings
}

async function fetchList(reset = false) {
  if (reset) page.value = 1
  loading.value = true
  try {
    const res = await getNotifications({
      page: page.value,
      pageSize,
      types: activeCategory.value ? categoryTypeMap[activeCategory.value]?.join(',') : undefined,
      isRead: activeFilter.value === 'unread' ? '0' : undefined,
    })
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

async function handleDelete(item: NotificationItem) {
  await deleteNotifications([item.id])
  if (!item.isRead && store.unreadCount > 0) store.unreadCount--
  list.value = list.value.filter(n => n.id !== item.id)
  total.value--
  if (selectedId.value === item.id) selectedId.value = null
}

function handleSelect(item: NotificationItem) {
  selectedId.value = item.id
  emit('select', item)
  if (!item.isRead) handleMarkRead(item)
}

watch([activeCategory, activeFilter], () => fetchList(true))

onMounted(() => fetchList())
</script>

<template>
  <div class="list-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="filter-tabs">
        <button
          v-for="f in filters"
          :key="f.value"
          class="tab-btn"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value as typeof activeFilter"
        >
          {{ f.label }}
        </button>
      </div>
      <select v-model="activeCategory" class="category-select">
        <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </div>

    <!-- List -->
    <div v-if="loading" class="list-loading">加载中...</div>

    <div v-else-if="list.length === 0" class="list-empty">
      <Bell :size="28" :stroke-width="1" />
      <p>暂无通知</p>
    </div>

    <div v-else class="list-body">
      <div
        v-for="item in list"
        :key="item.id"
        class="list-item"
        :class="{ unread: !item.isRead, selected: selectedId === item.id }"
        @click="handleSelect(item)"
      >
        <div class="item-left">
          <div class="item-icon">
            <component :is="typeIcon(item.type)" :size="14" :stroke-width="1.5" />
          </div>
          <div class="item-main">
            <div class="item-title">{{ item.title }}</div>
            <div v-if="item.content" class="item-preview">{{ item.content }}</div>
            <div class="item-meta">
              <span class="item-time">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
        </div>
        <button class="item-trash" title="删除" @click.stop="handleDelete(item)">
          <Trash2 :size="13" :stroke-width="1.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.list-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: .0625rem solid var(--color-border);
}

.panel-header {
  flex-shrink: 0;
  padding: .75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  border-bottom: .0625rem solid var(--color-border);
}

.filter-tabs {
  display: flex;
  gap: .125rem;
}

.tab-btn {
  padding: .25rem .625rem;
  border-radius: .25rem;
  border: none;
  background: transparent;
  font-size: .8125rem;
  color: var(--color-base-content);
  opacity: .5;
  cursor: pointer;
  transition: all .15s;
  &:hover { opacity: .8; background: color-mix(in oklab, var(--color-base-content) 6%, transparent); }
  &.active { opacity: 1; background: color-mix(in oklab, var(--color-base-content) 10%, transparent); font-weight: 600; }
}

.category-select {
  padding: .25rem .5rem;
  border: .0625rem solid var(--color-border);
  border-radius: .25rem;
  background: transparent;
  font-size: .75rem;
  color: var(--color-base-content);
  opacity: .6;
  cursor: pointer;
}

.list-loading, .list-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  color: var(--color-base-content);
  opacity: .3;
  font-size: .8125rem;
  p { margin: 0; }
}

.list-body {
  flex: 1;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .625rem 1rem;
  cursor: pointer;
  transition: background .1s;
  border-bottom: .0625rem solid var(--color-border);

  &:hover { background: color-mix(in oklab, var(--color-base-content) 4%, transparent); }
  &.selected { background: color-mix(in oklab, var(--color-base-content) 6%, transparent); }
  &.unread {
    background: color-mix(in oklab, var(--color-base-content) 2.5%, transparent);
    .item-title { font-weight: 600; }
  }
}

.item-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: .5rem;
  min-width: 0;
}

.item-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: .25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklab, var(--color-base-content) 6%, transparent);
  color: var(--color-base-content);
  opacity: .5;
}

.item-main { min-width: 0; }

.item-title {
  font-size: .8125rem;
  line-height: 1.3;
  color: var(--color-base-content);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-preview {
  font-size: .75rem;
  line-height: 1.3;
  color: var(--color-base-content);
  opacity: .4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: .125rem;
}

.item-meta {
  margin-top: .125rem;
  display: flex;
  gap: .375rem;
}

.item-time, .item-type {
  font-size: .6875rem;
  color: var(--color-base-content);
  opacity: .35;
}

.item-trash {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0;
  cursor: pointer;
  border-radius: .25rem;
  transition: all .15s;
  &:hover { background: color-mix(in oklab, #ef4444 15%, transparent); color: #ef4444; }
  .list-item:hover & { opacity: .2; }
  .list-item:hover &:hover { opacity: 1; }
}
</style>
