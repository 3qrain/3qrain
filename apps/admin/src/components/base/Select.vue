<script setup lang="ts" generic="T extends string | number">
defineProps<{
  options: { label: string; value: T; disabled?: boolean }[];
  placeholder?: string;
  disabled?: boolean;
}>();

const model = defineModel<T>();
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
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-base-100);
  font-size: 13px;
  color: var(--color-base-content);
  outline: none;
  cursor: pointer;
  font-family: inherit;
  box-sizing: border-box;

  &:focus { border-color: var(--color-primary); }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
