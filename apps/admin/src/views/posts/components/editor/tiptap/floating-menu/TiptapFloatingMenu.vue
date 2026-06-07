<script setup lang="ts">
import { FloatingMenu } from "@tiptap/vue-3/menus";
import type { Editor } from "@tiptap/vue-3";
import {
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code,
  Minus, Image as ImageIcon,
} from "@lucide/vue";
import MenuButton from "../MenuButton.vue";

const props = defineProps<{ editor: Editor }>();

const emit = defineEmits<{ (e: "addImage"): void }>();
</script>

<template>
  <FloatingMenu
    :editor="props.editor"
    :tippy-options="{ duration: 150, placement: 'left', appendTo: () => props.editor.view.dom.closest('.tiptap-content') || document.body }"
    class="menu"
  >
    <MenuButton :active="props.editor.isActive('heading', { level: 1 })" @click="props.editor.chain().focus().toggleHeading({ level: 1 }).run()"><Heading1 :size="16" /></MenuButton>
    <MenuButton :active="props.editor.isActive('heading', { level: 2 })" @click="props.editor.chain().focus().toggleHeading({ level: 2 }).run()"><Heading2 :size="16" /></MenuButton>
    <MenuButton :active="props.editor.isActive('heading', { level: 3 })" @click="props.editor.chain().focus().toggleHeading({ level: 3 }).run()"><Heading3 :size="16" /></MenuButton>
    <span class="sep" />
    <MenuButton :active="props.editor.isActive('bulletList')" @click="props.editor.chain().focus().toggleBulletList().run()"><List :size="16" /></MenuButton>
    <MenuButton :active="props.editor.isActive('orderedList')" @click="props.editor.chain().focus().toggleOrderedList().run()"><ListOrdered :size="16" /></MenuButton>
    <MenuButton :active="props.editor.isActive('blockquote')" @click="props.editor.chain().focus().toggleBlockquote().run()"><Quote :size="16" /></MenuButton>
    <MenuButton :active="props.editor.isActive('codeBlock')" @click="props.editor.chain().focus().toggleCodeBlock().run()"><Code :size="16" /></MenuButton>
    <span class="sep" />
    <MenuButton @click="props.editor.chain().focus().setHorizontalRule().run()"><Minus :size="16" /></MenuButton>
    <MenuButton @click="emit('addImage')"><ImageIcon :size="16" /></MenuButton>
  </FloatingMenu>
</template>

<style scoped lang="less">
.menu {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 10px;
  background: var(--color-base-100);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
}

.sep {
  width: 1px;
  height: 18px;
  background: var(--color-border);
  margin: 0 2px;
}
</style>
