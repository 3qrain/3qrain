<script setup lang="ts">
import { formatDate } from '~/utils/date'

const props = defineProps<{ targetType: string; targetId: number }>()

const commentApi = useCommentApi()
const store = useAppStore()

const comments = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const t = ref(String(Date.now()))
const noMore = ref(false)
const sentinel = ref<HTMLElement | null>(null)

const showReply = reactive(new Set<number>())

function toggleReply(id: number) {
  if (showReply.has(id)) showReply.delete(id)
  else showReply.add(id)
}

async function load(append = false) {
  loading.value = true
  try {
    const res = await commentApi.getList(props.targetType, props.targetId, 10, t.value)
    if (res.success) {
      comments.value = append ? [...comments.value, ...res.data.list] : res.data.list
      total.value = res.data.total
      noMore.value = res.data.list.length < 10
    }
  } catch { /* ignore */ } finally { loading.value = false }
}

let observer: IntersectionObserver | null = null
function setupObserver() {
  teardownObserver()
  if (!sentinel.value) return
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !loading.value && !noMore.value) load(true)
  }, { rootMargin: '0px 0px 100px 0px' })
  observer.observe(sentinel.value)
}
function teardownObserver() { observer?.disconnect(); observer = null }
watch(loading, () => { if (!loading.value) setupObserver() })

onMounted(() => { load(); setupObserver() })
onUnmounted(teardownObserver)
</script>

<template>
  <div class="section">
    <h3 class="title">评论 <span v-if="total" class="count">{{ total }}</span></h3>

    <ClientOnly>
      <CommentComposer
        v-if="store.user"
        :target-type="targetType"
        :target-id="targetId"
        @done="() => { t = String(Date.now()); load() }"
      />
      <p v-else class="login">请 <a href="/api/auth/github">登录</a> 后参与评论</p>
    </ClientOnly>

    <template v-if="comments.length">
      <div v-for="c in comments" :key="c.id" class="thread">
        <div class="comment">
          <img :src="c.user.avatarUrl" alt="" class="avatar" />
          <div class="body">
            <div class="meta">
              <span class="name">{{ c.user.username }}</span>
              <span v-if="c.isPinned" class="pin">置顶</span>
              <time>{{ formatDate(c.createdAt) }}</time>
            </div>
            <p class="text">{{ c.content }}</p>
            <button v-if="store.user" class="act" @click="toggleReply(c.id)">回复</button>

            <CommentComposer
              v-if="showReply.has(c.id)"
              :target-type="targetType"
              :target-id="targetId"
              :reply-to="{ id: c.id, userId: c.userId, username: c.user.username, replyToId: undefined }"
              @cancel="showReply.delete(c.id)"
              @done="() => { showReply.delete(c.id); t = String(Date.now()); load() }"
            />

            <div v-if="c.replies?.length" class="replies">
              <div v-for="r in c.replies" :key="r.id" class="comment sub">
                <img :src="r.user.avatarUrl" alt="" class="avatar" />
                <div class="body">
                  <div class="meta">
                    <span class="name">{{ r.user.username }}</span>
                    <template v-if="r.replyToUser">
                      <span class="re">回复</span>
                      <span class="name">{{ r.replyToUser.username }}</span>
                    </template>
                    <time>{{ formatDate(r.createdAt) }}</time>
                  </div>
                  <p class="text">{{ r.content }}</p>
                  <button v-if="store.user" class="act" @click="toggleReply(r.id)">回复</button>

                  <CommentComposer
                    v-if="showReply.has(r.id)"
                    :target-type="targetType"
                    :target-id="targetId"
                    :reply-to="{ id: c.id, userId: r.userId, username: r.user.username, replyToId: r.id }"
                    @cancel="showReply.delete(r.id)"
                    @done="() => { showReply.delete(r.id); t = String(Date.now()); load() }"
                  />
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div ref="sentinel" class="sentinel">
        <BaseLoading v-if="loading" />
        <p v-else-if="noMore && total > 10" class="end">— 已经到底了 —</p>
      </div>
    </template>

    <p v-else-if="!loading" class="empty">还没有评论，来发表第一条吧</p>
    <BaseLoading v-else />
  </div>
</template>

<style scoped lang="less">
.section { max-width: 48rem; margin: 3rem auto 0; padding-top: 2rem; }
.title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1.25rem; }
.count { font-size: .75rem; font-weight: 600; color: var(--color-primary); background: color-mix(in oklab, var(--color-primary) 12%, transparent); padding: 0 .4375rem; border-radius: .25rem; line-height: 1.25rem; vertical-align: middle; margin-left: .375rem; }
.login { font-size: .875rem; opacity: .35; margin-bottom: 1.5rem; a { color: var(--color-primary); } }
.empty { padding: 3rem 0; text-align: center; font-size: .875rem; opacity: .35; }
.thread { padding: 1rem 0; & + & { border-top: 1px solid var(--color-border); } }
.comment { display: flex; gap: .75rem;
  &.sub { margin-top: .625rem; .avatar { width: 1.5rem; height: 1.5rem; } .text { font-size: .8125rem; } }
}
.avatar { width: 2.25rem; height: 2.25rem; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.body { flex: 1; min-width: 0; }
.meta { display: flex; align-items: center; gap: .375rem; font-size: .8125rem; margin-bottom: .125rem; }
.name { font-weight: 600; }
.pin { font-size: .625rem; font-weight: 600; color: var(--color-primary); }
.re { font-size: .75rem; opacity: .35; font-weight: 400; }
time { font-size: .75rem; opacity: .35; }
.text { font-size: .875rem; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
.act { border: none; background: transparent; font-size: .75rem; color: var(--color-base-content); opacity: .25; cursor: pointer; padding: 0; transition: opacity .15s; &:hover { opacity: .5; } }
.replies { margin-top: .375rem; padding-left: 1.25rem; border-left: 1.5px solid color-mix(in oklab, var(--color-base-content) 8%, transparent); }
.sentinel { padding: 1rem 0; text-align: center; }
.end { font-size: .75rem; opacity: .25; }
</style>
