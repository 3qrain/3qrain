<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";
import { Pencil, Trash2 } from "@lucide/vue";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from "~/api/categories";
import type { Category } from "~/api/categories/types";

const categories = ref<Category[]>([]);
const loading = ref(false);

const showModal = ref(false);
const editing = ref<Category | null>(null);
const form = ref({ name: "", slug: "" });

async function load() {
  loading.value = true;
  try {
    categories.value = await getCategories();
  } catch {
    toast.error("加载分类失败");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.value = { name: "", slug: "" };
  showModal.value = true;
}

function openEdit(cat: Category) {
  editing.value = cat;
  form.value = { name: cat.name, slug: cat.slug };
  showModal.value = true;
}

async function save() {
  if (!form.value.name || !form.value.slug) {
    toast.error("名称和标识不能为空");
    return;
  }
  try {
    if (editing.value) {
      await updateCategory(editing.value.id, form.value);
      toast.success("更新成功");
    } else {
      await createCategory(form.value);
      toast.success("创建成功");
    }
    showModal.value = false;
    await load();
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "操作失败");
  }
}

async function remove(cat: Category) {
  if (!confirm(`确定删除分类「${cat.name}」？`)) return;
  try {
    await deleteCategory(cat.id);
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
      <h1 class="text-xl font-bold">分类管理</h1>
      <button class="btn btn-primary btn-sm" @click="openCreate">新建分类</button>
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
          <tr v-else-if="categories.length === 0"><td colspan="4" class="text-center">暂无数据</td></tr>
          <tr v-for="cat in categories" :key="cat.id">
            <td>{{ cat.id }}</td>
            <td>{{ cat.name }}</td>
            <td class="text-sm text-base-content/60">{{ cat.slug }}</td>
            <td class="flex gap-1">
              <button class="btn btn-ghost btn-xs" @click="openEdit(cat)"><Pencil :size="14" /></button>
              <button class="btn btn-ghost btn-xs text-error" @click="remove(cat)"><Trash2 :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <dialog :class="['modal', { 'modal-open': showModal }]">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">{{ editing ? "编辑" : "新建" }}分类</h3>
        <label class="form-control mb-3">
          <span class="label-text mb-1">名称</span>
          <input v-model="form.name" class="input input-bordered" placeholder="如：技术" />
        </label>
        <label class="form-control mb-3">
          <span class="label-text mb-1">标识</span>
          <input v-model="form.slug" class="input input-bordered" placeholder="如：tech" />
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
