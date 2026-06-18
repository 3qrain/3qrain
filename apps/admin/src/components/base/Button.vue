<script setup lang="ts">
import { Loader } from '@lucide/vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
    size?: 'sm' | 'md'
    icon?: boolean
    loading?: boolean
    disabled?: boolean
    active?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    icon: false,
    loading: false,
    disabled: false,
    active: false
  }
)
</script>

<template>
  <button :disabled="disabled || loading" :class="['btn', variant, size, { active, icon }]">
    <Loader
      v-if="loading"
      :style="size === 'sm' ? { height: '.8125rem', width: '.8125rem' } : { height: '.9375rem', width: '.9375rem' }"
      class="spin"
    />
    <slot v-else />
  </button>
</template>

<style scoped lang="less">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  border-radius: 0.5rem;
  white-space: nowrap;
  font-family: inherit;
  outline: none;
  border: 0.0625rem solid transparent;

  transition:
    background 0.15s,
    opacity 0.15s,
    scale 0.12s,
    box-shadow 0.15s;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  &:active:not(:disabled) {
    scale: 0.96;
  }
  &:focus-visible {
    box-shadow: 0 0 0 0.125rem var(--color-primary);
  }
}

/* sizes */
.sm {
  padding: 0.3125rem 0.75rem;
  font-size: 0.75rem;
}
.md {
  padding: 0.4375rem 1rem;
  font-size: 0.8125rem;
}

.icon {
  &.sm {
    padding: 0.3125rem;
  }
  &.md {
    padding: 0.4375rem;
  }
}

/* variants */
.primary {
  background: var(--color-primary);
  color: var(--color-primary-content);
  border-color: var(--color-primary);

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}

.secondary {
  background: var(--color-base-200);
  color: var(--color-base-content);
  border-color: var(--color-border);

  &:hover:not(:disabled) {
    background: var(--color-base-300);
  }
}

.ghost {
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.5;

  &:hover:not(:disabled) {
    opacity: 0.8;
    background: var(--color-base-300);
  }

  &.active {
    opacity: 1;
    background: var(--color-base-300);
  }
}

.danger {
  background: transparent;
  color: var(--color-error);
  border-color: var(--color-error);

  &:hover:not(:disabled) {
    background: var(--color-error);
    color: var(--color-error-content);
  }
}

.success {
  background: var(--color-success);
  color: var(--color-success-content);
  border-color: var(--color-success);

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}

.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
