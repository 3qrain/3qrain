export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface AdminProfile {
  id: number
  username: string
  email: string
  avatarUrl: string
}

export interface AdminSession {
  token: string
  loginIp: string
  userAgent: string
  createdAt: number
  lastActiveAt: number
  isCurrent: boolean
}
