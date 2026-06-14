<script setup lang="ts">
import { ref } from "vue";
import { Sun, Moon, Monitor } from "@lucide/vue";
import { getTheme, setTheme } from "~/css/themes";
import type { Theme } from "~/css/themes";

const theme = ref<Theme>(getTheme());

const modes: { key: Theme; icon: typeof Sun; label: string }[] = [
  { key: "light", icon: Sun, label: "浅色" },
  { key: "dark", icon: Moon, label: "深色" },
  { key: "system", icon: Monitor, label: "跟随系统" },
];

function apply(key: Theme) {
  theme.value = key;
  setTheme(key);
}
</script>

<template>
  <div class="theme-toggle">
    <button
      v-for="m in modes"
      :key="m.key"
      :class="['btn', theme === m.key && 'on']"
      :title="m.label"
      @click="apply(m.key)"
    >
      <component :is="m.icon" :size="15" />
    </button>
  </div>
</template>

<style scoped lang="less">
.theme-toggle {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 10px;
  background: var(--color-base-300);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 6px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-base-content);
  opacity: 0.4;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { opacity: 0.7; }

  &.on {
    opacity: 1;
    background: var(--color-base-100);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
  }
}
</style>
