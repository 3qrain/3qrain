export const useAPI = createUseFetch({
  baseURL: '/api',
  onRequest({ options }) {},
  async onResponseError({ response }) {}
})
