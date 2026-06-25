import { createApp } from '~/lib/core/create-app'
import * as handlers from './site.handlers'
import * as routes from './site.routes'

const siteRouter = createApp()

siteRouter.openapi(routes.siteRoute, handlers.get)

export default siteRouter
