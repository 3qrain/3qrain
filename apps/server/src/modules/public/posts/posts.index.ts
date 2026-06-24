import { createApp } from '~/lib/core/create-app'
import * as handlers from './posts.handlers'
import * as routes from './posts.routes'

const postsRouter = createApp()

postsRouter.openapi(routes.listPostsRoute, handlers.list)
postsRouter.openapi(routes.getPostRoute, handlers.detail)

export default postsRouter
