<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { ArrowLeft } from "@lucide/vue";
import { getPost, createPost, updatePost } from "~/api/posts";
import { getCategories } from "~/api/categories";
import { getTags } from "~/api/tags";
import type { Category } from "~/api/categories/types";
import type { Tag } from "~/api/tags/types";

const route = useRoute();
const router = useRouter();

const postId = route.params.id as string | undefined;
const isEdit = postId !== "new";

const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);
const saving = ref(false);

const form = ref({
  title: "",
  slug: "",
  summary: "",
  cover: "",
  content: "",
  status: "draft" as string,
  isPinned: false,
  categoryId: 0,
  tagIds: [] as number[],
});

async function loadData() {
  const [cats, tagList] = await Promise.all([getCategories(), getTags()]);
  categories.value = cats;
  tags.value = tagList;

  if (isEdit) {
    try {
      const post = await getPost(Number(postId));
      form.value = {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        cover: post.cover,
        content: post.content,
        status: post.status,
        isPinned: post.isPinned === true || (post.isPinned as unknown as number) === 1,
        categoryId: post.categoryId,
        tagIds: post.tags?.map((t: Tag) => t.id) || [],
      };
    } catch {
      toast.error("文章不存在");
      router.push("/posts");
    }
  }
}

function toggleTag(id: number) {
  const idx = form.value.tagIds.indexOf(id);
  if (idx > -1) {
    form.value.tagIds.splice(idx, 1);
  } else {
    form.value.tagIds.push(id);
  }
}

async function save() {
  if (!form.value.title || !form.value.slug || !form.value.categoryId) {
    toast.error("标题、标识和分类为必填");
    return;
  }
  saving.value = true;
  try {
    if (isEdit) {
      await updatePost(Number(postId), form.value);
      toast.success("更新成功");
    } else {
      await createPost(form.value);
      toast.success("创建成功");
      router.push("/posts");
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-6 max-w-4xl">
    <button class="btn btn-ghost btn-sm mb-4" @click="router.push('/posts')">
      <ArrowLeft :size="16" /> 返回
    </button>

    <h1 class="text-xl font-bold mb-6">{{ isEdit ? "编辑" : "新建" }}文章</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Main -->
      <div class="md:col-span-2 space-y-4">
        <label class="form-control">
          <span class="label-text mb-1">标题</span>
          <input v-model="form.title" class="input input-bordered" placeholder="文章标题" />
        </label>

        <label class="form-control">
          <span class="label-text mb-1">标识</span>
          <input v-model="form.slug" class="input input-bordered" placeholder="hello-world" />
        </label>

        <label class="form-control">
          <span class="label-text mb-1">摘要</span>
          <textarea v-model="form.summary" class="textarea textarea-bordered" rows="2" placeholder="文章摘要" />
        </label>

        <label class="form-control">
          <span class="label-text mb-1">封面图片 URL</span>
          <input v-model="form.cover" class="input input-bordered" placeholder="https://..." />
        </label>

        <label class="form-control">
          <span class="label-text mb-1">内容 (Markdown)</span>
          <textarea v-model="form.content" class="textarea textarea-bordered" rows="16" placeholder="开始写作..." />
        </label>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <div class="card bg-base-200">
          <div class="card-body p-4 space-y-3">
            <label class="form-control">
              <span class="label-text mb-1">状态</span>
              <select v-model="form.status" class="select select-bordered select-sm">
                <option value="draft">草稿</option>
                <option value="published">发布</option>
              </select>
            </label>

            <label class="form-control">
              <span class="label-text mb-1">分类</span>
              <select v-model="form.categoryId" class="select select-bordered select-sm">
                <option :value="0" disabled>选择分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.isPinned" type="checkbox" class="checkbox checkbox-sm" />
              <span class="label-text">置顶</span>
            </label>

            <button class="btn btn-primary btn-sm w-full" :disabled="saving" @click="save">
              {{ saving ? "保存中..." : "保存" }}
            </button>
          </div>
        </div>

        <!-- Tags -->
        <div class="card bg-base-200">
          <div class="card-body p-4">
            <span class="label-text mb-2">标签</span>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="tag in tags"
                :key="tag.id"
                :class="['btn btn-xs', form.tagIds.includes(tag.id) ? 'btn-primary' : 'btn-ghost']"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
              </button>
              <span v-if="tags.length === 0" class="text-sm text-base-content/40">暂无标签</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
