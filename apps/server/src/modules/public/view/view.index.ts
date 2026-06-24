import { createApp } from '~/lib/core/create-app'
import * as handlers from './view.handlers'
import * as routes from './view.routes'

const viewRouter = createApp()

viewRouter.openapi(routes.recordViewRoute, handlers.record)
viewRouter.openapi(routes.countViewRoute, handlers.count)

export default viewRouter
