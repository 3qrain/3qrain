<script setup lang="ts">
import { computed } from 'vue'
import Input from '~/components/base/Input.vue'
import Select from '~/components/base/Select.vue'
import type { Category, Tag } from '~/api/tags/types'

const slug = defineModel<string>('slug', { default: '' })
const summary = defineModel<string>('summary', { default: '' })
const cover = defineModel<string>('cover', { default: '' })
const isPinned = defineModel<boolean>('isPinned', { default: false })
const categoryId = defineModel<number>('categoryId', { default: 0 })
const tagIds = defineModel<number[]>('tagIds', { default: () => [] })

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
  width: 17.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: .0625rem solid var(--color-border);
}

.panel-title {
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  height: 3rem;
  font-size: .9375rem;
  font-weight: 700;
  border-bottom: .0625rem solid var(--color-border);
  flex-shrink: 0;
  margin: 0;
}

.body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: .875rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: .3125rem;
  font-size: .8125rem;

  > span:first-child {
    font-size: .75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .025rem;
    opacity: 0.4;
  }

  &.row {
    flex-direction: row;
    align-items: center;
    gap: .5rem;
  }
}

.input {
  padding: .4375rem .625rem;
  border-radius: .5rem;
  border: .0625rem solid var(--color-border);
  background: var(--color-base-100);
  font-size: .8125rem;
  color: var(--color-base-content);
  outline: none;
  font-family: inherit;

  &:focus { border-color: var(--color-primary); }
}

.area { resize: vertical; }

.chip-list { display: flex; flex-wrap: wrap; gap: .375rem; }

.chip {
  padding: .1875rem .5625rem;
  border-radius: .375rem;
  border: .0625rem solid var(--color-border);
  background: var(--color-base-100);
  font-size: .75rem;
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

.dim { font-size: .75rem; opacity: 0.35; }
.checkbox { accent-color: var(--color-primary); }
</style>
