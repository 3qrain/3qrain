<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  contentId: number
  initialCount: number
}>()

const count = ref(props.initialCount)
const viewApi = useViewApi()
const appStore = useAppStore()

onMounted(async () => {
  try {
    const res = await viewApi.record(props.contentId, 'post', appStore.genVisitorId())
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
