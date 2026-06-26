<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { formatDate } from '~/utils/date'

const props = defineProps<{
  targetType: string
  targetId: number
}>()

const commentApi = useCommentApi()
const userApi = useUserApi()

const comments = ref<typeof import('~/composables/useCommentApi').CommentItem[]>([])
const total = ref(0)
const totalPages = ref(1)
const page = ref(1)
const loading = ref(true)
const submitting = ref(false)

const content = ref('')
const replyTo = ref<{ id: number; userId: number; username: string } | null>(null)

const user = ref<any>(null)

// 树形结构
const commentTree = computed(() => {
  const parents: any[] = []
  const replies: Record<number, any[]> = {}

  for (const c of comments.value as any[]) {
    if (c.parentId) {
      if (!replies[c.parentId]) replies[c.parentId] = []
      replies[c.parentId].push(c)
    } else {
      parents.push(c)
    }
  }
  return { parents, replies }
})

async function load() {
  loading.value = true
  try {
    const res = await commentApi.getList(props.targetType, props.targetId, page.value)
    if (res.success) {
      comments.value = res.data.list
      total.value = res.data.total
      totalPages.value = Math.ceil(res.data.total / 20)
    }
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

async function fetchUser() {
  try {
    const res = await userApi.me()
    user.value = res.data ?? null
  } catch { /* ignore */ }
}

function startReply(comment: any) {
  replyTo.value = { id: comment.id, userId: comment.userId, username: comment.user.username }
}

function cancelReply() {
  replyTo.value = null
}

async function submit(parentId?: number, replyToUserId?: number) {
  if (!content.value.trim()) return
  submitting.value = true
  try {
    const res = await commentApi.create({
      targetType: props.targetType,
      targetId: props.targetId,
      content: content.value,
      parentId,
      replyToUserId,
    })
    if (res.success) {
      content.value = ''
      replyTo.value = null
      await load()
    } else {
      toast.error(res.message)
    }
  } catch (e: any) {
    toast.error(e?.message || '服务异常')
  } finally {
    submitting.value = false
  }
}

load()
fetchUser()
</script>

<template>
  <div class="comments">
    <h3 class="title">评论 {{ total ? `(${total})` : '' }}</h3>

    <!-- 评论输入框 -->
    <div v-if="user" class="composer">
      <img :src="user.avatarUrl" alt="" class="avatar" />
      <div class="composer-body">
        <div v-if="replyTo" class="reply-hint">
          回复 <strong>@{{ replyTo.username }}</strong>
          <button class="cancel-reply" @click="cancelReply">取消</button>
        </div>
        <textarea
          v-model="content"
          class="input"
          rows="3"
          :placeholder="replyTo ? `回复 @${replyTo.username}...` : '说点什么...'"
          maxlength="500"
        />
        <button class="btn-submit" :disabled="!content.trim() || submitting" @click="submit(replyTo?.id, replyTo?.userId)">
          {{ submitting ? '提交中...' : '发布' }}
        </button>
      </div>
    </div>
    <p v-else class="login-tip">
      <a href="/api/auth/github">登录</a>后参与评论
    </p>

    <!-- 评论列表 -->
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="!commentTree.parents.length" class="empty">暂无评论</div>

    <div v-else class="list">
      <div v-for="c in commentTree.parents" :key="c.id" class="comment">
        <img :src="c.user.avatarUrl" alt="" class="avatar" />
        <div class="comment-body">
          <div class="comment-head">
            <span class="username">{{ c.user.username }}</span>
            <span v-if="c.isPinned" class="pin-badge">置顶</span>
            <time>{{ formatDate(c.createdAt) }}</time>
          </div>
          <p class="comment-content">{{ c.content }}</p>
          <button v-if="user" class="reply-btn" @click="startReply(c)">回复</button>

          <!-- 子评论 -->
          <div v-if="commentTree.replies[c.id]?.length" class="replies">
            <div v-for="r in commentTree.replies[c.id]" :key="r.id" class="comment reply">
              <img :src="r.user.avatarUrl" alt="" class="avatar" />
              <div class="comment-body">
                <div class="comment-head">
                  <span class="username">{{ r.user.username }}</span>
                  <template v-if="r.replyToUser">
                    <span class="reply-arrow">→</span>
                    <span class="username">{{ r.replyToUser.username }}</span>
                  </template>
                  <time>{{ formatDate(r.createdAt) }}</time>
                </div>
                <p class="comment-content">{{ r.content }}</p>
                <button v-if="user" class="reply-btn" @click="startReply(c)">回复</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BasePagination
      v-if="totalPages > 1"
      class="pagination"
      :current-page="page"
      :total-pages="totalPages"
      @change="p => { page = p; load() }"
    />
  </div>
</template>

<style scoped lang="less">
.comments {
  max-width: 48rem;
  margin: 3rem auto 0;
  padding: 2rem 0;
  border-top: 1px solid var(--color-border);
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

/* --- Composer --- */
.composer {
  display: flex;
  gap: .75rem;
  margin-bottom: 2rem;
}

.composer-body {
  flex: 1;
}

.avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.reply-hint {
  font-size: .75rem;
  opacity: 0.5;
  margin-bottom: .375rem;
}

.cancel-reply {
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-size: .75rem;
  margin-left: .5rem;
}

.input {
  width: 100%;
  padding: .5rem .75rem;
  border-radius: .5rem;
  border: 1px solid var(--color-border);
  background: var(--color-base-100);
  font-size: .875rem;
  color: var(--color-base-content);
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;

  &:focus { border-color: var(--color-primary); }
}

.btn-submit {
  margin-top: .5rem;
  padding: .375rem 1rem;
  border-radius: .375rem;
  border: none;
  background: var(--color-primary);
  color: var(--color-primary-content);
  font-size: .8125rem;
  font-weight: 500;
  cursor: pointer;

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: default; }
}

.login-tip {
  font-size: .875rem;
  opacity: 0.4;
  margin-bottom: 2rem;

  a { color: var(--color-primary); }
}

.loading,
.empty {
  padding: 2rem 0;
  text-align: center;
  font-size: .875rem;
  opacity: 0.35;
}

/* --- List --- */
.list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.comment {
  display: flex;
  gap: .75rem;
  padding: .75rem 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child { border-bottom: none; }

  &.reply {
    border-bottom: none;
    padding: .5rem 0;

    .avatar { width: 1.75rem; height: 1.75rem; }
  }
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-head {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .75rem;
  opacity: 0.5;
  margin-bottom: .25rem;
}

.username {
  font-weight: 600;
  opacity: 0.8;
}

.pin-badge {
  font-size: .625rem;
  font-weight: 600;
  color: var(--color-warning);
}

.reply-arrow {
  font-size: .625rem;
  opacity: 0.4;
}

.comment-content {
  font-size: .875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-btn {
  border: none;
  background: transparent;
  font-size: .75rem;
  color: var(--color-base-content);
  opacity: 0.3;
  cursor: pointer;
  margin-top: .25rem;

  &:hover { opacity: 0.6; }
}

.replies {
  margin-top: .5rem;
  padding-left: 1.25rem;
  border-left: 2px solid var(--color-border);
}

.pagination {
  margin-top: 2rem;
}
</style>
