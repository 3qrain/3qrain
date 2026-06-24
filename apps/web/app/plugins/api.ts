export default defineNuxtPlugin(nuxtApp => {
  const api = $fetch.create({
    baseURL: '/api',
    onRequest({ request, options, error }) {},
    async onResponseError({ response }) {}
  })

  return {
    provide: {
        api
    }
  }
})
