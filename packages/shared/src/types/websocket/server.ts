import type { NotificationPayload } from './notification'

export interface WsConnected {
  type: 'connected'
}

export interface WsPong {
  type: 'pong'
}

export interface WsNotification {
  type: 'notification'
  data: NotificationPayload
}

export type WsServerMessage = WsConnected | WsPong | WsNotification
