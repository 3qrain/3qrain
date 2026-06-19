<script setup lang="ts">
const avatarSrc = '/storage/2026/06/9yazht8d98-original.png'
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink to="/" class="brand">
        <img :src="avatarSrc" alt="" class="avatar" />
        <span class="brand-name">3qrain</span>
      </NuxtLink>

      <nav class="nav">
        <NuxtLink to="/posts" class="nav-link">文章</NuxtLink>
        <NuxtLink to="/tags" class="nav-link">标签</NuxtLink>
      </nav>

      <div class="actions">
        <!-- 登录按钮占位 -->
      </div>
    </div>
  </header>
</template>

<style scoped lang="less">
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 4rem;
  display: flex;
  align-items: center;

  &-inner {
    width: 100%;
    max-width: 75rem;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: var(--color-base-content);
  flex-shrink: 0;
}

.avatar {
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  .brand:hover & {
    transform: rotate(20deg);
  }
}

.brand-name {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.nav {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.nav-link {
  position: relative;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-base-content);
  opacity: 0.4;
  text-decoration: none;
  padding: 0.25rem 0;
  transition: opacity 0.25s;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.125rem;
    width: 100%;
    height: 0.125rem;
    border-radius: 0.0625rem;
    background: var(--color-primary);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  &:hover {
    opacity: 0.7;
  }

  &.router-link-active {
    opacity: 1;

    &::after {
      transform: scaleX(1);
    }
  }
}

.actions {
  flex-shrink: 0;
  min-width: 5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
