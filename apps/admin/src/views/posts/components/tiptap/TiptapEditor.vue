<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TiptapToolbar from "./TiptapToolbar.vue";

const props = defineProps<{ initialContent?: object }>();
const emit = defineEmits<{ (e: "dirty"): void }>();

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Image,
  ],
  content: props.initialContent,
  onUpdate: () => emit("dirty"),
});

function getContent() {
  if (!editor.value) return {};
  return {
    json: editor.value.getJSON(),
    html: editor.value.getHTML(),
    text: editor.value.getText(),
  };
}

onBeforeUnmount(() => {
  editor.value?.destroy();
});

defineExpose({ getContent, editor });
</script>

<template>
  <div class="tiptap-root" v-if="editor">
    <TiptapToolbar :editor="editor" />
    <EditorContent :editor="editor" class="tiptap-content" />
  </div>
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
  overflow-y: auto;
  padding: 16px 0;

  :deep(.ProseMirror) {
    min-height: 50vh;
    outline: none;
    font-size: 15px;
    line-height: 1.75;
    color: var(--color-base-content);

    p { margin: 0 0 0.75em; }
    h1 { font-size: 1.8em; font-weight: 700; margin: 0.8em 0 0.4em; }
    h2 { font-size: 1.5em; font-weight: 600; margin: 0.7em 0 0.35em; }
    h3 { font-size: 1.25em; font-weight: 600; margin: 0.6em 0 0.3em; }

    blockquote {
      border-left: 3px solid var(--color-base-300);
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

      code { background: none; padding: 0; font-size: inherit; }
    }

    code {
      background: var(--color-base-200);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
    li { margin: 0.25em 0; }

    img { max-width: 100%; border-radius: 8px; margin: 0.75em 0; }
    hr { border: none; border-top: 1px solid var(--color-base-300); margin: 1.5em 0; }
    a { color: var(--color-primary); }
  }
}
</style>
