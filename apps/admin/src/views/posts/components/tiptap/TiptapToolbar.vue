<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import {
  Bold, Italic, Strikethrough, Code, Quote,
  List, ListOrdered, Heading1, Heading2, Heading3,
  Minus, Link, CornerDownLeft,
} from "@lucide/vue";

defineProps<{ editor: Editor }>();

function addLink(editor: Editor) {
  const url = prompt("链接地址");
  if (url) editor.chain().focus().setLink({ href: url }).run();
}

const groups = [
  [
    { icon: Heading1, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run(), active: (e: Editor) => e.isActive("heading", { level: 1 }) },
    { icon: Heading2, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e: Editor) => e.isActive("heading", { level: 2 }) },
    { icon: Heading3, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e: Editor) => e.isActive("heading", { level: 3 }) },
  ],
  [
    { icon: Bold, action: (e: Editor) => e.chain().focus().toggleBold().run(), active: (e: Editor) => e.isActive("bold") },
    { icon: Italic, action: (e: Editor) => e.chain().focus().toggleItalic().run(), active: (e: Editor) => e.isActive("italic") },
    { icon: Strikethrough, action: (e: Editor) => e.chain().focus().toggleStrike().run(), active: (e: Editor) => e.isActive("strike") },
    { icon: Code, action: (e: Editor) => e.chain().focus().toggleCode().run(), active: (e: Editor) => e.isActive("code") },
    { icon: Link, action: (e: Editor) => addLink(e), active: (e: Editor) => e.isActive("link") },
  ],
  [
    { icon: Quote, action: (e: Editor) => e.chain().focus().toggleBlockquote().run(), active: (e: Editor) => e.isActive("blockquote") },
    { icon: List, action: (e: Editor) => e.chain().focus().toggleBulletList().run(), active: (e: Editor) => e.isActive("bulletList") },
    { icon: ListOrdered, action: (e: Editor) => e.chain().focus().toggleOrderedList().run(), active: (e: Editor) => e.isActive("orderedList") },
  ],
  [
    { icon: CornerDownLeft, action: (e: Editor) => e.chain().focus().setHorizontalRule().run(), active: () => false },
  ],
];
</script>

<template>
  <div class="toolbar">
    <template v-for="(group, gi) in groups" :key="gi">
      <div class="group">
        <button
          v-for="(btn, bi) in group"
          :key="bi"
          :class="['btn', btn.active(editor) && 'on']"
          @click="btn.action(editor)"
        >
          <component :is="btn.icon" :size="16" />
        </button>
      </div>
      <div v-if="gi < groups.length - 1" class="sep" />
    </template>
  </div>
</template>

<style scoped lang="less">
.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 0;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-base-300);
}

.group {
  display: flex;
  gap: 2px;
}

.sep {
  width: 1px;
  height: 20px;
  background: var(--color-base-300);
  margin: 0 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.45;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { opacity: 0.8; background: var(--color-base-200); }

  &.on {
    opacity: 1;
    background: var(--color-base-300);
  }
}
</style>
