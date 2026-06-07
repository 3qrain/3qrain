<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>

<template>
  <button :class="{ on: active }">
    <slot />
  </button>
</template>

<style scoped lang="less">
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.55;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { opacity: 0.85; background: var(--color-base-200); }
  &.on { opacity: 1; background: var(--color-base-300); }
}
</style>
