import { createApp } from '~/lib/core/create-app'
import userRouter from './user/user.index'
import postsRouter from './posts/posts.index'
import notesRouter from './notes/notes.index'
import viewRouter from './view/view.index'

const publicRouter = createApp()

publicRouter.route('/', userRouter)
publicRouter.route('/', postsRouter)
publicRouter.route('/', notesRouter)
publicRouter.route('/', viewRouter)

export default publicRouter
