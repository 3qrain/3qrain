<script setup lang="ts">
import { computed } from "vue";
import { Sun, Moon, Monitor } from "@lucide/vue";
import { setTheme, type Theme } from "~/css/themes";
import { useAppStore } from "~/stores/app";

const theme = computed(() => useAppStore().theme);

const modes: { key: Theme; icon: typeof Sun; label: string }[] = [
  { key: "light", icon: Sun, label: "浅色" },
  { key: "dark", icon: Moon, label: "深色" },
  { key: "system", icon: Monitor, label: "跟随系统" },
];
</script>

<template>
  <div class="theme-toggle">
    <button
      v-for="m in modes"
      :key="m.key"
      :class="['btn', theme === m.key && 'on']"
      :title="m.label"
      @click="setTheme(m.key)"
    >
      <component :is="m.icon" style="width: .9375rem; height: .9375rem;" />
    </button>
  </div>
</template>

<style scoped lang="less">
.theme-toggle {
  display: flex;
  gap: .125rem;
  padding: .125rem;
  border-radius: .625rem;
  background: var(--color-base-300);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: .375rem 0;
  border: none;
  border-radius: .5rem;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.4;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { opacity: 0.7; }

  &.on {
    opacity: 1;
    background: var(--color-base-100);
    box-shadow: 0 .0625rem .1875rem rgb(0 0 0 / 0.08);
  }
}
</style>
