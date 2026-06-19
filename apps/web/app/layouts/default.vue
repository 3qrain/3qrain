<template>
  <div class="layout">
    <LayoutAppHeader />

    <main class="main">
      <slot />
    </main>

    <LayoutAppFooter />
  </div>
</template>

<style scoped lang="less">
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  padding-top: 5rem;
  width: 100%;
}
</style>
