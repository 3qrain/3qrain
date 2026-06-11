import { createApp } from '~/lib/core/create-app'
import { serveStatic } from 'hono/bun'
import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";

import { errorHandler } from '~/middleware/error-handler'
import authRouter from '~/modules/auth/auth.index'
import adminRouter from '~/modules/admin/admin.index'
import publicRouter from '~/modules/public/public.index'

const app = createApp()
const TUS_PATH = '/api/upload'
const tusServer = new Server({
  path: TUS_PATH,
  // tus上传产生的切片等文件单独放tus，最后合并完放uploads(对外开发文件夹)
  datastore: new FileStore({ directory: "./data/tus" }),
});

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

// tus上传服务
app.all(`${TUS_PATH}/*`, async (c) => {
  console.log(
    c.req.method,
    c.req.path
  )
  return tusServer.handleWeb(c.req.raw)
})

export default app
