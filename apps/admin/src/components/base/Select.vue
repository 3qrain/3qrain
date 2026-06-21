<script setup lang="ts" generic="T extends string | number">
defineProps<{
  options: { label: string; value: T; disabled?: boolean }[]
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<T>()
</script>

<template>
  <select
    v-model="model"
    :disabled="disabled"
    class="base-select"
  >
    <option v-if="placeholder" :value="undefined" disabled>{{ placeholder }}</option>
    <option
      v-for="opt in options"
      :key="String(opt.value)"
      :value="opt.value"
      :disabled="opt.disabled"
    >{{ opt.label }}</option>
  </select>
</template>

<style scoped lang="less">
.base-select {
  appearance: none;
  padding: 0.4375rem 1.75rem 0.4375rem 0.625rem;
  border-radius: 0.375rem;
  border: 0.0625rem solid var(--color-border);
  background: var(--color-base-100);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  font-size: 0.8125rem;
  color: var(--color-base-content);
  outline: none;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;

  &:focus { border-color: var(--color-primary); }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
