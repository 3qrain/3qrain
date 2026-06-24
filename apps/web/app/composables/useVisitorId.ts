let cached: string | null = null

export function useVisitorId() {
  if (cached) return cached

  if (import.meta.server) return ''

  cached = localStorage.getItem('3qrain:visitor_id')
  if (!cached) {
    cached = crypto.randomUUID()
    localStorage.setItem('3qrain:visitor_id', cached)
  }
  return cached
}
