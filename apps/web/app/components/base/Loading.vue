<template>
  <div class="loading">
    <div class="loader" />
  </div>
</template>

<style scoped lang="less">
.loading {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.loader {
  width: 2.75rem;
  height: 2.75rem;
  position: relative;

  &::before {
    content: '';
    width: 2.75rem;
    height: 0.3125rem;
    background: color-mix(in oklab, var(--color-primary) 20%, transparent);
    position: absolute;
    top: 3.5rem;
    left: 0;
    border-radius: 50%;
    animation: shadow 0.5s linear infinite;
  }

  &::after {
    content: '';
    width: 100%;
    height: 100%;
    background: var(--color-primary);
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 0.25rem;
    animation: jump 0.5s linear infinite;
  }
}

@keyframes jump {
  15% { border-bottom-right-radius: 0.1875rem; }
  25% { transform: translateY(0.5625rem) rotate(22.5deg); }
  50% { transform: translateY(1.125rem) scale(1, 0.9) rotate(45deg); border-bottom-right-radius: 2.5rem; }
  75% { transform: translateY(0.5625rem) rotate(67.5deg); }
  100% { transform: translateY(0) rotate(90deg); }
}

@keyframes shadow {
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.2, 1); }
}
</style>
