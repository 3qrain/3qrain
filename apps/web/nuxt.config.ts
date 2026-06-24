// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  nitro: {
    // csr ssr下都生效
    routeRules: {
      '/api/**': { proxy: 'http://localhost:3010/api/**' },
      '/storage/**': { proxy: 'http://localhost:3010/storage/**' },
    }
  },
})