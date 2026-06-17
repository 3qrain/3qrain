<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <NuxtLink to="/" class="logo">3qrain</NuxtLink>
        <nav class="nav">
          <NuxtLink to="/posts" class="nav-link">文章</NuxtLink>
          <NuxtLink to="/tags" class="nav-link">标签</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>

    <footer class="footer">
      <span>3qrain blog</span>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 56px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  background: var(--color-bg, #fff);
}

.header-inner {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav-link {
  font-size: 14px;
  color: inherit;
  opacity: 0.6;
  text-decoration: none;
  transition: opacity 0.15s;
}
.nav-link:hover,
.nav-link.router-link-active {
  opacity: 1;
}

.main {
  flex: 1;
  padding-top: 56px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.footer {
  padding: 32px 20px;
  text-align: center;
  font-size: 13px;
  opacity: 0.35;
}
</style>
