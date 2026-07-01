<script setup lang="ts">
import { ref, watch } from 'vue'
import { Mail } from '@lucide/vue'
import type { NotificationItem } from '~/api/notifications/types'
import { getComments } from '~/api/comments'
import type { Comment } from '~/api/comments/types'
import { formatDate } from '~/utils/date'

const props = defineProps<{
  item: NotificationItem | null
}>()

const comment = ref<Comment | null>(null)
const commentLoading = ref(false)

watch(
  () => props.item,
  async item => {
    comment.value = null
    if (!item) return

    const isComment = item.type === 'new_comment' || item.type === 'new_reply'
    if (!isComment) return

    try {
      commentLoading.value = true
      const meta = item.meta ? JSON.parse(item.meta) : null
      const commentId = meta?.commentId
      if (!commentId) return

      const res = await getComments({ id: commentId })
      comment.value = res.list[0] || null
    } catch {
      /* ignore */
    } finally {
      commentLoading.value = false
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="detail-panel">
    <template v-if="item">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3 class="section-title">通知简介</h3>
        <dl class="info-grid">
          <dt>标题</dt>
          <dd>{{ item.title }}</dd>
          <dt>类型</dt>
          <dd>{{ item.type }}</dd>
          <dt>时间</dt>
          <dd>{{ formatDate(item.createdAt) }}</dd>
        </dl>
      </div>

      <!-- Meta -->
      <div v-if="item.meta" class="detail-section">
        <h3 class="section-title">元数据</h3>
        <pre class="content-meta">{{ item.meta }}</pre>
      </div>

      <!-- 通知内容 -->
      <div v-if="comment" class="detail-section">
        <h3 class="section-title">通知内容</h3>
        <div v-if="comment" class="comment-card">
          <div class="comment-author">
            <img v-if="comment.user.avatarUrl" :src="comment.user.avatarUrl" class="comment-avatar" />
            <span class="comment-username">{{ comment.user.username }}</span>
            <template v-if="comment.replyToUser">
              <span style="opacity: 0.5; font-size: .875rem;">@</span>
              <img :src="comment.replyToUser?.avatarUrl" class="comment-avatar" />
              <span class="comment-username">{{ comment.replyToUser?.username }}</span>
            </template>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-meta">
            <span>{{ (comment.targetType === 'post' ? '文章' : '说说') + '#' + comment.targetId }}</span>
            <span>{{ formatDate(comment.createdAt) }}</span>
            <!-- <span v-if="comment.replyToUser">回复 {{ comment.replyToUser.username }}</span> -->
          </div>
        </div>
        <div v-else-if="commentLoading" class="detail-section">
          <p class="loading-text">加载评论详情...</p>
        </div>
      </div>

      <!-- 邮件发送（占位） -->
      <div class="detail-section">
        <h3 class="section-title">邮件发送</h3>
        <div class="email-placeholder">
          <Mail :size="28" :stroke-width="1" />
          <p>SMTP 邮件服务暂未接入</p>
          <span>接入后此处将展示邮件发送状态、模板预览、重试操作</span>
        </div>
      </div>
    </template>

    <div v-else class="detail-empty">
      <Mail :size="32" :stroke-width="1" />
      <p>选择左侧通知查看详情</p>
    </div>
  </div>
</template>

<style scoped lang="less">
.detail-panel {
  height: 100%;
  overflow-y: auto;
  padding: 1.25rem 2rem;
}

.detail-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-base-content);
  opacity: 0.25;
  p {
    font-size: 0.8125rem;
    margin: 0;
  }
}

.detail-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
  color: var(--color-base-content);
  opacity: 0.35;
  margin: 0 0 0.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 0.25rem 1rem;
  dt {
    font-size: 0.75rem;
    color: var(--color-base-content);
    opacity: 0.4;
  }
  dd {
    font-size: 0.8125rem;
    color: var(--color-base-content);
    margin: 0;
  }
}

.content-meta {
  font-size: 0.6875rem;
  color: var(--color-base-content);
  opacity: 0.4;
  background: color-mix(in oklab, var(--color-base-content) 5%, transparent);
  padding: 0.5rem;
  border-radius: 0.25rem;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.loading-text {
  font-size: 0.75rem;
  color: var(--color-base-content);
  opacity: 0.35;
  margin: 0;
}

.comment-card {
  padding: 0.75rem;
  background: color-mix(in oklab, var(--color-base-content) 4%, transparent);
  border-radius: 0.5rem;
}

.comment-author {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1rem;
}

.comment-avatar {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
}

.comment-username {
  font-size: 0.8125rem;
  font-weight: 600;
}

.comment-content {
  font-size: 0.8125rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 0.5rem;
}

.comment-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.6875rem;
  color: var(--color-base-content);
  opacity: 0.4;
}

.email-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 2rem 1rem;
  border: 0.0625rem dashed var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-base-content);
  opacity: 0.35;
  p {
    font-size: 0.8125rem;
    margin: 0;
  }
  span {
    font-size: 0.6875rem;
    text-align: center;
  }
}
</style>
