<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{ src: string }>();

const canvas = ref<HTMLCanvasElement | null>(null);
const audio = ref<HTMLAudioElement | null>(null);
const playing = ref(false);
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let animId = 0;

const BAR_COUNT = 32;
const heights = new Float32Array(BAR_COUNT);
// 柱体上升时用 1.0 瞬间到位，确保音频信息准确
const RISE_SPEED = 1.0;
// 柱体下降时用 0.06 缓慢回落，减少音频降低时降低的柱体高度，避免柱体显示效果过抖
const FALL_SPEED = 0.06;

async function initContext() {
  if (audioCtx || !audio.value) return;
  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source = audioCtx.createMediaElementSource(audio.value);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function draw() {
  if (!canvas.value || !analyser) { animId = requestAnimationFrame(draw); return; }
  const ctx = canvas.value.getContext("2d")!;
  const w = canvas.value.width;
  const h = canvas.value.height;
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  ctx.clearRect(0, 0, w, h);
  const barW = (w / BAR_COUNT) * 0.7;
  const gap = (w / BAR_COUNT) * 0.3;

  for (let i = 0; i < BAR_COUNT; i++) {
    // 低频 60% 区间内均匀采样，避免高频无声柱子
    const bi = Math.floor((i / BAR_COUNT) * data.length * 0.6);
    const target = (data[bi] / 255) * h;
    const speed = target > heights[i] ? RISE_SPEED : FALL_SPEED;
    heights[i] += (target - heights[i]) * speed;
    const barH = Math.max(heights[i], 2);
    const x = i * (barW + gap);
    const y = h - barH;

    ctx.fillStyle = `hsl(${220 - i * 2}, 70%, ${50 + (heights[i] / h) * 30}%)`
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [2, 2, 0, 0]);
    ctx.fill();
  }
  animId = requestAnimationFrame(draw);
}

function onPlay() {
  playing.value = true;
  if (!audioCtx) initContext().then(draw);
  else { audioCtx.resume(); draw(); }
}

function onPause() {
  playing.value = false;
  cancelAnimationFrame(animId);
  // draw();
}

function setupCanvas() {
  if (!canvas.value) return;
  const { width, height } = canvas.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.value.width = width * dpr;
  canvas.value.height = height * dpr;
}

onMounted(setupCanvas);

onBeforeUnmount(() => {
  cancelAnimationFrame(animId);
  audioCtx?.close();
});
</script>

<template>
  <div class="player">
    <div class="viz">
      <canvas ref="canvas" class="canvas" />
    </div>
    <audio
      ref="audio"
      :src="src"
      controls
      class="audio"
      @play="onPlay"
      @pause="onPause"
      @ended="onPause"
    />
  </div>
</template>

<style scoped lang="less">
.player {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.viz {
  flex: 1;
}

.canvas {
  width: 100%;
  height: 100%;
}

.audio {
  width: 100%;
  height: 44px;
}
</style>
