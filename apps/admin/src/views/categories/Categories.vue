<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { toast } from "vue-sonner";
import { Pencil, Trash2, Plus, Check, X } from "@lucide/vue";
import { getCategories, createCategory, updateCategory, deleteCategory } from "~/api/categories";
import type { Category } from "~/api/categories/types";

const list = ref<Category[]>([]);
const loading = ref(true);
const adding = ref(false);
const editing = ref<number | null>(null);
const form = ref({ name: "", slug: "" });

async function load() {
  loading.value = true;
  try { list.value = await getCategories(); }
  catch { toast.error("加载失败"); }
  finally { loading.value = false; }
}

function startAdd() {
  editing.value = null;
  form.value = { name: "", slug: "" };
  adding.value = true;
  nextTick(() => (document.querySelector(".inline-form input") as HTMLInputElement)?.focus());
}

function startEdit(item: Category) {
  adding.value = false;
  form.value = { name: item.name, slug: item.slug };
  editing.value = item.id;
  nextTick(() => (document.querySelector(".inline-form input") as HTMLInputElement)?.focus());
}

function cancel() { adding.value = false; editing.value = null; }

async function save() {
  if (!form.value.name || !form.value.slug) { toast.error("名称和标识不能为空"); return; }
  try {
    if (editing.value) { await updateCategory(editing.value, form.value); toast.success("已更新"); }
    else { await createCategory(form.value); toast.success("已创建"); }
    cancel();
    await load();
  } catch (e: any) { toast.error(e?.response?.data?.message || "操作失败"); }
}

async function remove(item: Category) {
  if (!confirm(`删除「${item.name}」？`)) return;
  try { await deleteCategory(item.id); toast.success("已删除"); await load(); }
  catch (e: any) { toast.error(e?.response?.data?.message || "删除失败"); }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <div class="head">
      <div><h1>分类</h1><span class="sub">{{ list.length }} 个</span></div>
      <button class="add-btn" @click="startAdd" v-if="!adding"><Plus :size="17" /> 新建</button>
    </div>

    <!-- 新建行 -->
    <div v-if="adding" class="inline-form">
      <div class="fields">
        <input v-model="form.name" class="field" placeholder="名称，如：技术" @keyup.enter="save" />
        <input v-model="form.slug" class="field slug" placeholder="标识，如：tech" @keyup.enter="save" />
      </div>
      <div class="form-actions">
        <button class="act ok" @click="save"><Check :size="16" /></button>
        <button class="act cancel" @click="cancel"><X :size="16" /></button>
      </div>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="dim">加载中...</div>
    <div v-else-if="list.length === 0 && !adding" class="empty">暂无分类</div>
    <div v-else class="items">
      <div
        v-for="item in list"
        :key="item.id"
        :class="['row', { editing: editing === item.id }]"
        @dblclick="startEdit(item)"
      >
        <!-- 展示态 -->
        <template v-if="editing !== item.id">
          <div class="info">
            <span class="name">{{ item.name }}</span>
            <span class="slug">{{ item.slug }}</span>
          </div>
          <div class="actions">
            <button class="act" @click="startEdit(item)"><Pencil :size="14" /></button>
            <button class="act del" @click="remove(item)"><Trash2 :size="14" /></button>
          </div>
        </template>
        <!-- 编辑态 -->
        <div v-else class="fields">
          <input v-model="form.name" class="field" @keyup.enter="save" />
          <input v-model="form.slug" class="field slug" @keyup.enter="save" />
        </div>
        <div v-if="editing === item.id" class="form-actions">
          <button class="act ok" @click="save"><Check :size="16" /></button>
          <button class="act cancel" @click="cancel"><X :size="16" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.page { max-width: 520px; padding: 28px 32px; }
.head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
h1 { font-size: 20px; font-weight: 700; margin: 0; }
.sub { font-size: 13px; opacity: 0.4; display: block; margin-top: 2px; }

.add-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 8px; border: none;
  background: var(--color-primary); color: var(--color-primary-content);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .12s;
  &:hover { opacity: .88; }
}

.inline-form { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
.fields { display: flex; gap: 8px; flex: 1; }
.field {
  padding: 7px 10px; border-radius: 8px; border: 1px solid var(--color-border);
  background: var(--color-base-100); font-size: 13px; color: var(--color-base-content);
  outline: none; flex: 1;
  &:focus { border-color: var(--color-primary); }
  &.slug { flex: .7; }
}
.form-actions { display: flex; gap: 4px; }

.act {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; border-radius: 7px;
  background: transparent; color: var(--color-base-content); opacity: .35;
  cursor: pointer; transition: all .12s;
  &:hover { opacity: .8; background: var(--color-base-200); }
  &.del:hover { color: var(--color-error); }
  &.ok { color: var(--color-success); opacity: 1; }
  &.cancel { opacity: .5; }
}

.items { display: flex; flex-direction: column; }
.row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; border-radius: 10px; transition: background .1s;
  &:hover { background: var(--color-base-200); }
  &.editing { background: var(--color-base-200); }
}

.info { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.name { font-size: 14px; font-weight: 500; }
.slug { font-size: 12px; opacity: .35; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions { display: flex; gap: 2px; opacity: 0; transition: opacity .1s; .row:hover & { opacity: 1; } }

.dim, .empty { text-align: center; padding: 60px 0; font-size: 14px; opacity: .35; }
</style>
