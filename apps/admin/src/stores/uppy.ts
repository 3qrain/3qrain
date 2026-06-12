import { ref } from 'vue'
import { defineStore } from 'pinia'
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import ImageEditor from '@uppy/image-editor'
import ScreenCapture from '@uppy/screen-capture'
import Tus from '@uppy/tus';

export const useUppyStore = defineStore('uppy', () => {
  // ScreenCapture 需要安全上下文（HTTPS/localhost）。
  // 使用局域网 HTTP 地址访问时会报："Screen recorder access not supported"
  const uppy = new Uppy().use(ImageEditor).use(ScreenCapture).use(Tus, { endpoint: '/api/admin/upload/' });
  const uploading = ref(false)

  function mountDashboard(target: string | HTMLElement, theme: 'light' | 'dark' | 'auto' = 'auto') {
    const existing = uppy.getPlugin('Dashboard')
    if (existing) uppy.removePlugin(existing)
    uppy.use(Dashboard, { inline: true, target, theme })
  }

  uppy.on('upload', () => {
    uploading.value = true
  })
  uppy.on

  return { uppy, mountDashboard }
})
