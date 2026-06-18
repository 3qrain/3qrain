<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import { ChevronLeft, ChevronRight, Copy, Loader, X } from '@lucide/vue'
import Button from '~/components/base/Button.vue'
import AudioPlayer from './AudioPlayer.vue'
import type { MediaItem } from '~/api/media'

const props = withDefaults(
  defineProps<{
    items: MediaItem[]
    modelValue: boolean
    initialIndex?: number
    height?: string
  }>(),
  { initialIndex: 0, height: '85vh' }
)

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const index = ref(0)
const showOriginal = ref(false)
const loadingOriginal = ref(false)
const stripRef = ref<HTMLElement | null>(null)

function scrollToThumb() {
  if (!stripRef.value) return
  const el = stripRef.value.children[index.value] as HTMLElement | undefined
  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}

function onStripWheel(e: WheelEvent) {
  if (!stripRef.value) return
  // 仅截获纵向为主的滚动（鼠标滚轮），触摸板横向滑动放行
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault()
    stripRef.value.scrollLeft += e.deltaY
  }
}

const current = computed(() => props.items[index.value] || null)
const hasPrev = computed(() => index.value > 0)
const hasNext = computed(() => index.value < props.items.length - 1)

watch(
  () => props.modelValue,
  v => {
    if (v) {
      index.value = props.initialIndex
      showOriginal.value = false
    }
  }
)

function close() {
  emit('update:modelValue', false)
}
function prev() {
  if (hasPrev.value) {
    index.value--
    showOriginal.value = false
  }
}
function next() {
  if (hasNext.value) {
    index.value++
    showOriginal.value = false
  }
}
function onKeydown(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}
function onCopy(url: string) {
  navigator.clipboard.writeText(url)
  toast.success('已复制')
}

watch(index, () => nextTick(scrollToThumb))

watch(
  () => props.modelValue,
  v => {
    if (v) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="overlay" @click="close">
        <div class="panel" :style="{ height }" @click.stop>
          <!-- Head -->
          <div class="head">
            <span class="head-name">{{ current?.filename }}</span>
            <div class="head-right">
              <span class="head-dim" v-if="current.width && current.height">
                {{ current.width }}×{{ current.height }}
              </span>
              <Button variant="ghost" size="sm" @click="onCopy(current?.url || '')"><Copy style="width: .875rem; height: .875rem;" /> 复制</Button>
              <Button
                v-if="current.type === 'image'"
                variant="ghost"
                size="sm"
                @click="
                  () => {
                    showOriginal = !showOriginal
                    if (showOriginal) loadingOriginal = true
                  }
                "
              >
                {{ showOriginal ? '预览' : '原图' }}
              </Button>
              <Button variant="ghost" :icon="true" @click="close"><X style="width: 1rem; height: 1rem;" /></Button>
            </div>
          </div>

          <!-- Body -->
          <div class="body">
            <!-- Nav arrows -->
            <button
              v-if="hasPrev"
              :class="{ nav: true, 'nav-left': true, 'nav-video': ['video', 'audio'].includes(current.type) }"
              @click="prev"
            >
              <ChevronLeft :size="24" />
            </button>
            <button
              v-if="hasNext"
              :class="{ nav: true, 'nav-right': true, 'nav-video': ['video', 'audio'].includes(current.type) }"
              @click="next"
            >
              <ChevronRight :size="24" />
            </button>

            <div class="stage" v-if="current" :key="current.id">
              <template v-if="current.type === 'image'">
                <img v-if="current.placeholder" :src="current.placeholder" class="layer placeholder" />
                <img v-if="current.thumbnailUrl" :src="current.thumbnailUrl" class="layer thumb" />
                <img v-if="current.previewUrl" :src="current.previewUrl" class="layer preview" />
                <img
                  v-if="showOriginal"
                  :src="current.url"
                  class="layer original"
                  @load="loadingOriginal = false"
                  @error="loadingOriginal = false"
                />
                <div v-if="showOriginal && loadingOriginal" class="layer loader">
                  <Loader :size="24" class="spin" />
                </div>
              </template>
              <template v-else-if="current.type === 'svg'">
                <img :src="current.url" alt="" class="layer" />
              </template>
              <template v-else-if="current.type === 'video'">
                <video :src="current.url" controls class="layer" />
              </template>
              <template v-else-if="current.type === 'audio'">
                <AudioPlayer :src="current.url" class="layer" />
              </template>
            </div>
          </div>

          <!-- Thumbnail strip -->
          <div ref="stripRef" class="strip" v-if="items.length > 1" @wheel="onStripWheel">
            <div
              v-for="(item, i) in items"
              :key="item.id"
              :class="['strip-item', { on: i === index }]"
              @click="
                () => {
                  index = i
                  showOriginal = false
                }
              "
            >
              <img
                v-if="item.type === 'image' && item.thumbnailUrl"
                :src="item.thumbnailUrl"
                :alt="item.filename"
                loading="lazy"
              />
              <img v-else-if="item.type === 'svg'" :src="item.url" :alt="item.filename" loading="lazy" />
              <div v-else class="strip-placeholder">
                {{ item.type }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="less">
.overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 0.75);
  padding: 2rem;
  overscroll-behavior: contain;
}
.panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 56.25rem;
  border-radius: .625rem .625rem 0 0;
  background: var(--color-base-100);
  overflow: hidden;
}

/* Head */
.head {
  display: flex;
  align-items: center;
  gap: .625rem;
  padding: .625rem 1rem;
  background: var(--color-base-100);
  font-size: .8125rem;
  flex-shrink: 0;
}
.head-name {
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.head-right {
  display: flex;
  align-items: center;
  gap: .125rem;
  flex-shrink: 0;
}
.head-dim {
  margin-right: .5rem;
  opacity: 0.4;
  font-size: .75rem;
  white-space: nowrap;
}
.close-btn {
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
  &:hover {
    opacity: 0.8;
    background: var(--color-base-200);
  }
}

/* Body */
.body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-base-200);
  position: relative;
  overflow: hidden;
}
.stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  &.placeholder {
    filter: blur(1.25rem) brightness(0.85);
    z-index: 0;
  }
  &.thumb {
    z-index: 1;
  }
  &.preview {
    z-index: 2;
  }
  &.original {
    z-index: 3;
  }

  &.loader {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-base-content);
    opacity: 0.5;
    z-index: 5;
  }
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Nav */
.nav {
  position: absolute;
  z-index: 4;
  top: 0;
  width: 45%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.nav-left {
  left: 0rem;
}
.nav-right {
  right: 0rem;
}
.nav-video {
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: .5rem;
  background: var(--color-base-100);
  color: var(--color-base-content);
  box-shadow: 0 0 .375rem .0625rem var(--color-border);
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  &:hover {
    opacity: 0.6;
  }
}
.nav-left.nav-video {
  left: .5rem;
}
.nav-right.nav-video {
  right: .5rem;
}

/* Thumbnail strip */
.strip {
  display: flex;
  gap: .375rem;
  padding: .625rem 1rem;
  overflow-x: auto;
  // 避免触控板滚到头时滚动事件向上传递触发页面路由跳转
  overscroll-behavior-x: contain;
  background: var(--color-base-100);
  border-radius: 0 0 .625rem .625rem;
  flex-shrink: 0;
}
.strip-item {
  width: 3rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: .375rem;
  overflow: hidden;
  border: .125rem solid transparent;
  cursor: pointer;
  transition: border-color 0.15s;
  background: var(--color-base-200);
  user-select: none;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    -webkit-user-drag: none;
  }
  &.on {
    border-color: var(--color-primary);
  }
}
.strip-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-base-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .75rem;
  font-weight: 600;
  opacity: 0.25;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
