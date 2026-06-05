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
        <Loader v-if="saveStatus === 'saving'" :size="13" class="spin" />
        <Pencil v-else-if="saveStatus === 'unsaved'" :size="13" />
        <Check v-else :size="13" />
        {{ saveStatus === 'saving' ? '保存中' : saveStatus === 'unsaved' ? '未保存' : '已保存' }}
      </span>
    </div>

    <!-- 右侧：操作 -->
    <div class="right">
      <Button v-if="isDraft || isNew" variant="success" size="sm" @click="emit('publish')">
        <Send :size="14" /> 发布
      </Button>
      <span v-else-if="isPublished" class="pub-badge">
        <Check :size="14" /> 已发布
      </span>
      <Button variant="ghost" size="sm" icon :active="settingsOpen" @click="emit('toggleSettings')">
        <Settings :size="20" />
      </Button>
    </div>
  </div>
</template>

<style scoped lang="less">
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-base-300);
}

.left, .right { display: flex; align-items: center; gap: 8px; }

/* ---- 保存状态徽章 ---- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 12px;
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
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  background: var(--color-success);
  color: var(--color-success-content);
  opacity: 0.7;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.6;
  cursor: default;
}
</style>
