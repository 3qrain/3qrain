<template>
  <div class="skeleton" >
    <slot/>
  </div>
</template>

<style scoped lang="less">
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
</style>
