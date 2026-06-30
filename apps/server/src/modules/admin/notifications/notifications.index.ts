import { createApp } from '~/lib/core/create-app'
import * as routes from './notifications.routes'
import * as handlers from './notifications.handlers'

const notificationsRouter = createApp()

notificationsRouter.openapi(routes.listRoute, handlers.list)
notificationsRouter.openapi(routes.unreadCountRoute, handlers.unreadCount)
notificationsRouter.openapi(routes.markReadRoute, handlers.markRead)
notificationsRouter.openapi(routes.markAllReadRoute, handlers.markAllRead)
notificationsRouter.openapi(routes.destroyRoute, handlers.destroy)
notificationsRouter.openapi(routes.clearReadRoute, handlers.clearRead)

export default notificationsRouter
