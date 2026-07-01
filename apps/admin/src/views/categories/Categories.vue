<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { toast } from "vue-sonner";
import { Pencil, Trash2, Plus, Check, X, Loader } from "@lucide/vue";
import Button from "~/components/base/Button.vue";
import { getCategories, createCategory, updateCategory, deleteCategory } from "~/api/categories";
import type { Category } from "~/api/categories/types";
import { withMinDuration } from '~/utils/async'

const list = ref<Category[]>([]);
const loading = ref(true);
const adding = ref(false);
const editing = ref<number | null>(null);
const saving = ref(false);
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
  nextTick(() => (document.querySelector(".row.editing input") as HTMLInputElement)?.focus());
}

function cancel() { adding.value = false; editing.value = null; }

async function save() {
  if (!form.value.name || !form.value.slug) { toast.error("名称和标识不能为空"); return; }
  saving.value = true;
  try {
    if (editing.value) { await withMinDuration(() => updateCategory(editing.value!, form.value)); toast.success("已更新"); }
    else { await withMinDuration(() => createCategory(form.value)); toast.success("已创建"); }
    cancel();
    await load();
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "操作失败");
  } finally { saving.value = false; }
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
      <div>
        <h1>分类</h1>
        <span class="sub">{{ list.length }} 个分类</span>
      </div>
      <Button v-if="!adding" size="sm" @click="startAdd">
        <Plus style="width: 0.875rem; height: 0.875rem;" /> 新建
      </Button>
    </div>

    <!-- 新建行 -->
    <Transition name="slide">
      <div v-if="adding" class="inline-form">
        <div class="fields">
          <input v-model="form.name" class="field" placeholder="名称，如：技术" @keyup.enter="save" @keyup.esc="cancel" />
          <input v-model="form.slug" class="field slug" placeholder="标识，如：tech" @keyup.enter="save" @keyup.esc="cancel" />
        </div>
        <div class="form-actions">
          <button class="act ok" :disabled="saving" @click="save">
            <Loader v-if="saving" style="width: 0.875rem; height: 0.875rem;" class="spin" />
            <Check v-else style="width: 0.875rem; height: 0.875rem;" />
          </button>
          <button class="act cancel" @click="cancel"><X style="width: 0.875rem; height: 0.875rem;" /></button>
        </div>
      </div>
    </Transition>

    <!-- 列表 -->
    <div v-if="loading" class="empty">加载中...</div>
    <div v-else-if="list.length === 0 && !adding" class="empty">暂无分类</div>
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
          <div class="row-right">
            <span v-if="item.postCount > 0" class="count">{{ item.postCount }} 篇文章</span>
            <div class="actions">
              <button class="act" @click="startEdit(item)"><Pencil style="width: 0.875rem; height: 0.875rem;" /></button>
              <button class="act del" @click="remove(item)"><Trash2 style="width: 0.875rem; height: 0.875rem;" /></button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="fields">
            <input v-model="form.name" class="field" @keyup.enter="save" @keyup.esc="cancel" />
            <input v-model="form.slug" class="field slug" @keyup.enter="save" @keyup.esc="cancel" />
          </div>
          <div class="form-actions">
            <button class="act ok" :disabled="saving" @click="save">
              <Loader v-if="saving" style="width: 0.875rem; height: 0.875rem;" class="spin" />
              <Check v-else style="width: 0.875rem; height: 0.875rem;" />
            </button>
            <button class="act cancel" @click="cancel"><X style="width: 0.875rem; height: 0.875rem;" /></button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.page {
  max-width: 36rem;
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

/* ---- Inline Form ---- */
.inline-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.625rem 0.75rem;
  align-items: center;
  background: var(--color-base-200);
  border-radius: 0.5rem;
}

.fields { display: flex; gap: 0.5rem; flex: 1; }

.field {
  padding: 0.4375rem 0.625rem;
  border-radius: 0.4375rem;
  border: 0.0625rem solid var(--color-border);
  background: var(--color-base-100);
  font-size: 0.8125rem;
  color: var(--color-base-content);
  outline: none;
  flex: 1;
  transition: border-color 0.15s;

  &:focus { border-color: var(--color-primary); }
  &.slug { flex: 0.7; }
}

.form-actions { display: flex; gap: 0.25rem; }

/* ---- Transition ---- */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-0.375rem);
}

/* ---- List ---- */
.items { display: flex; flex-direction: column; }

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  transition: background 0.1s;

  &:hover { background: var(--color-base-200); }
  &.editing { background: var(--color-base-200); }
}

.info {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.name { font-size: 0.875rem; font-weight: 500; }

.slug {
  font-size: 0.75rem;
  opacity: 0.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.count {
  font-size: 0.6875rem;
  opacity: 0.3;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 0.125rem;
  opacity: 0;
  transition: opacity 0.1s;
  .row:hover & { opacity: 1; }
}

/* ---- Action Buttons ---- */
.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.35;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { opacity: 0.8; background: var(--color-base-200); }
  &.del:hover { color: var(--color-error); }
  &.ok { color: var(--color-success); opacity: 1; }
  &.cancel { opacity: 0.5; }
  &:disabled { opacity: 0.3; cursor: default; }
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty {
  text-align: center;
  padding: 3rem 0;
  font-size: 0.875rem;
  opacity: 0.3;
}
</style>
