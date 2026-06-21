<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

withDefaults(
  defineProps<{
    placement?: 'top' | 'bottom'
    arrow?: boolean
  }>(),
  { placement: 'top', arrow: true },
)

const open = ref(false)
const wrapperRef = ref<HTMLElement>()

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function onClickOutside(e: Event) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    close()
  }
}

watch(open, (val) => {
  if (val) {
    setTimeout(() => document.addEventListener('click', onClickOutside), 0)
  } else {
    document.removeEventListener('click', onClickOutside)
  }
})

onUnmounted(() => document.removeEventListener('click', onClickOutside))

defineExpose({ close })
</script>

<template>
  <div ref="wrapperRef" class="popover-wrapper">
    <div class="trigger" @click="toggle">
      <slot />
    </div>
    <Transition name="pop">
      <div v-if="open" :class="['popover', placement, { 'no-arrow': !arrow }]">
        <slot name="content" :close="close" />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="less">
.popover-wrapper {
  position: relative;
  display: inline-flex;
}

.trigger {
  display: inline-flex;
}

.popover {
  position: absolute;
  z-index: 50;
  min-width: 10rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: var(--color-base-100);
  border: 0.0625rem solid var(--color-border);
  box-shadow: 0 0.25rem 1rem rgb(0 0 0 / 0.1);

  &.top {
    bottom: calc(100% + 0.5rem);
    right: 0;

    &::after {
      content: '';
      position: absolute;
      bottom: -0.25rem;
      right: 0.75rem;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--color-base-100);
      border-right: 0.0625rem solid var(--color-border);
      border-bottom: 0.0625rem solid var(--color-border);
      transform: rotate(45deg);
    }
  }

  &.bottom {
    top: calc(100% + 0.5rem);
    right: 0;

    &::after {
      content: '';
      position: absolute;
      top: -0.25rem;
      right: 0.75rem;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--color-base-100);
      border-left: 0.0625rem solid var(--color-border);
      border-top: 0.0625rem solid var(--color-border);
      transform: rotate(45deg);
    }
  }

  &.no-arrow::after {
    display: none;
  }
}

.pop-enter-active,
.pop-leave-active {
  transition: all 0.15s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
