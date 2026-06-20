export interface StatusResult {
  initialized: boolean
  hasAdminUser: boolean
}

export interface SetupResult {
  recoveryKey: string
}

export interface SetupPayload {
  password: string
  confirmPassword: string
  email?: string
  nickname?: string
}
