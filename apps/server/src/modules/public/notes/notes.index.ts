import { createApp } from '~/lib/core/create-app'
import * as handlers from './notes.handlers'
import * as routes from './notes.routes'

const notesRouter = createApp()

notesRouter.openapi(routes.listNotesRoute, handlers.list)

export default notesRouter
