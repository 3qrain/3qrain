<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";
import { Pencil, Trash2 } from "@lucide/vue";
import { getTags, createTag, updateTag, deleteTag } from "~/api/tags";
import type { Tag } from "~/api/tags/types";

const tags = ref<Tag[]>([]);
const loading = ref(false);

const showModal = ref(false);
const editing = ref<Tag | null>(null);
const form = ref({ name: "", slug: "" });

async function load() {
  loading.value = true;
  try {
    tags.value = await getTags();
  } catch {
    toast.error("加载标签失败");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.value = { name: "", slug: "" };
  showModal.value = true;
}

function openEdit(tag: Tag) {
  editing.value = tag;
  form.value = { name: tag.name, slug: tag.slug };
  showModal.value = true;
}

async function save() {
  if (!form.value.name || !form.value.slug) {
    toast.error("名称和标识不能为空");
    return;
  }
  try {
    if (editing.value) {
      await updateTag(editing.value.id, form.value);
      toast.success("更新成功");
    } else {
      await createTag(form.value);
      toast.success("创建成功");
    }
    showModal.value = false;
    await load();
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "操作失败");
  }
}

async function remove(tag: Tag) {
  if (!confirm(`确定删除标签「${tag.name}」？`)) return;
  try {
    await deleteTag(tag.id);
    toast.success("已删除");
    await load();
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "删除失败");
  }
}

onMounted(load);
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">标签管理</h1>
      <button class="btn btn-primary btn-sm" @click="openCreate">新建标签</button>
    </div>

    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>标识</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="4" class="text-center">加载中...</td></tr>
          <tr v-else-if="tags.length === 0"><td colspan="4" class="text-center">暂无数据</td></tr>
          <tr v-for="tag in tags" :key="tag.id">
            <td>{{ tag.id }}</td>
            <td>{{ tag.name }}</td>
            <td class="text-sm text-base-content/60">{{ tag.slug }}</td>
            <td class="flex gap-1">
              <button class="btn btn-ghost btn-xs" @click="openEdit(tag)"><Pencil :size="14" /></button>
              <button class="btn btn-ghost btn-xs text-error" @click="remove(tag)"><Trash2 :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog :class="['modal', { 'modal-open': showModal }]">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">{{ editing ? "编辑" : "新建" }}标签</h3>
        <label class="form-control mb-3">
          <span class="label-text mb-1">名称</span>
          <input v-model="form.name" class="input input-bordered" placeholder="如：TypeScript" />
        </label>
        <label class="form-control mb-3">
          <span class="label-text mb-1">标识</span>
          <input v-model="form.slug" class="input input-bordered" placeholder="如：typescript" />
        </label>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showModal = false">取消</button>
          <button class="btn btn-primary" @click="save">保存</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showModal = false" />
    </dialog>
  </div>
</template>
