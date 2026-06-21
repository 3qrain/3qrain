import { createApp } from '~/lib/core/create-app'
import * as handlers from './notes.handlers'
import * as routes from './notes.routes'

const notesRouter = createApp()

notesRouter.openapi(routes.listNotesRoute, handlers.list)
notesRouter.openapi(routes.createNoteRoute, handlers.create)
notesRouter.openapi(routes.updateNoteRoute, handlers.update)
notesRouter.openapi(routes.deleteNoteRoute, handlers.remove)

export default notesRouter
