<script setup lang="ts">
const title = defineModel<string>("title", { default: "" });
const content = defineModel<string>("content", { default: "" });
</script>

<template>
  <div class="root">
    <div class="wrap">
      <input
        :value="title"
        class="title-input"
        placeholder="文章标题"
        @input="title = ($event.target as HTMLInputElement).value"
      />
      <div class="divider" />
      <textarea
        :value="content"
        class="body-input"
        placeholder="开始写作..."
        @input="content = ($event.target as HTMLTextAreaElement).value"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.root {
  flex: 1;
  overflow-y: auto;
}

.wrap {
  max-width: 768px;
  margin: 0 auto;
  padding: 24px 40px 40px;
  display: flex;
  flex-direction: column;
}

.title-input {
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 700;
  padding: 0 0 16px;
  color: var(--color-base-content);
  background: transparent;

  &::placeholder { opacity: 0.25; }
}

.divider {
  border-bottom: 1px solid var(--color-base-300);
}

.body-input {
  flex: 1;
  min-height: 60vh;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.75;
  padding: 20px 0;
  color: var(--color-base-content);
  background: transparent;
  font-family: inherit;

  &::placeholder { opacity: 0.25; }
}

@media (width <= 768px) {
  .wrap { padding-left: 16px; padding-right: 16px; }
}
</style>
