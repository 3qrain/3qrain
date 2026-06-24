import { createApp } from '~/lib/core/create-app'
import * as handlers from './user.handlers'
import * as routes from './user.routes'

const userRouter = createApp()

userRouter.openapi(routes.meRoute, handlers.me)
userRouter.openapi(routes.updateMeRoute, handlers.updateMe)
userRouter.openapi(routes.logoutRoute, handlers.logout)

export default userRouter
