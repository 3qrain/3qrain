import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // "/api": "http://localhost:3010",
      '/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
        configure: proxy => {
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress || '127.0.0.1')
          })
        }
      },
      '/public/': 'http://localhost:3010'
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  }
})
