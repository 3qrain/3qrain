<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVisitorId } from '~/composables/useVisitorId'

const props = defineProps<{
  contentId: number
  initialCount: number
}>()

const count = ref(props.initialCount)

const { $api } = useNuxtApp()

onMounted(async () => {
  try {
    const visitorId = useVisitorId()
    const res = await $api<{ success: boolean; data: { viewCount: number } }>('/view', {
      method: 'POST',
      body: { contentId: props.contentId, contentType: 'post', visitorId },
    })
    if (res.success) {
      count.value = res.data.viewCount
    }
  } catch {
    /* ignore, keep SSR count */
  }
})
</script>

<template>
  <span>{{ count }} 次阅读</span>
</template>
