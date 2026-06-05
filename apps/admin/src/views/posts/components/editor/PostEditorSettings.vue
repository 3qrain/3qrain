<script setup lang="ts">
import { computed } from "vue";
import Input from "~/components/base/Input.vue";
import Select from "~/components/base/Select.vue";
import type { Category, Tag } from "~/api/tags/types";

const slug = defineModel<string>("slug", { default: "" });
const summary = defineModel<string>("summary", { default: "" });
const cover = defineModel<string>("cover", { default: "" });
const isPinned = defineModel<boolean>("isPinned", { default: false });
const categoryId = defineModel<number>("categoryId", { default: 0 });
const tagIds = defineModel<number[]>("tagIds", { default: () => [] });

const props = defineProps<{
  categories: Category[];
  tags: Tag[];
}>();

const emit = defineEmits<{ (e: "change"): void }>();

const categoryOptions = computed(() =>
  props.categories.map(c => ({ label: c.name, value: c.id }))
);
</script>

<template>
  <div class="panel">
    <h2 class="panel-title">文章设置</h2>
    <div class="body">
      <label class="field">
        <span>分类</span>
        <Select v-model="categoryId" :options="categoryOptions" placeholder="选择分类" @change="emit('change')" />
      </label>

      <label class="field">
        <span>标识</span>
        <Input v-model="slug" placeholder="hello-world" @input="emit('change')" />
      </label>

      <label class="field">
        <span>摘要</span>
        <textarea :value="summary" class="input area" rows="3" placeholder="文章摘要" @input="summary = ($event.target as HTMLTextAreaElement).value; emit('change')" />
      </label>

      <label class="field">
        <span>封面</span>
        <Input v-model="cover" placeholder="https://..." @input="emit('change')" />
      </label>

      <label class="field row">
        <input :checked="isPinned" type="checkbox" class="checkbox" @change="isPinned = ($event.target as HTMLInputElement).checked; emit('change')" />
        <span>置顶</span>
      </label>

      <div class="field">
        <span>标签</span>
        <div class="chip-list">
          <button
            v-for="tag in tags"
            :key="tag.id"
            :class="['chip', tagIds.includes(tag.id) && 'on']"
            @click="tagIds.includes(tag.id) ? tagIds = tagIds.filter(i => i !== tag.id) : tagIds.push(tag.id); emit('change')"
          >{{ tag.name }}</button>
          <span v-if="tags.length === 0" class="dim">暂无标签</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.panel {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--color-base-300);
}

.panel-title {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 48px;
  font-size: 15px;
  font-weight: 700;
  border-bottom: 1px solid var(--color-base-300);
  flex-shrink: 0;
  margin: 0;
}

.body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;

  > span:first-child {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    opacity: 0.4;
  }

  &.row {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
}

.input {
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  font-size: 13px;
  color: var(--color-base-content);
  outline: none;
  font-family: inherit;

  &:focus { border-color: var(--color-primary); }
}

.area { resize: vertical; }

.chip-list { display: flex; flex-wrap: wrap; gap: 6px; }

.chip {
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  font-size: 12px;
  cursor: pointer;
  color: var(--color-base-content);
  opacity: 0.5;
  transition: all 0.12s;

  &:hover { opacity: 0.8; }

  &.on {
    opacity: 1;
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-primary-content);
  }
}

.dim { font-size: 12px; opacity: 0.35; }
.checkbox { accent-color: var(--color-primary); }
</style>
