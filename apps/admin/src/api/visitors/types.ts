export interface Visitor {
  id: number
  username: string
  email: string
  avatarUrl: string
  role: 'system' | 'admin' | 'visitor'
  isBanned: boolean
  provider: string
  createdAt: number
}
