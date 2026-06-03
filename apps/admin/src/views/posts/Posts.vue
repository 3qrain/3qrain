<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Plus, Pencil, Trash2, Search, Eye } from "@lucide/vue";
import Pagination from "~/components/table/Pagination.vue";
import { getPosts, deletePost } from "~/api/posts";
import { getCategories } from "~/api/categories";
import type { Post } from "~/api/posts/types";
import type { Category } from "~/api/categories/types";

const router = useRouter();

const posts = ref<Post[]>([]);
const categories = ref<Category[]>([]);
const total = ref(0);
const loading = ref(true);

const query = ref({
  keyword: "",
  status: "",
  categoryId: "",
  page: 1,
  pageSize: 10,
});

const totalPages = ref(1);
const paginationMode = ref<"button" | "scroll">("scroll");

async function load(append = false) {
  loading.value = true;
  try {
    const params: any = { page: query.value.page, pageSize: query.value.pageSize };
    if (query.value.keyword) params.keyword = query.value.keyword;
    if (query.value.status) params.status = query.value.status;
    if (query.value.categoryId) params.categoryId = query.value.categoryId;

    const result = await getPosts(params);
    posts.value = append ? [...posts.value, ...result.list] : result.list;
    total.value = result.total;
    totalPages.value = Math.ceil(result.total / result.pageSize);
  } catch {
    toast.error("加载文章失败");
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  try {
    categories.value = await getCategories();
  } catch { /* ignore */ }
}

function search() {
  query.value.page = 1;
  load();
}

function goPage(p: number) {
  query.value.page = p;
  load(paginationMode.value === "scroll");
}

function create() {
  router.push("/posts/new");
}

function edit(post: Post) {
  router.push(`/posts/${post.id}`);
}

async function remove(post: Post) {
  if (!confirm(`确定删除文章「${post.title}」？`)) return;
  try {
    await deletePost(post.id);
    toast.success("已删除");
    await load();
  } catch {
    toast.error("删除失败");
  }
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

watch(() => query.value.status, () => search());
watch(() => query.value.categoryId, () => search());

onMounted(() => {
  loadCategories();
  load();
});
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
          <Search :size="15" />
          <input v-model="query.keyword" placeholder="搜索标题..." @keyup.enter="search" />
        </label>
        <select v-model="query.status" class="filter-select">
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
        <select v-model="query.categoryId" class="filter-select">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <div class="mode-toggle">
          <button :class="['mode-opt', paginationMode === 'scroll' && 'on']" @click="paginationMode = 'scroll'; query.page = 1; load()">滚动</button>
          <button :class="['mode-opt', paginationMode === 'button' && 'on']" @click="paginationMode = 'button'; query.page = 1; load()">分页</button>
        </div>
        <button class="btn-new" @click="create">
          <Plus :size="17" /> 写文章
        </button>
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
          <h2 class="post-title">{{ post.title || "新文章" }}</h2>
          <p v-if="post.summary" class="post-summary">{{ post.summary }}</p>
          <div class="post-meta">
            <span v-if="post.category" class="meta-tag">{{ post.category.name }}</span>
            <span :class="['status-badge', post.status === 'published' ? 'is-pub' : post.status === 'archived' ? 'is-archived' : 'is-draft']">
              {{ post.status === "published" ? "已发布" : post.status === "archived" ? "已归档" : "草稿" }}
            </span>
            <span class="meta-text"><Eye :size="13" /> {{ post.viewCount }}</span>
            <span class="meta-text">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-actions" @click.stop>
          <button class="act-btn" title="编辑" @click="edit(post)"><Pencil :size="15" /></button>
          <button class="act-btn act-del" title="删除" @click="remove(post)"><Trash2 :size="15" /></button>
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
  max-width: 900px;
  margin: 0 auto;
}

/* --- Header --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 13px;
  color: var(--color-base-content);
  opacity: 0.45;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-input {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  background: var(--color-base-200);
  border: 1px solid transparent;
  transition: border-color 0.15s;

  input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
    width: 140px;
    color: var(--color-base-content);
  }

  svg { opacity: 0.35; flex-shrink: 0; }

  &:focus-within {
    border-color: var(--color-base-300);
  }
}

.filter-select {
  padding: 6px 10px;
  border-radius: 10px;
  background: var(--color-base-200);
  border: 1px solid transparent;
  font-size: 13px;
  color: var(--color-base-content);
  outline: none;
  cursor: pointer;

  &:focus { border-color: var(--color-base-300); }
}

.mode-toggle {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-base-300);
}

.mode-opt {
  padding: 4px 10px;
  border: none;
  background: var(--color-base-100);
  font-size: 12px;
  cursor: pointer;
  color: var(--color-base-content);
  opacity: 0.45;
  transition: all 0.12s;

  &.on {
    opacity: 1;
    background: var(--color-base-300);
  }
}

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 10px;
  background: var(--color-primary);
  color: var(--color-primary-content);
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.88; }
}

/* --- Empty --- */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--color-base-content);
  opacity: 0.4;
  font-size: 14px;
}
.empty-title { font-size: 18px; font-weight: 600; margin: 0 0 6px; }
.empty-desc { margin: 0; }

/* --- Post Row --- */
.post-list {
  display: flex;
  flex-direction: column;
}

.post-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.12s;

  & + & {
    border-top: 1px solid var(--color-base-300);
    border-radius: 0;
    &:last-child { border-radius: 0 0 14px 14px; }
  }

  &:first-child { border-radius: 14px 14px 0 0; }
  &:last-child { border-radius: 0 0 14px 14px; }

  &:hover {
    background: var(--color-base-200);
  }
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-summary {
  font-size: 13px;
  color: var(--color-base-content);
  opacity: 0.5;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 12px;
  padding: 2px 9px;
  border-radius: 6px;
  background: var(--color-base-300);
  color: var(--color-base-content);
  opacity: 0.7;
}

.status-badge {
  font-size: 12px;
  padding: 2px 9px;
  border-radius: 6px;
  font-weight: 500;

  &.is-pub {
    background: oklch(76% .177 163.223 / 0.18);
    color: oklch(37% .077 168.94);
  }
  &.is-draft {
    background: oklch(82% .189 84.429 / 0.2);
    color: oklch(40% .112 45.904);
  }
  &.is-archived {
    background: var(--color-base-300);
    color: var(--color-base-content);
    opacity: 0.5;
  }
}

.meta-text {
  font-size: 12px;
  color: var(--color-base-content);
  opacity: 0.4;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* --- Actions --- */
.post-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.act-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.35;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    opacity: 0.8;
    background: var(--color-base-300);
  }
}

.act-del:hover {
  color: oklch(71% .194 13.428);
  background: oklch(71% .194 13.428 / 0.1);
}

</style>
