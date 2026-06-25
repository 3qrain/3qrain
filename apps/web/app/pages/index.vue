<script setup lang="ts">
import { formatDate, formatRelativeTime } from '~/utils/date'

const postApi = usePostApi()
const noteApi = useNoteApi()

const { data: postsRes } = await useAsyncData('home-posts', () => postApi.getList({ pageSize: 5 }))
const { data: notesRes } = await useAsyncData('home-notes', () => noteApi.getList({ pageSize: 4 }))

const recentPosts = computed(() => postsRes.value?.data?.list ?? [])
const recentNotes = computed(() => notesRes.value?.data?.list ?? [])
</script>

<template>
  <div class="page">
    <section class="hero">
      <h1 class="hero-title">3qrain</h1>
      <p class="hero-desc">写点东西，记录生活。</p>
    </section>

    <section v-if="recentPosts.length" class="section">
      <div class="section-header">
        <h2 class="section-title">最近文章</h2>
        <NuxtLink to="/posts" class="section-link">查看全部 →</NuxtLink>
      </div>

      <div class="posts-list">
        <NuxtLink
          v-for="post in recentPosts"
          :key="post.id"
          :to="`/posts/${post.slug}`"
          class="post-card"
        >
          <div v-if="post.cover" class="post-cover">
            <img :src="post.cover" :alt="post.title" loading="lazy" />
          </div>
          <div class="post-body">
            <div class="post-meta">
              <span v-if="post.category" class="post-category">{{ post.category.name }}</span>
              <time>{{ formatDate(post.createdAt) }}</time>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p v-if="post.summary" class="post-summary">{{ post.summary }}</p>
            <div v-if="post.tags.length" class="post-tags">
              <span v-for="tag in post.tags" :key="tag.id" class="tag"># {{ tag.name }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section v-if="recentNotes.length" class="section">
      <div class="section-header">
        <h2 class="section-title">最近说说</h2>
        <NuxtLink to="/notes" class="section-link">查看全部 →</NuxtLink>
      </div>

      <div class="notes-list">
        <div v-for="note in recentNotes" :key="note.id" class="note-card">
          <p class="note-content">{{ note.content }}</p>
          <div v-if="note.media.length" class="note-images">
            <img
              v-for="m in note.media.slice(0, 3)"
              :key="m.id"
              :src="m.thumbnailUrl || m.url || ''"
              :alt="''"
              class="note-img"
              loading="lazy"
            />
          </div>
          <div class="note-footer">
            <div v-if="note.tags.length" class="note-tags">
              <span v-for="tag in note.tags" :key="tag.id" class="tag"># {{ tag.name }}</span>
            </div>
            <time class="note-time">{{ formatRelativeTime(note.createdAt) }}</time>
          </div>
        </div>
      </div>
    </section>

    <div v-if="!recentPosts.length && !recentNotes.length" class="empty">
      <p>还没有内容，敬请期待。</p>
    </div>
  </div>
</template>

<style scoped lang="less">
.page {
  max-width: 52rem;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.hero {
  padding: 3rem 0 4rem;

  &-title {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  &-desc {
    margin-top: 0.5rem;
    font-size: 1rem;
    opacity: 0.4;
  }
}

.section {
  margin-bottom: 3.5rem;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.section-link {
  font-size: 0.8125rem;
  opacity: 0.35;
  transition: opacity 0.2s;

  &:hover { opacity: 0.7; }
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.post-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.25rem 0;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--color-border);
  transition: opacity 0.2s;

  &:first-child { border-top: 1px solid var(--color-border); }
  &:hover { opacity: 0.7; }
}

.post-cover {
  flex-shrink: 0;
  width: 10rem;
  height: 6.5rem;
  border-radius: 0.5rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.post-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.4;
}

.post-category {
  color: var(--color-primary);
  opacity: 1;
  font-weight: 500;
}

.post-title {
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-summary {
  font-size: 0.8125rem;
  line-height: 1.6;
  opacity: 0.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.75rem;
  opacity: 0.35;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-card {
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  transition: border-color 0.2s;

  &:hover {
    border-color: color-mix(in oklab, var(--color-base-content) 20%, transparent);
  }
}

.note-content {
  font-size: 0.9375rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.note-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.note-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 0.5rem;
}

.note-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
}

.note-tags {
  display: flex;
  gap: 0.5rem;
}

.note-time {
  font-size: 0.75rem;
  opacity: 0.3;
}

.empty {
  padding: 6rem 0;
  text-align: center;
  font-size: 0.9375rem;
  opacity: 0.35;
}

@media (max-width: 640px) {
  .page { padding: 0 1.25rem 3rem; }
  .hero { padding: 2rem 0 3rem; }

  .post-card {
    flex-direction: column;
    gap: 0.75rem;
  }

  .post-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }

  .note-images {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
