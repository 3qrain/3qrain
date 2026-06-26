import { createApp } from '~/lib/core/create-app'
import * as handlers from './notes.handlers'
import * as routes from './notes.routes'

const notesRouter = createApp()

notesRouter.openapi(routes.listNotesRoute, handlers.list)
notesRouter.openapi(routes.createNoteRoute, handlers.create)
notesRouter.openapi(routes.updateNoteRoute, handlers.update)
notesRouter.openapi(routes.restoreNoteRoute, handlers.restore)
notesRouter.openapi(routes.destroyNoteRoute, handlers.destroy)
notesRouter.openapi(routes.deleteNoteRoute, handlers.remove)
notesRouter.openapi(routes.emptyTrashRoute, handlers.emptyTrash)

export default notesRouter
