<script setup lang="ts">
import { Mail } from '@lucide/vue'
import type { NotificationItem } from '~/api/notifications/types'
import { formatDate } from '~/utils/date'

defineProps<{
  item: NotificationItem | null
}>()
</script>

<template>
  <div class="detail-panel">
    <template v-if="item">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3 class="section-title">通知详情</h3>
        <dl class="info-grid">
          <dt>ID</dt>
          <dd>#{{ item.id }}</dd>
          <dt>类型</dt>
          <dd>{{ item.type }}</dd>
          <dt>时间</dt>
          <dd>{{ formatDate(item.createdAt) }}</dd>
        </dl>
      </div>

      <!-- 内容 -->
      <div class="detail-section">
        <h3 class="section-title">通知内容</h3>
        <h4 class="content-title">{{ item.title }}</h4>
        <p v-if="item.content" class="content-body">{{ item.content }}</p>
        <pre v-if="item.meta" class="content-meta">{{ item.meta }}</pre>
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
  gap: .5rem;
  color: var(--color-base-content);
  opacity: .25;
  p { font-size: .8125rem; margin: 0; }
}

.detail-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: .6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .0625rem;
  color: var(--color-base-content);
  opacity: .35;
  margin: 0 0 .75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: .25rem 1rem;
  margin: 0;
  dt { font-size: .75rem; color: var(--color-base-content); opacity: .4; }
  dd { font-size: .8125rem; color: var(--color-base-content); margin: 0; }
}

.content-title {
  font-size: .9375rem;
  font-weight: 600;
  margin: 0 0 .375rem;
}

.content-body {
  font-size: .8125rem;
  color: var(--color-base-content);
  opacity: .6;
  margin: 0 0 .5rem;
  line-height: 1.5;
}

.content-meta {
  font-size: .6875rem;
  color: var(--color-base-content);
  opacity: .4;
  background: color-mix(in oklab, var(--color-base-content) 5%, transparent);
  padding: .5rem;
  border-radius: .25rem;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.email-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .375rem;
  padding: 2rem 1rem;
  border: .0625rem dashed var(--color-border);
  border-radius: .5rem;
  color: var(--color-base-content);
  opacity: .35;
  p { font-size: .8125rem; margin: 0; }
  span { font-size: .6875rem; text-align: center; }
}
</style>
