import { createApp } from '~/lib/core/create-app'
import * as handlers from './auth.handlers'
import * as routes from './auth.routes'
import { githubMiddleware, githubCallback } from './github'
import { googleMiddleware, googleCallback } from './google'

const authRouter = createApp()

authRouter.openapi(routes.statusRoute, handlers.status)
authRouter.openapi(routes.setupRoute, handlers.setup)
authRouter.openapi(routes.loginRoute, handlers.login)
authRouter.openapi(routes.recoverRoute, handlers.recover)

authRouter.use('/github', githubMiddleware)
authRouter.get('/github', githubCallback)

authRouter.use('/google', googleMiddleware)
authRouter.get('/google', googleCallback)

export default authRouter
