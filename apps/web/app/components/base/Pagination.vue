<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    mode?: 'button' | 'scroll'
    loading?: boolean
  }>(),
  { mode: 'button', loading: false }
)

const emit = defineEmits<{ (e: 'change', page: number): void }>()

const pages = computed<(number | string)[]>(() => {
  const total = props.totalPages
  const current = props.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
})

function goTo(page: number) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  emit('change', page)
}

/* ---- 滚动模式 ---- */
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupObserver() {
  if (!sentinel.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && !props.loading && props.currentPage < props.totalPages) {
        emit('change', props.currentPage + 1)
      }
    },
    { rootMargin: '0px 0px 200px 0px' }
  )
  observer.observe(sentinel.value)
}

function teardownObserver() {
  observer?.disconnect()
  observer = null
}

onMounted(() => {
  if (props.mode === 'scroll') setupObserver()
})

onUnmounted(teardownObserver)

watch(() => props.mode, async (val) => {
  teardownObserver()
  if (val === 'scroll') {
    await nextTick()
    setupObserver()
  }
})

watch(() => props.loading, async (val) => {
  if (!val && props.mode === 'scroll') {
    teardownObserver()
    await nextTick()
    setupObserver()
  }
})
</script>

<template>
  <div class="pagination">
    <template v-if="mode === 'button'">
      <nav v-if="totalPages > 1" class="pager">
        <button class="pg-btn" :disabled="currentPage <= 1" @click="goTo(currentPage - 1)">
          <ChevronLeft style="width: 1.125rem; height: 1.125rem" />
        </button>
        <template v-for="(p, i) in pages" :key="`${i}-${p}`">
          <button v-if="typeof p === 'number'" :class="['pg-num', p === currentPage && 'on']" @click="goTo(p)">
            {{ p }}
          </button>
          <span v-else class="pg-dots">...</span>
        </template>
        <button class="pg-btn" :disabled="currentPage >= totalPages" @click="goTo(currentPage + 1)">
          <ChevronRight style="width: 1.125rem; height: 1.125rem" />
        </button>
      </nav>
    </template>

    <div v-else-if="mode === 'scroll'" ref="sentinel" class="scroll-sentinel">
      <span v-if="currentPage >= totalPages && totalPages > 1" class="ended">没有更多了</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.pagination {
  min-height: 2rem;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.pg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.5;
  cursor: pointer;
  transition: all 0.12s;

  &:hover:not(:disabled) {
    opacity: 0.85;
    background: var(--color-base-200);
  }
  &:disabled {
    opacity: 0.15;
    cursor: default;
  }
}

.pg-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-base-content);
  opacity: 0.5;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    opacity: 0.85;
    background: var(--color-base-200);
  }
  &.on {
    opacity: 1;
    background: var(--color-primary);
    color: var(--color-primary-content);
  }
}

.pg-dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 0.8125rem;
  opacity: 0.3;
  user-select: none;
}

.scroll-sentinel {
  display: flex;
  justify-content: center;
  font-size: 0.8125rem;
  color: var(--color-base-content);
}

.ended {
  padding: 2rem 0;
  opacity: 0.35;
}
</style>
