<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Plus, Pencil, Trash2, Search } from "@lucide/vue";
import { getPosts, deletePost } from "~/api/posts";
import { getCategories } from "~/api/categories";
import type { Post } from "~/api/posts/types";
import type { Category } from "~/api/categories/types";

const router = useRouter();

const posts = ref<Post[]>([]);
const categories = ref<Category[]>([]);
const total = ref(0);
const loading = ref(false);

const query = ref({
  keyword: "",
  status: "",
  categoryId: "",
  page: 1,
  pageSize: 10,
});

const totalPages = ref(1);

async function load() {
  loading.value = true;
  try {
    const params: any = { page: query.value.page, pageSize: query.value.pageSize };
    if (query.value.keyword) params.keyword = query.value.keyword;
    if (query.value.status) params.status = query.value.status;
    if (query.value.categoryId) params.categoryId = query.value.categoryId;

    const result = await getPosts(params);
    posts.value = result.list;
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
  load();
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

watch(() => query.value.status, () => search());
watch(() => query.value.categoryId, () => search());

onMounted(() => {
  loadCategories();
  load();
});
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">文章管理</h1>
      <button class="btn btn-primary btn-sm" @click="create"><Plus :size="16" class="mr-1" />写文章</button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-4">
      <label class="input input-bordered input-sm flex items-center gap-1 w-48">
        <Search :size="14" class="text-base-content/40" />
        <input v-model="query.keyword" class="grow" placeholder="搜索标题..." @keyup.enter="search" />
      </label>
      <select v-model="query.status" class="select select-bordered select-sm">
        <option value="">全部状态</option>
        <option value="draft">草稿</option>
        <option value="published">已发布</option>
      </select>
      <select v-model="query.categoryId" class="select select-bordered select-sm">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>浏览</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center">加载中...</td></tr>
          <tr v-else-if="posts.length === 0"><td colspan="5" class="text-center">暂无数据</td></tr>
          <tr v-for="post in posts" :key="post.id">
            <td class="max-w-60 truncate">{{ post.title }}</td>
            <td>
              <span v-if="post.category" class="badge badge-sm">{{ post.category.name }}</span>
            </td>
            <td>
              <span :class="['badge badge-sm', post.status === 'published' ? 'badge-success' : 'badge-ghost']">
                {{ post.status === "published" ? "已发布" : "草稿" }}
              </span>
            </td>
            <td>{{ post.viewCount }}</td>
            <td class="flex gap-1">
              <button class="btn btn-ghost btn-xs" @click="edit(post)"><Pencil :size="14" /></button>
              <button class="btn btn-ghost btn-xs text-error" @click="remove(post)"><Trash2 :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-4 gap-1">
      <button class="btn btn-sm" :disabled="query.page <= 1" @click="goPage(query.page - 1)">上一页</button>
      <span class="flex items-center px-3 text-sm">{{ query.page }} / {{ totalPages }}（共 {{ total }} 篇）</span>
      <button class="btn btn-sm" :disabled="query.page >= totalPages" @click="goPage(query.page + 1)">下一页</button>
    </div>
  </div>
</template>
