<script setup lang="ts">
import { formatDate } from '~/utils/date'

const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.query.page) || 1)
const pageSize = 20

const noteApi = useNoteApi()
const { data: res, status } = await useAsyncData('notes-list', () => noteApi.getList({ page: page.value, pageSize }), { watch: [page] })

const notes = computed(() => res.value?.data?.list ?? [])
const total = computed(() => res.value?.data?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

useHead({ title: '说说 - 3qrain' })
</script>

<template>
  <div class="page">
    <header class="page-header">
      <p class="label">Moments</p>
      <h1>说说</h1>
    </header>

    <div v-if="status === 'pending'" class="loading">加载中...</div>

    <template v-else-if="notes.length">
      <div class="list">
        <div v-for="note in notes" :key="note.id" class="item">
          <p class="item-content">{{ note.content }}</p>

          <div v-if="note.media.length" class="item-images">
            <img
              v-for="m in note.media"
              :key="m.id"
              :src="m.thumbnailUrl || m.url || ''"
              loading="lazy"
              class="item-img"
            />
          </div>

          <div class="item-meta">
            <time>{{ formatDate(note.createdAt) }}</time>
            <template v-if="note.tags.length">
              <span class="dot">·</span>
              <span v-for="tag in note.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
            </template>
          </div>
        </div>
      </div>

      <BasePagination
        class="pagination"
        :current-page="page"
        :total-pages="totalPages"
        @change="p => router.push({ query: { ...route.query, page: p > 1 ? p : undefined } })"
      />
    </template>

    <p v-else class="empty">还没有说说。</p>
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

  .label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.25rem;
    opacity: 0.35;
    margin-bottom: 0.5rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 400;
    letter-spacing: -0.02em;
  }
}

.loading,
.empty {
  padding: 4rem 0;
  text-align: center;
  font-size: 0.9375rem;
  opacity: 0.35;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.item {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);

  &:last-child { border-bottom: none; }
}

.item-content {
  font-size: 0.9375rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.item-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.item-img {
  width: 6rem;
  height: 6rem;
  border-radius: 0.5rem;
  object-fit: cover;
}

.item-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  opacity: 0.35;

  .dot {
    opacity: 0.5;
    margin: 0 0.0625rem;
  }

  .tag {
    &::before { content: '#'; }
  }
}

.pagination {
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .page { padding: 0 1.25rem 3rem; }
  .item-img { width: 5rem; height: 5rem; }
}
</style>
