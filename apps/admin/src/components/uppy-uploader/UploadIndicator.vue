<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRaw } from 'vue'
import { Check } from '@lucide/vue'
import { useUppyStore } from '~/stores/uppy'

const rawUppy = toRaw(useUppyStore().uppy)

const visible = ref(false)
const progress = ref(0)
const done = ref(false)

const R = 16
const C = 2 * Math.PI * R
const dashOffset = computed(() => C - (C * progress.value) / 100)

function onUploadStart() {
  visible.value = true
  done.value = false
  progress.value = 0
}

function onProgress(p: number) {
  progress.value = p
}

function onComplete() {
  done.value = true
  progress.value = 100
  setTimeout(() => {
    visible.value = false
    done.value = false
    progress.value = 0
  }, 2500)
}

onMounted(() => {
  rawUppy.on('upload', onUploadStart)
  rawUppy.on('progress', onProgress)
  rawUppy.on('complete', onComplete)
})

onUnmounted(() => {
  rawUppy.off('upload', onUploadStart)
  rawUppy.off('progress', onProgress)
  rawUppy.off('complete', onComplete)
})
</script>

<template>
  <Transition name="pop">
    <div v-if="visible" :class="['indicator', { done }]">
      <svg viewBox="0 0 36 36" class="ring">
        <circle cx="18" cy="18" :r="R" class="ring-bg" />
        <circle
          cx="18" cy="18" :r="R"
          class="ring-fill"
          :stroke-dasharray="C"
          :style="{ strokeDashoffset: dashOffset }"
        />
      </svg>
      <div class="center">
        <Transition name="swap" mode="out-in">
          <Check v-if="done" key="check" :size="14" class="check" />
          <span v-else key="pct" class="pct">{{ progress }}</span>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="less">
.indicator {
  position: fixed;
  top: 1rem;
  right: 1.5rem;
  z-index: 200;
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-base-100);
  border-radius: 50%;
  box-shadow: 0 0.125rem 0.75rem rgb(0 0 0 / 0.12);
  cursor: default;

  &.done {
    animation: pulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: var(--color-base-300);
  stroke-width: 2;
}

.ring-fill {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;

  .done & {
    stroke: var(--color-success);
  }
}

.center {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pct {
  font-size: 0.5625rem;
  font-weight: 700;
  opacity: 0.4;
  font-variant-numeric: tabular-nums;
}

.check {
  color: var(--color-success);
}

@keyframes pulse {
  0% { transform: scale(1); }
  40% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.pop-enter-active {
  animation: pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-leave-active {
  animation: pop-out 0.2s ease;
}

@keyframes pop-in {
  from { opacity: 0; transform: scale(0.3); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes pop-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.3); }
}

.swap-enter-active,
.swap-leave-active {
  transition: all 0.15s ease;
}
.swap-enter-from { opacity: 0; transform: scale(0.5); }
.swap-leave-to { opacity: 0; transform: scale(0.5); }
</style>
