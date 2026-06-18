<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2, Search, Eye } from '@lucide/vue'
import Pagination from '~/components/table/Pagination.vue'
import ToggleGroup from '~/components/base/ToggleGroup.vue'
import Select from '~/components/base/Select.vue'
import Button from '~/components/base/Button.vue'
import { getPosts, deletePost } from '~/api/posts'
import { getCategories } from '~/api/categories'
import type { Post } from '~/api/posts/types'
import type { Category } from '~/api/categories/types'
import { formatDate } from '~/utils/date'

const router = useRouter()

const posts = ref<Post[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const loading = ref(true)

const query = ref({
  keyword: '',
  status: '',
  categoryId: 0,
  page: 1,
  pageSize: 10
})

const totalPages = ref(1)
const paginationMode = ref<'button' | 'scroll'>('scroll')

const categoryOptions = ref([{ label: '全部分类', value: 0 }])

async function load(append = false) {
  loading.value = true
  try {
    const params: any = { page: query.value.page, pageSize: query.value.pageSize }
    if (query.value.keyword) params.keyword = query.value.keyword
    if (query.value.status) params.status = query.value.status
    if (query.value.categoryId) params.categoryId = query.value.categoryId

    const result = await getPosts(params)
    posts.value = append ? [...posts.value, ...result.list] : result.list
    total.value = result.total
    totalPages.value = Math.ceil(result.total / result.pageSize)
  } catch {
    toast.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await getCategories()
    categoryOptions.value.push(...categories.value.map(c => ({ label: c.name, value: c.id })))
  } catch {
    /* ignore */
  }
}

function search() {
  query.value.page = 1
  load()
}

function goPage(p: number) {
  query.value.page = p
  load(paginationMode.value === 'scroll')
}

function create() {
  router.push('/posts/new')
}

function edit(post: Post) {
  router.push(`/posts/${post.id}`)
}

async function remove(post: Post) {
  if (!confirm(`确定删除文章「${post.title}」？`)) return
  try {
    await deletePost(post.id)
    toast.success('已删除')
    await load()
  } catch {
    toast.error('删除失败')
  }
}

watch(
  () => query.value.status,
  () => search()
)
watch(
  () => query.value.categoryId,
  () => search()
)
watch(paginationMode, () => {
  query.value.page = 1
  load()
})

onMounted(() => {
  loadCategories()
  load()
})
</script>

<template>
  <div class="posts-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">文章</h1>
        <span class="page-subtitle">共 {{ total }} 篇</span>
      </div>
      <div class="header-actions">
        <label class="filter-input">
          <Search style="width: .9375rem; height: .9375rem;" />
          <input v-model="query.keyword" placeholder="搜索标题..." @keyup.enter="search" />
        </label>
        <Select
          v-model="query.status"
          :options="[
            { label: '全部状态', value: '' },
            { label: '草稿', value: 'draft' },
            { label: '已发布', value: 'published' },
            { label: '已归档', value: 'archived' }
          ]"
          class="filter-select"
        />
        <Select v-model="query.categoryId" :options="categoryOptions" class="filter-select" />
        <ToggleGroup
          v-model="paginationMode"
          :options="[
            { label: '滚动', value: 'scroll' },
            { label: '分页', value: 'button' }
          ]"
          size="sm"
        />
        <Button variant="primary" @click="create"> <Plus style="width: 1rem; height: 1rem;" /> 写文章 </Button>
      </div>
    </div>
    <!-- Empty -->
    <div v-if="!loading && posts.length === 0" class="empty">
      <p class="empty-title">暂无文章</p>
      <p class="empty-desc">点击「写文章」开始创作</p>
    </div>

    <!-- List -->
    <div v-else class="post-list">
      <article v-for="post in posts" :key="post.id" class="post-row" @click="edit(post)">
        <div class="post-main">
          <h2 class="post-title">{{ post.title || '新文章' }}</h2>
          <p v-if="post.summary" class="post-summary">{{ post.summary }}</p>
          <div class="post-meta">
            <span
              :class="[
                'status-badge',
                post.status === 'published' ? 'is-pub' : post.status === 'archived' ? 'is-archived' : 'is-draft'
              ]"
            >
              {{ post.status === 'published' ? '已发布' : post.status === 'archived' ? '已归档' : '草稿' }}
            </span>
            <span v-if="post.category" class="meta-tag">{{ post.category.name }}</span>
            <span class="meta-text"><Eye style="width: .8125rem; height: .8125rem;" /> {{ post.viewCount }}</span>
            <span class="meta-text">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-actions" @click.stop>
          <Button variant="ghost" size="sm" icon title="编辑" @click="edit(post)"><Pencil style="width: 1rem; height: 1rem;" /></Button>
          <Button variant="danger" size="sm" icon title="删除" @click="remove(post)"><Trash2 style="width: 1rem; height: 1rem;" /></Button>
        </div>
      </article>
    </div>

    <Pagination
      :current-page="query.page"
      :total-pages="totalPages"
      :loading="loading"
      @change="goPage"
      :mode="paginationMode"
    />
  </div>
</template>

<style scoped lang="less">
.posts-page {
  width: 100%;
  max-width: 56.25rem;
  margin: 0 auto;
}

/* --- Header --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  // gap: 1rem;
  margin-bottom: 1.75rem;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.0313rem;
  margin: 0;
  line-height: 1.3;
}

.page-subtitle {
  font-size: .8125rem;
  color: var(--color-base-content);
  opacity: 0.45;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
}

.filter-input {
  display: flex;
  align-items: center;
  gap: .375rem;
  padding: .375rem .75rem;
  border-radius: .625rem;
  background: var(--color-base-200);
  border: .0625rem solid transparent;
  transition: border-color 0.15s;

  input {
    border: none;
    outline: none;
    background: transparent;
    font-size: .8125rem;
    width: 8.75rem;
    color: var(--color-base-content);
  }

  svg {
    opacity: 0.35;
    flex-shrink: 0;
  }

  &:focus-within {
    border-color: var(--color-base-300);
  }
}

.filter-select {
  background: var(--color-base-200);
  border-radius: .625rem;

  :deep(.base-select) {
    padding: .375rem .625rem;
    border: .0625rem solid transparent;
    background: transparent;
    border-radius: .625rem;
    font-size: .8125rem;

    &:focus {
      border-color: var(--color-base-300);
    }
  }
}

/* --- Empty --- */
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  color: var(--color-base-content);
  opacity: 0.4;
  font-size: .875rem;
}
.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 .375rem;
}
.empty-desc {
  margin: 0;
}

/* --- Post Row --- */
.post-list {
  display: flex;
  flex-direction: column;
}

.post-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
  border-radius: .875rem;
  cursor: pointer;
  transition: background 0.12s;

  & + & {
    border-top: .0625rem solid var(--color-border);
    border-radius: 0;
    &:last-child {
      border-radius: 0 0 .875rem .875rem;
    }
  }

  &:first-child {
    border-radius: .875rem .875rem 0 0;
  }
  &:last-child {
    border-radius: 0 0 .875rem .875rem;
  }

  &:hover {
    background: var(--color-base-200);
  }
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: .9375rem;
  font-weight: 600;
  margin: 0 0 .25rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-summary {
  font-size: .8125rem;
  color: var(--color-base-content);
  opacity: 0.5;
  margin: 0 0 .625rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: .625rem;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: .75rem;
  padding: .125rem .5625rem;
  border-radius: .375rem;
  background: var(--color-base-300);
  color: var(--color-base-content);
  opacity: 0.7;
}

.status-badge {
  font-size: .75rem;
  padding: .125rem .5625rem;
  border-radius: .375rem;
  font-weight: 500;

  &.is-pub {
    background: var(--color-success);
    color: var(--color-success-content);
    opacity: 0.85;
  }
  &.is-draft {
    background: var(--color-warning);
    color: var(--color-warning-content);
    opacity: 0.85;
  }
  &.is-archived {
    background: var(--color-base-300);
    color: var(--color-base-content);
    opacity: 0.5;
  }
}

.meta-text {
  font-size: .75rem;
  color: var(--color-base-content);
  opacity: 0.4;
  display: inline-flex;
  align-items: center;
  gap: .1875rem;
}

.post-actions {
  display: flex;
  gap: .125rem;
  flex-shrink: 0;
}
</style>
