<script setup lang="ts">
withDefaults(
  defineProps<{
    open?: boolean;
    height?: string;
    showHandle?: boolean;
  }>(),
  {
    height: "75vh",
    showHandle: true,
  },
);

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

function close() {
  emit("update:open", false);
}
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="overlay" @click="close" />
  </Transition>

  <Transition name="drawer">
    <aside v-if="open" class="drawer">
      <div class="drawer-header">
        <div v-if="showHandle" class="drawer-handle" />
        <slot name="header" />
      </div>
      <div class="drawer-content">
        <slot />
      </div>
    </aside>
  </Transition>
</template>

<style scoped lang="less">
.overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.5);
  z-index: 40;
}

.drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: v-bind(height);
  background: var(--color-base-200);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow:
    0 -10px 30px rgb(0 0 0 / 0.12),
    0 -2px 10px rgb(0 0 0 / 0.08);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px 8px;
  flex-shrink: 0;
}

.drawer-handle {
  width: 48px;
  height: 5px;
  border-radius: 999px;
  background: rgb(120 120 120 / 0.35);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
}

/* --- Transitions --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}
</style>
