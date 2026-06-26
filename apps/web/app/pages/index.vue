<script setup lang="ts">
import { formatDate } from '~/utils/date'

const postApi = usePostApi()
const noteApi = useNoteApi()

const { data: postsRes } = await useAsyncData('home-posts', () => postApi.getList({ pageSize: 5 }))
const { data: notesRes } = await useAsyncData('home-notes', () => noteApi.getList({ pageSize: 5 }))

const recentPosts = computed(() => postsRes.value?.data?.list ?? [])
const recentNotes = computed(() => notesRes.value?.data?.list ?? [])
const store = useAppStore()
</script>

<template>
  <div class="page">
    <section class="hero">
      <img v-if="store.site.avatar" :src="store.site.avatar" alt="" class="hero-avatar" />
      <h1 class="hero-name">{{ store.site.name }}</h1>
      <p v-if="store.site.bio" class="hero-bio">{{ store.site.bio }}</p>
    </section>

    <section v-if="recentPosts.length" class="section">
      <div class="section-head">
        <h2 class="section-title">文章</h2>
        <NuxtLink to="/posts" class="section-more">全部 →</NuxtLink>
      </div>
      <div class="list">
        <NuxtLink v-for="post in recentPosts" :key="post.id" :to="`/posts/${post.slug}`" class="item">
          <span class="item-title">{{ post.title }}</span>
          <time class="item-time">{{ formatDate(post.createdAt) }}</time>
        </NuxtLink>
      </div>
    </section>

    <section v-if="recentNotes.length" class="section">
      <div class="section-head">
        <h2 class="section-title">说说</h2>
        <NuxtLink to="/notes" class="section-more">全部 →</NuxtLink>
      </div>
      <div class="list">
        <div v-for="note in recentNotes" :key="note.id" class="item note-item">
          <p class="note-content">{{ note.content }}</p>
          <time class="item-time">{{ formatDate(note.createdAt) }}</time>
        </div>
      </div>
    </section>

    <p v-if="!recentPosts.length && !recentNotes.length" class="empty">还没有内容。</p>
  </div>
</template>

<style scoped lang="less">
.page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.hero {
  padding: 5rem 0 4rem;
  text-align: center;
}

.hero-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1.5rem;
}

.hero-name {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.hero-bio {
  margin-top: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  opacity: 0.45;
  max-width: 24rem;
  margin-inline: auto;
}

.section {
  margin-top: 3rem;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
}

.section-more {
  font-size: 0.75rem;
  opacity: 0.35;
  transition: opacity 0.15s;

  &:hover { opacity: 0.7; }
}

.list {
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px dashed var(--color-border);

  &:last-child { border-bottom: none; }
  &:hover .item-title { opacity: 0.7; }
}

.item-title {
  font-size: 0.9375rem;
  transition: opacity 0.15s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  font-size: 0.75rem;
  opacity: 0.3;
  white-space: nowrap;
  flex-shrink: 0;
}

.note-item {
  flex-direction: column;
  gap: 0.375rem;
}

.note-content {
  font-size: 0.875rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty {
  padding: 6rem 0;
  text-align: center;
  font-size: 0.9375rem;
  opacity: 0.35;
}

@media (max-width: 640px) {
  .page { padding: 0 1.25rem 3rem; }
  .hero { padding: 4rem 0 3rem; }
  .hero-name { font-size: 1.5rem; }
}
</style>
