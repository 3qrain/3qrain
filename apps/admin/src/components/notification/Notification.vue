<script setup lang="ts">
</script>

<template>
  <div class="notification">
    <div class="empty">暂无消息</div>
  </div>
</template>

<style scoped lang="less">
.notification {
  padding: 16px;
}

.empty {
  text-align: center;
  color: var(--color-base-content);
  opacity: 0.4;
  padding: 48px 0;
  font-size: 14px;
}
</style>
