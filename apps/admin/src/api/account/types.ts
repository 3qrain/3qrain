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
