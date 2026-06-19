// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  nitro: {
    devProxy: {
      '/api': 'http://localhost:3010',
      '/storage/': 'http://localhost:3010'
    },
  },
  vite: {
    server: {
      proxy: {
        '/api': 'http://localhost:3010',
        '/storage/': 'http://localhost:3010'
      }
    }
  }
})