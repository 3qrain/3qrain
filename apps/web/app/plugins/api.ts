export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: '/api',
    async onResponseError({ response }) {
      const data = response._data
      if (data?.message) throw new Error(data.message)
      throw new Error('服务异常')
    },
  })

  return { provide: { api } }
})
