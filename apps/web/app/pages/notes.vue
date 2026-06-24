<script setup lang="ts">
import type { PaginatedData, NoteItem } from '~/types/api'
import { formatRelativeTime } from '~/utils/date'

const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.query.page) || 1)

const { data: res, status } = await useAPI<PaginatedData<NoteItem>>(
  computed(() => `/notes?page=${page.value}&pageSize=20`),
)

const notes = computed(() => res.value?.data?.list ?? [])
const total = computed(() => res.value?.data?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 20))

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  router.push({ query: { ...route.query, page: p > 1 ? p : undefined } })
}

useHead({ title: '说说 - 3qrain' })
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>说说</h1>
      <p class="page-desc">共 {{ total }} 条</p>
    </header>

    <div v-if="status === 'pending'" class="loading">加载中...</div>

    <div v-else-if="notes.length" class="notes-timeline">
      <div v-for="note in notes" :key="note.id" class="note-item">
        <div class="note-dot" />
        <div class="note-card">
          <p class="note-content">{{ note.content }}</p>

          <div v-if="note.media.length" :class="['note-images', `count-${Math.min(note.media.length, 4)}`]">
            <div
              v-for="m in note.media"
              :key="m.id"
              class="note-img-wrap"
            >
              <img
                :src="m.thumbnailUrl || m.url || ''"
                :style="m.placeholder ? { background: `url(${m.placeholder}) center/cover` } : {}"
                loading="lazy"
                class="note-img"
              />
            </div>
          </div>

          <div class="note-footer">
            <div v-if="note.tags.length" class="note-tags">
              <span v-for="tag in note.tags" :key="tag.id" class="tag"># {{ tag.name }}</span>
            </div>
            <time class="note-time">{{ formatRelativeTime(note.createdAt) }}</time>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty">还没有说说。</div>

    <nav v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" class="page-btn" @click="goPage(page - 1)">←</button>
      <template v-for="p in totalPages" :key="p">
        <button
          v-if="p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)"
          :class="['page-btn', { active: p === page }]"
          @click="goPage(p)"
        >
          {{ p }}
        </button>
        <span
          v-else-if="p === page - 3 || p === page + 3"
          class="ellipsis"
        >...</span>
      </template>
      <button :disabled="page >= totalPages" class="page-btn" @click="goPage(page + 1)">→</button>
    </nav>
  </div>
</template>

<style scoped lang="less">
.page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.page-header {
  padding: 3rem 0 2rem;

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
  }
}

.page-desc {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  opacity: 0.35;
}

.loading,
.empty {
  padding: 4rem 0;
  text-align: center;
  font-size: 0.9375rem;
  opacity: 0.35;
}

.notes-timeline {
  position: relative;
  padding-left: 1.5rem;

  &::before {
    content: '';
    position: absolute;
    left: 0.3125rem;
    top: 0.625rem;
    bottom: 0.625rem;
    width: 1px;
    background: var(--color-border);
  }
}

.note-item {
  position: relative;
  padding-bottom: 1.5rem;

  &:last-child { padding-bottom: 0; }
}

.note-dot {
  position: absolute;
  left: -1.25rem;
  top: 0.625rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: color-mix(in oklab, var(--color-base-content) 25%, transparent);
}

.note-card {
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  transition: border-color 0.2s;

  &:hover {
    border-color: color-mix(in oklab, var(--color-base-content) 20%, transparent);
  }
}

.note-content {
  font-size: 0.9375rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.note-images {
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;

  &.count-1 { grid-template-columns: 1fr; }
  &.count-2 { grid-template-columns: 1fr 1fr; }
  &.count-3,
  &.count-4 { grid-template-columns: repeat(3, 1fr); }
}

.note-img-wrap {
  border-radius: 0.5rem;
  overflow: hidden;
  aspect-ratio: 1;
}

.note-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.03);
  }
}

.note-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
}

.note-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  opacity: 0.35;
}

.note-time {
  font-size: 0.75rem;
  opacity: 0.3;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 3rem;
}

.page-btn {
  min-width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-base-content);
  font-size: 0.8125rem;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    background: var(--color-base-200);
  }

  &.active {
    opacity: 1;
    background: var(--color-base-content);
    color: var(--color-base-100);
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.15;
    cursor: default;
  }
}

.ellipsis {
  font-size: 0.8125rem;
  opacity: 0.3;
  padding: 0 0.25rem;
}

@media (max-width: 640px) {
  .page { padding: 0 1.25rem 3rem; }
}
</style>
