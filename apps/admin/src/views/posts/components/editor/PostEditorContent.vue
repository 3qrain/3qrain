<script setup lang="ts">
import { ref } from "vue";
import TiptapEditor from "./tiptap/TiptapEditor.vue";

const title = defineModel<string>("title", { default: "" });
defineProps<{ initialContent?: object }>();

const editorRef = ref<InstanceType<typeof TiptapEditor> | null>(null);

function getContent() {
  return editorRef.value?.getContent() || { json: {}, html: "", text: "" };
}

defineEmits<{ (e: "dirty"): void }>();
defineExpose({ getContent });
</script>

<template>
  <div class="root">
    <div class="wrap">
      <input
        :value="title"
        class="title-input"
        placeholder="文章标题"
        @input="title = ($event.target as HTMLInputElement).value"
      />
      <div class="divider" />
      <TiptapEditor ref="editorRef" :initial-content="initialContent" @dirty="$emit('dirty')" />
    </div>
  </div>
</template>

<style scoped lang="less">
.root {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.wrap {
  max-width: 768px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 40px 40px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.title-input {
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 700;
  padding: 0 0 16px;
  color: var(--color-base-content);
  background: transparent;

  &::placeholder { opacity: 0.25; }
}

.divider {
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 8px;
}

@media (width <= 768px) {
  .wrap { padding-left: 16px; padding-right: 16px; }
}
</style>
