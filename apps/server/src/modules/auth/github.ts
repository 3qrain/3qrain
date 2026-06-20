import { githubAuth } from '@hono/oauth-providers/github'
import { eq } from 'drizzle-orm'
import { db, redis } from '~/db'
import { users } from '~/db/schema'
import { generateToken } from '~/utils/crypto'
import { SESSION_USER_PREFIX } from '~/constants/session'

const TOKEN_TTL = Number(process.env.TOKEN_TTL)
const WEB_URL = process.env.WEB_URL

export const githubMiddleware = githubAuth({ scope: ['read:user', 'user:email'], oauthApp: true })

export async function githubCallback(c: any) {
  const ghUser = c.get('user-github')
  if (!ghUser?.id) {
    return c.redirect(`${WEB_URL}?error=oauth_failed`)
  }

  const existing = db.select().from(users).where(eq(users.githubId, ghUser.id)).get()

  let userId: number
  if (existing) {
    db.update(users)
      .set({
        username: ghUser.login ?? existing.username,
        email: ghUser.email ?? existing.email,
        avatarUrl: ghUser.avatar_url ?? existing.avatarUrl,
      })
      .where(eq(users.id, existing.id))
      .run()
    userId = existing.id
  } else {
    const row = db
      .insert(users)
      .values({
        githubId: ghUser.id,
        username: ghUser.login ?? '',
        email: ghUser.email ?? '',
        avatarUrl: ghUser.avatar_url ?? '',
      })
      .returning()
      .get()
    userId = row.id
  }

  const token = generateToken()
  const session = JSON.stringify({
    role: 'user',
    userId,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  })
  await redis.setex(`${SESSION_USER_PREFIX}${token}`, TOKEN_TTL, session)

  c.header('set-cookie', `3qrain_user_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${TOKEN_TTL}`)

  return c.redirect(WEB_URL)
}
