<script lang="ts" setup>
import { Toaster } from 'vue-sonner'
import { useAppStore } from '~/stores/app'
import { initTheme } from '~/css/themes/index'

const store = useAppStore()
initTheme()
</script>

<template>
  <router-view />
  <Toaster :theme="store.theme" />
</template>

