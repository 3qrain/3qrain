import { createApp } from '~/lib/core/create-app'
import { serveStatic } from 'hono/bun'
import { errorHandler } from '~/middleware/error-handler'
import authRouter from '~/modules/auth/auth.index'
import adminRouter from '~/modules/admin/admin.index'
import publicRouter from '~/modules/public/public.index'
import { cron_cleanUpExpiredUploads } from '~/modules/admin/upload/tus'

const app = createApp()

app.onError(errorHandler)

app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: { title: '3qrain Admin API', version: '1.0.0' }
})

app.use(
  '/storage/*',
  serveStatic({
    root: './data/uploads',
    rewriteRequestPath: path => path.replace(/^\/storage/, '')
  })
)

app.route('/api', publicRouter)
app.route('/api/auth', authRouter)
app.route('/api/admin', adminRouter)

cron_cleanUpExpiredUploads()

export default app
