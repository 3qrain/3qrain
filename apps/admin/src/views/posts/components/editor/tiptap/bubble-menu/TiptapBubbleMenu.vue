<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { Editor } from '@tiptap/vue-3'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  TextAlignStart,
  TextAlignCenter,
  TextAlignEnd
} from '@lucide/vue'
import MenuButton from '../MenuButton.vue'

const props = defineProps<{ editor: Editor }>()

const emit = defineEmits<{ (e: 'addLink'): void }>()
</script>

<template>
  <BubbleMenu class="menu" :editor="props.editor" :options="{ placement: 'top-start' }">
    <MenuButton
      :active="props.editor.isActive({ textAlign: 'left' })"
      @click="props.editor.chain().focus().setTextAlign('left').run()"
    >
      <TextAlignStart :size="15" />
    </MenuButton>
    <MenuButton
      :active="props.editor.isActive({ textAlign: 'center' })"
      @click="props.editor.chain().focus().setTextAlign('center').run()"
    >
      <TextAlignCenter :size="15" />
    </MenuButton>
    <MenuButton
      :active="props.editor.isActive({ textAlign: 'right' })"
      @click="props.editor.chain().focus().setTextAlign('right').run()"
    >
      <TextAlignEnd :size="15" />
    </MenuButton>
    <span class="sep" />
    <MenuButton :active="props.editor.isActive('bold')" @click="props.editor.chain().focus().toggleBold().run()">
      <Bold :size="15" />
    </MenuButton>
    <MenuButton :active="props.editor.isActive('italic')" @click="props.editor.chain().focus().toggleItalic().run()">
      <Italic :size="15" />
    </MenuButton>
    <MenuButton :active="props.editor.isActive('strike')" @click="props.editor.chain().focus().toggleStrike().run()">
      <Strikethrough :size="15" />
    </MenuButton>
    <MenuButton :active="props.editor.isActive('code')" @click="props.editor.chain().focus().toggleCode().run()"
      ><Code :size="15"
    /></MenuButton>
    <span class="sep" />
    <MenuButton :active="props.editor.isActive('link')" @click="emit('addLink')">
      <LinkIcon :size="15" />
    </MenuButton>
    <MenuButton
      :active="props.editor.isActive('heading', { level: 1 })"
      @click="props.editor.chain().focus().toggleHeading({ level: 1 }).run()"
    >
      <Heading1 :size="15" />
    </MenuButton>
    <MenuButton
      :active="props.editor.isActive('heading', { level: 2 })"
      @click="props.editor.chain().focus().toggleHeading({ level: 2 }).run()"
    >
      <Heading2 :size="15" />
    </MenuButton>
  </BubbleMenu>
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
  box-shadow: 0 4px 12px var(--color-border);
}

.sep {
  width: 1px;
  height: 18px;
  background: var(--color-border);
  margin: 0 2px;
}
</style>
