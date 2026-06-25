<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.query.page) || 1)

const postApi = usePostApi()
const { data: res, status } = await useAsyncData('posts-list', () => postApi.getList({ page: page.value, pageSize: 10 }), { watch: [page] })

const posts = computed(() => res.value?.data?.list ?? [])
const total = computed(() => res.value?.data?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 10))

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  router.push({ query: { ...route.query, page: p > 1 ? p : undefined } })
}

useHead({ title: '文章 - 3qrain' })
</script>

<template>
  <div>
    <h1>文章</h1>
    <p>共 {{ total }} 篇</p>

    <div v-if="status === 'pending'">加载中...</div>

    <div v-else-if="posts.length">
      <NuxtLink v-for="post in posts" :key="post.id" :to="`/posts/${post.slug}`">
        {{ post.title }}
      </NuxtLink>
    </div>

    <p v-else>还没有文章。</p>

    <nav v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="goPage(page - 1)">←</button>
      <button
        v-for="p in totalPages"
        :key="p"
        :disabled="p === page"
        @click="goPage(p)"
      >
        {{ p }}
      </button>
      <button :disabled="page >= totalPages" @click="goPage(page + 1)">→</button>
    </nav>
  </div>
</template>
