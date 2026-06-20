export interface Visitor {
  id: number
  username: string
  email: string
  avatarUrl: string
  isAdmin: boolean
  isBanned: boolean
  provider: string
  createdAt: number
}
