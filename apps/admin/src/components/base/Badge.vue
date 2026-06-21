<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  }>(),
  { variant: 'neutral' },
)
</script>

<template>
  <span :class="['badge', variant]">
    <slot />
  </span>
</template>

<style scoped lang="less">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.3125rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.success {
  background: color-mix(in oklab, var(--color-success) 15%, transparent);
  color: var(--color-success);
}

.warning {
  background: color-mix(in oklab, var(--color-warning) 15%, transparent);
  color: var(--color-warning);
}

.error {
  background: color-mix(in oklab, var(--color-error) 15%, transparent);
  color: var(--color-error);
}

.info {
  background: color-mix(in oklab, var(--color-info) 15%, transparent);
  color: var(--color-info);
}

.neutral {
  background: var(--color-base-300);
  color: var(--color-base-content);
  opacity: 0.6;
}
</style>
