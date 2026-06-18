<script setup lang="ts">
import { computed } from "vue";
import { Settings, Send, Loader, Check, Pencil } from "@lucide/vue";
import Button from "~/components/base/Button.vue";

const props = defineProps<{
  settingsOpen: boolean;
  saving?: boolean;
  isDirty?: boolean;
  isNew?: boolean;
  isDraft?: boolean;
  isPublished?: boolean;
}>();

const emit = defineEmits<{
  (e: "toggleSettings"): void;
  (e: "publish"): void;
}>();

const saveStatus = computed(() => {
  if (props.saving) return "saving";
  if (props.isNew || props.isDirty) return "unsaved";
  return "saved";
});
</script>

<template>
  <div class="bar">
    <!-- 左侧：保存状态 -->
    <div class="left">
      <span :class="['badge', saveStatus]">
        <Loader v-if="saveStatus === 'saving'" style="width: .8125rem; height: .8125rem;" class="spin" />
        <Pencil v-else-if="saveStatus === 'unsaved'" style="width: .8125rem; height: .8125rem;" />
        <Check v-else style="width: .8125rem; height: .8125rem;" />
        {{ saveStatus === 'saving' ? '保存中' : saveStatus === 'unsaved' ? '未保存' : '已保存' }}
      </span>
    </div>

    <!-- 右侧：操作 -->
    <div class="right">
      <Button v-if="isDraft || isNew" variant="success" size="sm" @click="emit('publish')">
        <Send style="width: .875rem; height: .875rem;" /> 发布
      </Button>
      <span v-else-if="isPublished" class="pub-badge">
        <Check style="width: .875rem; height: .875rem;" /> 已发布
      </span>
      <Button variant="ghost" size="sm" icon :active="settingsOpen" @click="emit('toggleSettings')">
        <Settings style="width: 1.25rem; height: 1.25rem;" />
      </Button>
    </div>
  </div>
</template>

<style scoped lang="less">
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  height: 3rem;
  flex-shrink: 0;
  border-bottom: .0625rem solid var(--color-border);
}

.left, .right { display: flex; align-items: center; gap: .5rem; }

/* ---- 保存状态徽章 ---- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: .3125rem;
  padding: .25rem .625rem;
  border-radius: .4375rem;
  font-size: .75rem;
  font-weight: 500;

  &.saved {
    background: var(--color-success);
    color: var(--color-success-content);
    opacity: 0.85;
  }

  &.unsaved {
    background: var(--color-warning);
    color: var(--color-warning-content);
    opacity: 0.85;
  }

  &.saving {
    background: var(--color-base-300);
    color: var(--color-base-content);
    opacity: 0.7;
  }
}

.spin { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

.pub-badge {
  display: inline-flex;
  align-items: center;
  gap: .3125rem;
  padding: .375rem .875rem;
  border-radius: .5rem;
  background: var(--color-success);
  color: var(--color-success-content);
  opacity: 0.7;
  font-size: .8125rem;
  font-weight: 500;
  opacity: 0.6;
  cursor: default;
}
</style>
