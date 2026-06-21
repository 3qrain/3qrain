<script setup lang="ts">
import { computed } from 'vue'
import { Settings, Send, Loader, Check, Pencil } from '@lucide/vue'
import Button from '~/components/base/Button.vue'
import Badge from '~/components/base/Badge.vue'

const props = defineProps<{
  settingsOpen: boolean
  saving?: boolean
  isDirty?: boolean
  isNew?: boolean
  isDraft?: boolean
  isPublished?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleSettings'): void
  (e: 'publish'): void
}>()

const saveStatus = computed(() => {
  if (props.saving) return 'saving'
  if (props.isNew || props.isDirty) return 'unsaved'
  return 'saved'
})

const badgeVariant = computed(() => {
  if (saveStatus.value === 'saved') return 'success'
  if (saveStatus.value === 'unsaved') return 'warning'
  return 'neutral'
})

const badgeText = computed(() => {
  if (saveStatus.value === 'saving') return '保存中'
  if (saveStatus.value === 'unsaved') return '未保存'
  return '已保存'
})
</script>

<template>
  <div class="bar">
    <div class="left">
      <Badge :variant="badgeVariant">
        <Loader v-if="saveStatus === 'saving'" style="width: .8125rem; height: .8125rem;" class="spin" />
        <Pencil v-else-if="saveStatus === 'unsaved'" style="width: .8125rem; height: .8125rem;" />
        <Check v-else style="width: .8125rem; height: .8125rem;" />
        {{ badgeText }}
      </Badge>
    </div>

    <div class="right">
      <Button v-if="isDraft || isNew" variant="success" size="sm" @click="emit('publish')">
        <Send style="width: .875rem; height: .875rem;" /> 发布
      </Button>
      <Badge v-else-if="isPublished" variant="success">
        <Check style="width: .875rem; height: .875rem;" /> 已发布
      </Badge>
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

.spin { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
