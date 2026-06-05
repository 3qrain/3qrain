<script setup lang="ts">
withDefaults(defineProps<{
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}>(), {
  placeholder: "",
  disabled: false,
  type: "text",
});

const model = defineModel<string>({ default: "" });
</script>

<template>
  <input
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    class="base-input"
  />
</template>

<style scoped lang="less">
.base-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  font-size: 13px;
  color: var(--color-base-content);
  outline: none;
  box-sizing: border-box;
  font-family: inherit;

  &::placeholder { opacity: 0.35; }

  &:focus { border-color: var(--color-primary); }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
