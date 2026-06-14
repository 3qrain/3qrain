<script setup lang="ts">
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import ImageEditor from '@uppy/image-editor';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import '@uppy/image-editor/css/style.min.css';
import { onMounted } from 'vue';

onMounted(() => {
new Uppy().use(Dashboard, { inline: true, target: '#uppy-dashboard' }).use(ImageEditor);

})
</script>

<template>
  <div class="page">
    <h1>媒体库</h1>
    <p class="dim">文件管理功能即将开放</p>
    <div id="uppy-dashboard"></div>
  </div>
</template>

<style scoped lang="less">
.page { padding: 32px; }
h1 { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
.dim { font-size: 13px; opacity: 0.4; margin: 0; }
</style>
