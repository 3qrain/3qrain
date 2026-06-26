import { createApp } from '~/lib/core/create-app'
import * as handlers from './comments.handlers'
import * as routes from './comments.routes'

const commentsRouter = createApp()

commentsRouter.openapi(routes.listCommentsRoute, handlers.list)
commentsRouter.openapi(routes.createCommentRoute, handlers.create)

export default commentsRouter
