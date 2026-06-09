<script lang="ts" setup>
import { Toaster } from "vue-sonner";
import { useAppStore } from "~/stores/app";

const store = useAppStore();
</script>

<template>
  <router-view />
  <Toaster :theme="store.theme" richColors />
</template>

