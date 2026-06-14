<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import TiptapFloatingMenu from './floating-menu/TiptapFloatingMenu.vue'
import TiptapBubbleMenu from './bubble-menu/TiptapBubbleMenu.vue'
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{ initialContent?: object }>()
const emit = defineEmits<{ (e: 'dirty'): void }>()

const editor = useEditor({
  extensions: [
    StarterKit,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Image.configure({
      inline: true,
      resize: {
        enabled: true,
        directions: ['right'],
        minWidth: 50,
        minHeight: 50,
        alwaysPreserveAspectRatio: true
      }
    })
  ],
  content: props.initialContent,
  onUpdate: () => emit('dirty')
})

function getContent() {
  if (!editor.value) return {}
  return {
    json: editor.value.getJSON(),
    html: editor.value.getHTML(),
    text: editor.value.getText()
  }
}

function addLink(e?: Editor) {
  const ed = e || editor.value
  if (!ed) return
  const url = prompt('链接地址')
  if (url) ed.chain().focus().setLink({ href: url }).run()
}

function addImage(e?: Editor) {
  const ed = e || editor.value
  if (!ed) return
  const url = prompt('图片地址')
  if (url) ed.chain().focus().setImage({ src: url }).run()
}

onBeforeUnmount(() => editor.value?.destroy())
defineExpose({ getContent, editor })
</script>

<template>
    <TiptapFloatingMenu v-if="editor" :editor="editor" @add-image="addImage()" />
    <TiptapBubbleMenu v-if="editor" :editor="editor" @add-link="addLink()" />
    <EditorContent :editor="editor" class="tiptap-content" />
</template>

<style scoped lang="less">
.tiptap-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tiptap-content {
  flex: 1;
  padding-top: 16px;
  position: relative;

  :deep(.ProseMirror) {
    min-height: 50vh;
    outline: none;
    // >=16px 防止手机浏览器，编辑正文时放大网页
    // font-size: 16px;
    // line-height: 1.75;
    color: var(--color-base-content);

    p {
      margin: 0.5em 0;
      line-height: 1.5;
    }
    h1 {
      font-size: 1.8em;
      font-weight: 700;
      margin: 0.8em 0 0.4em;
    }
    h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 0.7em 0 0.35em;
    }
    h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 0.6em 0 0.3em;
    }

    blockquote {
      border-left: 3px solid var(--color-primary);
      padding-left: 1em;
      margin: 0.75em 0;
      opacity: 0.85;
    }

    pre {
      background: var(--color-base-200);
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      overflow-x: auto;
      code {
        background: none;
        padding: 0;
        font-size: inherit;
      }
    }

    code {
      background: var(--color-base-200);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    ul,
    ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }
    li {
      margin: 0.25em 0;
    }
    img {
      max-width: 100%;
      border-radius: 8px;
      margin: 0.75em 0;
    }
    hr {
      border: none;
      border-top: 1px solid var(--color-border);
      margin: 1.5em 0;
    }
    a {
      color: var(--color-primary);
    }
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      opacity: 0.3;
      pointer-events: none;
      float: left;
      height: 0;
    }

    img {
      display: block;
    }

    [data-resize-handle] {
      position: absolute;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 2px;
      z-index: 10;

      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }

      /* Corner handles */
      &[data-resize-handle='top-left'],
      &[data-resize-handle='top-right'],
      &[data-resize-handle='bottom-left'],
      &[data-resize-handle='bottom-right'] {
        width: 8px;
        height: 8px;
      }

      &[data-resize-handle='top-left'] {
        top: -4px;
        left: -4px;
        cursor: nwse-resize;
      }

      &[data-resize-handle='top-right'] {
        top: -4px;
        right: -4px;
        cursor: nesw-resize;
      }

      &[data-resize-handle='bottom-left'] {
        bottom: -4px;
        left: -4px;
        cursor: nesw-resize;
      }

      &[data-resize-handle='bottom-right'] {
        bottom: -4px;
        right: -4px;
        cursor: nwse-resize;
      }

      /* Edge handles */
      &[data-resize-handle='top'],
      &[data-resize-handle='bottom'] {
        height: 6px;
        left: 8px;
        right: 8px;
      }

      &[data-resize-handle='top'] {
        top: -3px;
        cursor: ns-resize;
      }

      &[data-resize-handle='bottom'] {
        bottom: -3px;
        cursor: ns-resize;
      }

      &[data-resize-handle='left'],
      &[data-resize-handle='right'] {
        width: 6px;
        top: 8px;
        bottom: 8px;
      }

      &[data-resize-handle='left'] {
        left: -3px;
        cursor: ew-resize;
      }

      &[data-resize-handle='right'] {
        right: -3px;
        cursor: ew-resize;
      }
    }

    [data-resize-state='true'] [data-resize-wrapper] {
      outline: 1px solid rgba(0, 0, 0, 0.25);
      border-radius: 0.125rem;
    }
  }
}
</style>
