<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2, Search, Eye } from '@lucide/vue'
import Pagination from '~/components/table/Pagination.vue'
import ToggleGroup from '~/components/base/ToggleGroup.vue'
import Select from '~/components/base/Select.vue'
import Button from '~/components/base/Button.vue'
import Badge from '~/components/base/Badge.vue'
import Input from '~/components/base/Input.vue'
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
  pageSize: 10,
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
  } catch { /* ignore */ }
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

watch(() => query.value.status, () => search())
watch(() => query.value.categoryId, () => search())
watch(paginationMode, () => { query.value.page = 1; load() })

onMounted(() => {
  loadCategories()
  load()
})
</script>

<template>
  <div class="page">
    <div class="head">
      <div>
        <h1>文章</h1>
        <span class="sub">共 {{ total }} 篇</span>
      </div>
      <Button size="sm" @click="create">
        <Plus style="width: 0.875rem; height: 0.875rem;" /> 写文章
      </Button>
    </div>

    <div class="toolbar">
      <div class="search">
        <Search style="width: 0.875rem; height: 0.875rem;" />
        <input v-model="query.keyword" placeholder="搜索标题..." @keyup.enter="search" />
      </div>
      <Select
        v-model="query.status"
        :options="[
          { label: '全部状态', value: '' },
          { label: '草稿', value: 'draft' },
          { label: '已发布', value: 'published' },
          { label: '已归档', value: 'archived' },
        ]"
      />
      <Select v-model="query.categoryId" :options="categoryOptions" />
      <ToggleGroup
        v-model="paginationMode"
        :options="[
          { label: '滚动', value: 'scroll' },
          { label: '分页', value: 'button' },
        ]"
        size="sm"
      />
    </div>

    <div v-if="!loading && posts.length === 0" class="empty">暂无文章，点击「写文章」开始创作</div>

    <div v-else class="list">
      <article v-for="post in posts" :key="post.id" class="row" @click="edit(post)">
        <div class="row-main">
          <h2 class="row-title">{{ post.title || '新文章' }}</h2>
          <p v-if="post.summary" class="row-summary">{{ post.summary }}</p>
          <div class="row-meta">
            <Badge :variant="post.status === 'published' ? 'success' : post.status === 'archived' ? 'neutral' : 'warning'">
              {{ post.status === 'published' ? '已发布' : post.status === 'archived' ? '已归档' : '草稿' }}
            </Badge>
            <Badge v-if="post.category" variant="info">{{ post.category.name }}</Badge>
            <span class="meta-text"><Eye style="width: 0.75rem; height: 0.75rem;" /> {{ post.viewCount }}</span>
            <span class="meta-text">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="row-actions" @click.stop>
          <Button variant="ghost" size="sm" icon title="编辑" @click="edit(post)">
            <Pencil style="width: 0.875rem; height: 0.875rem;" />
          </Button>
          <Button variant="danger" size="sm" icon title="删除" @click="remove(post)">
            <Trash2 style="width: 0.875rem; height: 0.875rem;" />
          </Button>
        </div>
      </article>
    </div>

    <Pagination
      :current-page="query.page"
      :total-pages="totalPages"
      :loading="loading"
      :mode="paginationMode"
      @change="goPage"
    />
  </div>
</template>

<style scoped lang="less">
.page {
  max-width: 50rem;
  padding: 1.75rem 2rem;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;

  h1 { font-size: 1.25rem; font-weight: 700; margin: 0; }
}

.sub {
  font-size: 0.75rem;
  opacity: 0.35;
  display: block;
  margin-top: 0.125rem;
}

/* ---- Toolbar ---- */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.search {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  border: 0.0625rem solid var(--color-border);
  background: var(--color-base-100);
  transition: border-color 0.15s;
  flex: 1;
  min-width: 8rem;
  max-width: 14rem;

  svg { opacity: 0.3; flex-shrink: 0; }

  input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.8125rem;
    color: var(--color-base-content);
    width: 100%;
    font-family: inherit;
  }

  &:focus-within { border-color: var(--color-primary); }
}

/* ---- List ---- */
.list {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.1s;

  &:hover { background: var(--color-base-200); }
}

.row-main {
  flex: 1;
  min-width: 0;
}

.row-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.1875rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-summary {
  font-size: 0.75rem;
  opacity: 0.45;
  margin: 0 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-text {
  font-size: 0.6875rem;
  opacity: 0.35;
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
}

.row-actions {
  display: flex;
  gap: 0.125rem;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s;
  .row:hover & { opacity: 1; }
}

.empty {
  text-align: center;
  padding: 3rem 0;
  font-size: 0.875rem;
  opacity: 0.3;
}

@media (max-width: 48rem) {
  .page { padding: 1.25rem 1rem; }

  .toolbar { gap: 0.375rem; }

  .search { max-width: none; }

  .row-summary { display: none; }

  .row-actions { opacity: 1; }
}
</style>
