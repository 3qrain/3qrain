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
  async (c, next) => {
    if (!process.env.ALLOWED_ORIGINS) {
      throw new Error('ALLOWED_ORIGINS is not defined')
    }
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
    const referer = c.req.header('referer')
    
    if (!referer) return await next()
    const ok = allowedOrigins.some(origin => referer.startsWith(origin))
    if (!ok) {
      return c.text('Forbidden', 403)
    }
    await next()
  },
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
