<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { toast } from "vue-sonner";
import { Pencil, Trash2, Plus, Check, X } from "@lucide/vue";
import { getTags, createTag, updateTag, deleteTag } from "~/api/tags";
import type { Tag } from "~/api/tags/types";

const list = ref<Tag[]>([]);
const loading = ref(true);
const adding = ref(false);
const editing = ref<number | null>(null);
const form = ref({ name: "", slug: "" });

async function load() {
  loading.value = true;
  try { list.value = await getTags(); }
  catch { toast.error("加载失败"); }
  finally { loading.value = false; }
}

function startAdd() {
  editing.value = null;
  form.value = { name: "", slug: "" };
  adding.value = true;
  nextTick(() => (document.querySelector(".inline-form input") as HTMLInputElement)?.focus());
}

function startEdit(item: Tag) {
  adding.value = false;
  form.value = { name: item.name, slug: item.slug };
  editing.value = item.id;
  nextTick(() => (document.querySelector(".inline-form input") as HTMLInputElement)?.focus());
}

function cancel() { adding.value = false; editing.value = null; }

async function save() {
  if (!form.value.name || !form.value.slug) { toast.error("名称和标识不能为空"); return; }
  try {
    if (editing.value) { await updateTag(editing.value, form.value); toast.success("已更新"); }
    else { await createTag(form.value); toast.success("已创建"); }
    cancel();
    await load();
  } catch (e: any) { toast.error(e?.response?.data?.message || "操作失败"); }
}

async function remove(item: Tag) {
  if (!confirm(`删除「${item.name}」？`)) return;
  try { await deleteTag(item.id); toast.success("已删除"); await load(); }
  catch (e: any) { toast.error(e?.response?.data?.message || "删除失败"); }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <div class="head">
      <div><h1>标签</h1><span class="sub">{{ list.length }} 个</span></div>
      <button class="add-btn" @click="startAdd" v-if="!adding"><Plus style="width: 1rem; height: 1rem;" /> 新建</button>
    </div>

    <div v-if="adding" class="inline-form">
      <div class="fields">
        <input v-model="form.name" class="field" placeholder="名称，如：TypeScript" @keyup.enter="save" />
        <input v-model="form.slug" class="field slug" placeholder="标识，如：typescript" @keyup.enter="save" />
      </div>
      <div class="form-actions">
        <button class="act ok" @click="save"><Check style="width: 1rem; height: 1rem;" /></button>
        <button class="act cancel" @click="cancel"><X style="width: 1rem; height: 1rem;" /></button>
      </div>
    </div>

    <div v-if="loading" class="dim">加载中...</div>
    <div v-else-if="list.length === 0 && !adding" class="empty">暂无标签</div>
    <div v-else class="items">
      <div
        v-for="item in list"
        :key="item.id"
        :class="['row', { editing: editing === item.id }]"
        @dblclick="startEdit(item)"
      >
        <template v-if="editing !== item.id">
          <div class="info">
            <span class="name">{{ item.name }}</span>
            <span class="slug">{{ item.slug }}</span>
          </div>
          <div class="actions">
            <button class="act" @click="startEdit(item)"><Pencil style="width: .875rem; height: .875rem;" /></button>
            <button class="act del" @click="remove(item)"><Trash2 style="width: .875rem; height: .875rem;" /></button>
          </div>
        </template>
        <div v-else class="fields">
          <input v-model="form.name" class="field" @keyup.enter="save" />
          <input v-model="form.slug" class="field slug" @keyup.enter="save" />
        </div>
        <div v-if="editing === item.id" class="form-actions">
          <button class="act ok" @click="save"><Check style="width: 1rem; height: 1rem;" /></button>
          <button class="act cancel" @click="cancel"><X style="width: 1rem; height: 1rem;" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.page { max-width: 32.5rem; padding: 1.75rem 2rem; }
.head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
h1 { font-size: 1.25rem; font-weight: 700; margin: 0; }
.sub { font-size: .8125rem; opacity: 0.4; display: block; margin-top: .125rem; }

.add-btn {
  display: inline-flex; align-items: center; gap: .375rem;
  padding: .375rem .875rem; border-radius: .5rem; border: none;
  background: var(--color-primary); color: var(--color-primary-content);
  font-size: .8125rem; font-weight: 600; cursor: pointer; transition: opacity .12s;
  &:hover { opacity: .88; }
}

.inline-form { display: flex; gap: .5rem; margin-bottom: 1rem; align-items: center; }
.fields { display: flex; gap: .5rem; flex: 1; }
.field {
  padding: .4375rem .625rem; border-radius: .5rem; border: .0625rem solid var(--color-border);
  background: var(--color-base-100); font-size: .8125rem; color: var(--color-base-content);
  outline: none; flex: 1;
  &:focus { border-color: var(--color-primary); }
  &.slug { flex: .7; }
}
.form-actions { display: flex; gap: .25rem; }

.act {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.875rem; height: 1.875rem; border: none; border-radius: .4375rem;
  background: transparent; color: var(--color-base-content); opacity: .35;
  cursor: pointer; transition: all .12s;
  &:hover { opacity: .8; background: var(--color-base-200); }
  &.del:hover { color: var(--color-error); }
  &.ok { color: var(--color-success); opacity: 1; }
  &.cancel { opacity: .5; }
}

.items { display: flex; flex-direction: column; }
.row {
  display: flex; align-items: center; justify-content: space-between; gap: .75rem;
  padding: .75rem .875rem; border-radius: .625rem; transition: background .1s;
  &:hover { background: var(--color-base-200); }
  &.editing { background: var(--color-base-200); }
}

.info { display: flex; align-items: baseline; gap: .5rem; min-width: 0; }
.name { font-size: .875rem; font-weight: 500; }
.slug { font-size: .75rem; opacity: .35; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions { display: flex; gap: .125rem; opacity: 0; transition: opacity .1s; .row:hover & { opacity: 1; } }

.dim, .empty { text-align: center; padding: 3.75rem 0; font-size: .875rem; opacity: .35; }
</style>
