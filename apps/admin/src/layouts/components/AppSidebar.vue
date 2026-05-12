<script lang="ts" setup>
import { menuRoutes } from "~/router/routes";

defineProps<{
  mobile?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleClick() {
  emit("close");
}
</script>

<template>
  <nav class="nav">
    <router-link
      v-for="route in menuRoutes"
      :key="route.path"
      :to="route.path"
      class="nav-item"
      @click="mobile && handleClick()"
    >
      <component
        :is="route.meta?.icon"
        v-if="route.meta?.icon"
        :size="18"
      />

      <span>
        {{ route.meta?.title }}
      </span>
    </router-link>
  </nav>
</template>