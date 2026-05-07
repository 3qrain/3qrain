<script lang="ts" setup>
import { Toaster, toast } from "vue-sonner";
</script>

<template>
  <router-view />
  <Toaster richColors />
  <button @click="() => toast.success('My first toast')">
    Give me a toast
  </button>

</template>

