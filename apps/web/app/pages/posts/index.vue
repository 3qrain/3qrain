<script setup lang="ts">
import { formatDate } from '~/utils/date'

const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.query.page) || 1)

const postApi = usePostApi()
const { data: res, status } = await useAsyncData('posts-list', () => postApi.getList({ page: page.value, pageSize: 10 }), { watch: [page] })

const posts = computed(() => res.value?.data?.list ?? [])
const total = computed(() => res.value?.data?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 10))

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  router.push({ query: { ...route.query, page: p > 1 ? p : undefined } })
}

useHead({ title: '文章 - 3qrain' })
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>文章</h1>
      <p class="page-desc">共 {{ total }} 篇</p>
    </header>

    <div v-if="status === 'pending'" class="loading">加载中...</div>

    <div v-else-if="posts.length" class="posts-list">
      <NuxtLink
        v-for="post in posts"
        :key="post.id"
        :to="`/posts/${post.slug}`"
        class="post-card"
      >
        <div v-if="post.cover" class="post-cover">
          <img :src="post.cover" :alt="post.title" loading="lazy" />
        </div>
        <div class="post-body">
          <div class="post-meta">
            <span v-if="post.isPinned" class="pin">置顶</span>
            <span v-if="post.category" class="post-category">{{ post.category.name }}</span>
            <time>{{ formatDate(post.createdAt) }}</time>
            <span class="views">{{ post.viewCount }} 次阅读</span>
          </div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p v-if="post.summary" class="post-summary">{{ post.summary }}</p>
          <div v-if="post.tags.length" class="post-tags">
            <span v-for="tag in post.tags" :key="tag.id" class="tag"># {{ tag.name }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="empty">还没有文章。</div>

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
  max-width: 52rem;
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

.posts-list {
  display: flex;
  flex-direction: column;
}

.post-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem 0;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--color-border);
  transition: opacity 0.2s;

  &:first-child { border-top: 1px solid var(--color-border); }
  &:hover { opacity: 0.7; }
}

.post-cover {
  flex-shrink: 0;
  width: 12rem;
  height: 7.5rem;
  border-radius: 0.5rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.post-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.75rem;
  opacity: 0.4;
}

.pin {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-warning);
  opacity: 1;
}

.post-category {
  color: var(--color-primary);
  opacity: 1;
  font-weight: 500;
}

.views {
  margin-left: auto;
}

.post-title {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-summary {
  font-size: 0.8125rem;
  line-height: 1.6;
  opacity: 0.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.tag {
  font-size: 0.75rem;
  opacity: 0.35;
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

  .post-card {
    flex-direction: column;
    gap: 0.75rem;
  }

  .post-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }

  .views { display: none; }
}
</style>
