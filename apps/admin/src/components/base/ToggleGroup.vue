<script setup lang="ts" generic="T extends string | number">
defineProps<{
  options: { label: string; value: T }[];
  size?: "sm" | "md";
}>();

const model = defineModel<T>();
</script>

<template>
  <div :class="['toggle-group', size === 'sm' && 'sm']">
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      :class="['opt', model === opt.value && 'on']"
      @click="model = opt.value"
    >{{ opt.label }}</button>
  </div>
</template>

<style scoped lang="less">
.toggle-group {
  display: flex;
  border-radius: .5rem;
  overflow: hidden;
  border: .0625rem solid var(--color-border);

  &.sm { .opt { padding: .25rem .625rem; font-size: .75rem; } }
}

.opt {
  flex: 1;
  padding: .3125rem 0;
  border: none;
  background: var(--color-base-100);
  font-size: .8125rem;
  cursor: pointer;
  color: var(--color-base-content);
  opacity: 0.45;
  transition: all 0.12s;
  white-space: nowrap;

  &:hover { opacity: 0.7; }

  &.on {
    opacity: 1;
    background: var(--color-base-300);
  }
}
</style>
