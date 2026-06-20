import { createApp } from '~/lib/core/create-app'
import * as handlers from './visitors.handlers'
import * as routes from './visitors.routes'

const visitorsRouter = createApp()

visitorsRouter.openapi(routes.listVisitorsRoute, handlers.list)
visitorsRouter.openapi(routes.updateVisitorRoute, handlers.update)

export default visitorsRouter
