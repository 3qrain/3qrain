<script setup lang="ts">
import { toast } from 'vue-sonner'

const store = useAppStore()
const commentApi = useCommentApi()

const props = defineProps<{
  targetType: string
  targetId: number
  replyTo?: { id: number; userId: number; username: string; replyToId?: number } | null
}>()

const emit = defineEmits<{ cancel: []; done: [] }>()

const content = ref('')
const submitting = ref(false)
const maxLen = 500
const remaining = computed(() => maxLen - content.value.length)

async function submit() {
  if (!content.value.trim() || remaining.value < 0) return
  submitting.value = true
  try {
    const res = await commentApi.create({
      targetType: props.targetType,
      targetId: props.targetId,
      content: content.value,
      parentId: props.replyTo?.id,
      replyToId: props.replyTo?.replyToId,
      replyToUserId: props.replyTo?.userId,
    })
    if (res.success) {
      content.value = ''
      emit('done')
    } else {
      toast.error(res.message)
    }
  } catch (e: any) { toast.error(e?.message || '服务异常') }
  finally { submitting.value = false }
}
</script>

<template>
  <div class="composer" :class="{ reply: !!replyTo }">
    <div v-if="replyTo" class="to">
      回复 <strong>@{{ replyTo.username }}</strong>
      <button class="cancel" @click="emit('cancel')">×</button>
    </div>
    <div class="wrap">
      <img v-if="store.user" :src="store.user.avatarUrl" alt="" class="avatar" />
      <textarea
        v-model="content"
        class="input"
        rows="3"
        :placeholder="replyTo ? `回复 @${replyTo.username}...` : '写下你的想法...'"
        :maxlength="maxLen"
      />
    </div>
    <div class="foot">
      <span :class="['cnt', { over: remaining < 0 }]">{{ content.length }}/{{ maxLen }}</span>
      <button
        class="btn"
        :disabled="!content.trim() || remaining < 0 || submitting"
        @click="submit"
      >{{ submitting ? '...' : '发布' }}</button>
    </div>
  </div>
</template>

<style scoped lang="less">
.composer {
  margin-top: .625rem;
  padding: .75rem;
  border: 1px solid var(--color-border);
  border-radius: .625rem;

  &.reply { margin-left: 0; }
}

.to {
  display: flex; align-items: center; justify-content: space-between;
  font-size: .8125rem; opacity: .5; margin-bottom: .5rem;
}

.cancel {
  border: none; background: transparent;
  font-size: 1rem; color: var(--color-base-content);
  opacity: .35; cursor: pointer;
  &:hover { opacity: .7; }
}

.wrap {
  display: flex; gap: .625rem;
}

.avatar { width: 2rem; height: 2rem; border-radius: 50%; flex-shrink: 0; }

.input {
  flex: 1;
  padding: .4375rem .5rem;
  border-radius: .375rem;
  border: none;
  background: transparent;
  font-size: .875rem; line-height: 1.6;
  color: var(--color-base-content); outline: none;
  font-family: inherit; resize: none;
  &::placeholder { opacity: .3; }
}

.foot {
  display: flex; align-items: center; justify-content: flex-end;
  gap: .75rem; margin-top: .375rem;
}

.cnt {
  font-size: .75rem; opacity: .3;
  font-variant-numeric: tabular-nums;
  &.over { color: var(--color-error); opacity: 1; }
}

.btn {
  padding: .25rem .875rem; border-radius: .375rem; border: none;
  background: var(--color-primary); color: var(--color-primary-content);
  font-size: .8125rem; font-weight: 500; cursor: pointer;
  &:hover:not(:disabled) { opacity: .9; }
  &:disabled { opacity: .3; cursor: default; }
}
</style>
