<script setup lang="ts">
import { formatDate } from '~/utils/date'

const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.query.page) || 1)
const pageSize = 2

const postApi = usePostApi()
const { data: res, status } = await useAsyncData('posts-list', () => postApi.getList({ page: page.value, pageSize }), {
  watch: [page]
})

const posts = computed(() => res.value?.data?.list ?? [])
const total = computed(() => res.value?.data?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

useHead({ title: '文章 - 3qrain' })
</script>

<template>
  <div class="page">
    <header class="page-header">
      <p class="label">Blog</p>
      <h1>文章</h1>
    </header>

    <div v-if="status === 'pending'" class="loading">加载中...</div>

    <template v-else-if="posts.length">
      <div class="list">
        <NuxtLink v-for="post in posts" :key="post.id" :to="`/posts/${post.slug}`" class="item">
          <div class="item-main">
            <div v-if="post.isPinned" class="pin">置顶</div>
            <h2 class="item-title">{{ post.title }}</h2>
            <p v-if="post.summary" class="item-summary">{{ post.summary }}</p>
            <div class="item-meta">
              <time>{{ formatDate(post.createdAt) }}</time>
              <span v-if="post.category" class="dot">·</span>
              <span v-if="post.category" class="category">{{ post.category.name }}</span>
              <template v-if="post.tags.length">
                <span class="dot">·</span>
                <span v-for="tag in post.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
              </template>
            </div>
          </div>
          <div class="item-stats">
            <span class="views">{{ post.viewCount }} 阅读</span>
          </div>
        </NuxtLink>
      </div>

      <BasePagination
        class="pagination"
        :current-page="page"
        :total-pages="totalPages"
        @change="p => router.push({ query: { ...route.query, page: p > 1 ? p : undefined } })"
      />
    </template>

    <p v-else class="empty">还没有文章。</p>
  </div>
</template>

<style scoped lang="less">
.page {
  max-width: 48rem;
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
}

.item {
  display: block;
  padding: 1rem 0.75rem;
  margin: 0 -0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    background: color-mix(in oklab, var(--color-base-content) 4%, transparent);
    transform: translateY(-1px);
  }
}

.item-main {
  min-width: 0;
}

.pin {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.item-title {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

.item-summary {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  opacity: 0.45;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.35;

  .dot {
    opacity: 0.5;
    margin: 0 0.0625rem;
  }

  .category {
    color: var(--color-primary);
    opacity: 1;
  }

  .tag {
    &::before {
      content: '#';
    }
  }
}

.item-stats {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--color-border);
  font-size: 0.6875rem;
  opacity: 0.3;
  text-align: right;
}

.pagination {
  margin-top: 1.25rem;
}

@media (max-width: 640px) {
  .page {
    padding: 0 1.25rem 3rem;
  }
  .item {
    padding: 0.875rem 0.5rem;
    margin: 0 -0.5rem;
  }
}
</style>
