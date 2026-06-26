<script setup lang="ts">
import { Sun, Moon, Monitor } from '@lucide/vue'

type Theme = 'system' | 'light' | 'dark'

const store = useAppStore()

const icons = { system: Monitor, light: Sun, dark: Moon }
const next: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }

function resolve(theme: Theme) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function apply(resolved: 'light' | 'dark') {
  document.documentElement.dataset.theme = resolved
}

function toggle() {
  store.theme = next[store.theme]
  apply(resolve(store.theme))
}

function init() {
  apply(resolve(store.theme))
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (store.theme === 'system') apply(resolve('system'))
  })
}

if (import.meta.client) {
  init()
}
</script>

<template>
  <ClientOnly>
    <button class="toggle" :title="store.theme" @click="toggle">
      <component :is="icons[store.theme]" :size="14" :stroke-width="1.5" />
    </button>
  </ClientOnly>
</template>

<style scoped lang="less">
.toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.35;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.7;
  }
}
</style>
