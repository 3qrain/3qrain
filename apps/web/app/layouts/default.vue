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
  height: 3.5rem;
  display: flex;
  align-items: center;
  border-bottom: .0625rem solid var(--color-border, #e5e5e5);
  background: var(--color-bg, #fff);
}

.header-inner {
  width: 100%;
  max-width: 50rem;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.125rem;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  font-size: .875rem;
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
  padding-top: 3.5rem;
  max-width: 50rem;
  width: 100%;
  margin: 0 auto;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.footer {
  padding: 2rem 1.25rem;
  text-align: center;
  font-size: .8125rem;
  opacity: 0.35;
}
</style>
