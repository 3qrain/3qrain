<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import { Plus, Trash2, Copy, Search, ShieldAlert } from '@lucide/vue'
import Button from '~/components/base/Button.vue'
import Pagination from '~/components/table/Pagination.vue'
import MediaPreview from '~/components/media/MediaPreview.vue'
import { getMedia, deleteMedia, getMediaHealth, type MediaItem } from '~/api/media'
import { useAppStore } from '~/stores/app'
import { useGlobalStore } from '~/stores/global'
import { storeToRefs } from 'pinia'

const appStore = useAppStore()

const globalStore = useGlobalStore()
const { drawerPanel } = storeToRefs(globalStore)

interface fileItem extends MediaItem {
  _loaded: boolean
}
const files = ref<fileItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(24)
const totalPages = ref(1)
const keyword = ref('')
const loading = ref(true)
const previewOpen = ref(false)
const previewIndex = ref(0)

function openPreview(item: fileItem) {
  previewIndex.value = files.value.indexOf(item)
  previewOpen.value = true
}

const showUpload = ref(false)
const health = ref({ unregistered: 0, missing: 0 })

async function load() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    const result = await getMedia(params)
    files.value = result.list as any
    total.value = result.total
    totalPages.value = Math.ceil(result.total / result.pageSize)
  } catch (e: any) {
    if (e?.code === 'ERR_CANCELED') return
    toast.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function checkHealth() {
  try {
    health.value = await getMediaHealth()
  } catch {
    /* */
  }
}

async function onDelete(item: MediaItem) {
  if (!confirm(`删除「${item.filename}」？`)) return
  try {
    await deleteMedia(item.id)
    toast.success('已删除')
    await load()
    await checkHealth()
  } catch {
    toast.error('删除失败')
  }
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  toast.success('已复制')
}

function formatBytes(bytes: number) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function isImg(t: string) {
  return t === 'image' || t === 'svg'
}

function search() {
  page.value = 1
  load()
}

onMounted(() => {
  load()
  checkHealth()
})
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>媒体库</h1>
        <span class="sub">{{ total }} 个文件</span>
      </div>
      <div class="head-act">
        <label class="search-box">
          <Search :size="14" />
          <input v-model="keyword" placeholder="搜索..." @keyup.enter="search" />
        </label>
        <Button
          variant="ghost"
          size="sm"
          @click="checkHealth()"
          :class="{ warn: health.unregistered > 0 || health.missing > 0 }"
        >
          <ShieldAlert :size="14" />
          健康
          <span v-if="health.unregistered || health.missing" class="health-num">{{
            health.unregistered + health.missing
          }}</span>
        </Button>
        <Button variant="primary" size="sm" @click="drawerPanel = 'upload'">
          <Plus :size="15" /> {{ '上传' }}
        </Button>
      </div>
    </div>

    <!-- Upload Area -->
    <Transition name="slide">
      <div v-if="showUpload" class="upload-area">
        <div id="uppy-inline" class="uppy-wrap" />
      </div>
    </Transition>

    <!-- Grid -->
    <div v-if="loading" class="dim">加载中...</div>
    <div v-else-if="files.length === 0" class="dim">暂无文件</div>
    <div v-else class="grid">
      <div v-for="item in files" :key="item.id" class="card" @click="openPreview(item)">
        <div
          class="thumb"
          :class="{ loaded: item._loaded }"
          :style="item.placeholder ? { '--placeholder': `url(${item.placeholder})` } : {}"
        >
          <img
            v-if="item.thumbnailUrl"
            :src="item.thumbnailUrl"
            :alt="item.filename"
            loading="lazy"
            @load="item._loaded = true"
          />
          <img
            v-else-if="isImg(item.type)"
            :src="item.url"
            :alt="item.filename"
            loading="lazy"
            @load="item._loaded = true"
          />
          <div v-else class="file-type">{{ item.ext?.replace('.', '')?.toUpperCase() || item.type }}</div>
        </div>
        <div class="meta">
          <div class="name" :title="item.filename">{{ item.filename }}</div>
          <div class="info-row">
            <span>{{ formatBytes(item.size) }}</span>
            <span v-if="item.width">{{ item.width }}×{{ item.height }}</span>
          </div>
        </div>
        <div class="card-act" @click.stop>
          <button title="复制链接" @click="copyUrl(item.url)"><Copy :size="13" /></button>
          <button title="删除" class="del" @click="onDelete(item)"><Trash2 :size="13" /></button>
        </div>
      </div>
    </div>

    <Pagination
      v-if="totalPages > 1"
      :current-page="page"
      :total-pages="totalPages"
      @change="
        p => {
          page = p
          load()
        }
      "
    />

    <!-- Preview -->
    <MediaPreview v-model="previewOpen" :items="files" :initial-index="previewIndex" height="85vh" />
  </div>
</template>

<style scoped lang="less">
.page {
  margin: auto;
  padding: 1.5rem 2rem;
  max-width: 75rem;
}

/* Header */
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: .75rem;
  margin-bottom: 1.5rem;
}
h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}
.sub {
  font-size: .8125rem;
  opacity: 0.4;
  display: block;
  margin-top: .125rem;
}
.head-act {
  display: flex;
  align-items: center;
  gap: .5rem;
}
.search-box {
  display: flex;
  align-items: center;
  gap: .375rem;
  padding: .3125rem .625rem;
  border-radius: .5rem;
  background: var(--color-base-200);
  border: .0625rem solid transparent;
  input {
    border: none;
    outline: none;
    background: transparent;
    font-size: .8125rem;
    width: 7.5rem;
    color: var(--color-base-content);
  }
  svg {
    opacity: 0.35;
    flex-shrink: 0;
  }
  &:focus-within {
    border-color: var(--color-base-300);
  }
}
.warn {
  color: var(--color-warning) !important;
}
.health-num {
  background: var(--color-warning);
  color: #fff;
  font-size: .625rem;
  padding: .0625rem .3125rem;
  border-radius: .5rem;
  margin-left: .125rem;
  font-weight: 600;
}

/* Upload */
.upload-area {
  margin-bottom: 1.25rem;
}
.uppy-wrap {
  border-radius: .75rem;
  overflow: hidden;
  border: .0625rem solid var(--color-border);
  :deep(.uppy-Root) {
    font-family: inherit;
  }
  :deep(.uppy-Dashboard-inner) {
    border: none;
    background: var(--color-base-100);
  }
  :deep(.uppy-Dashboard-AddFiles) {
    border-color: var(--color-border);
  }
  :deep(.uppy-Dashboard-browse) {
    color: var(--color-primary);
  }
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
  gap: .75rem;
}
.card {
  border-radius: .75rem;
  border: .0625rem solid var(--color-border);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.15s;
  background: var(--color-base-100);
  &:hover {
    box-shadow: 0 .125rem .75rem rgb(0 0 0 / 0.06);
  }
}
.thumb {
  aspect-ratio: 16/10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-base-200);
  overflow: hidden;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--placeholder);
    background-size: cover;
    background-position: center;
    filter: blur(1.25rem);
    transform: scale(1.1);
    transition: opacity 0.3s;
  }
  &.loaded::before {
    opacity: 0;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 1;
  }
  .file-type {
    font-size: .75rem;
    font-weight: 600;
    opacity: 0.25;
    position: relative;
    z-index: 1;
  }
}
.meta {
  padding: .625rem .75rem .375rem;
}
.name {
  font-size: .75rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info-row {
  display: flex;
  gap: .5rem;
  margin-top: .1875rem;
  font-size: .6875rem;
  opacity: 0.35;
}
.card-act {
  display: flex;
  gap: .125rem;
  padding: .25rem .625rem .625rem;
  opacity: 0;
  transition: opacity 0.1s;
  .card:hover & {
    opacity: 1;
  }
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    border-radius: .375rem;
    background: transparent;
    color: var(--color-base-content);
    opacity: 0.4;
    cursor: pointer;
    transition: all 0.1s;
    &:hover {
      opacity: 0.9;
      background: var(--color-base-200);
    }
    &.del:hover {
      color: var(--color-error);
    }
  }
}

.dim {
  text-align: center;
  padding: 5rem 0;
  font-size: .875rem;
  opacity: 0.35;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
