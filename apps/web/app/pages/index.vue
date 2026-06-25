<script setup lang="ts">
const postApi = usePostApi()
const noteApi = useNoteApi()

const { data: postsRes } = await useAsyncData('home-posts', () => postApi.getList({ pageSize: 5 }))
const { data: notesRes } = await useAsyncData('home-notes', () => noteApi.getList({ pageSize: 4 }))

const recentPosts = computed(() => postsRes.value?.data?.list ?? [])
const recentNotes = computed(() => notesRes.value?.data?.list ?? [])
</script>

<template>
  <div>
    <h1>3qrain</h1>

    <div v-if="recentPosts.length">
      <h2>最近文章</h2>
      <NuxtLink v-for="post in recentPosts" :key="post.id" :to="`/posts/${post.slug}`">
        {{ post.title }}
      </NuxtLink>
    </div>

    <div v-if="recentNotes.length">
      <h2>最近说说</h2>
      <div v-for="note in recentNotes" :key="note.id">
        {{ note.content }}
      </div>
    </div>

    <p v-if="!recentPosts.length && !recentNotes.length">还没有内容。</p>
  </div>
</template>
