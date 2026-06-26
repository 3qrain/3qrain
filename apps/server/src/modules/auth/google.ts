import { googleAuth } from '@hono/oauth-providers/google'
import { eq } from 'drizzle-orm'
import { db, redis } from '~/db'
import { users } from '~/db/schema'
import { generateToken } from '~/utils/crypto'
import { SESSION_USER_PREFIX } from '~/constants/session'

const TOKEN_TTL = Number(process.env.TOKEN_TTL)
const WEB_URL = process.env.WEB_URL

export const googleMiddleware = googleAuth({
  scope: ['openid', 'profile', 'email'],
  redirect_uri: `${WEB_URL}/api/auth/google`,
})

export async function googleCallback(c: any) {
  const gUser = c.get('user-google')
  if (!gUser?.id) {
    return c.redirect(`${WEB_URL}?error=oauth_failed`)
  }

  const googleId = String(gUser.id)
  const existing = db.select().from(users).where(eq(users.googleId, googleId)).get()

  let userId: number
  if (existing) {
    db.update(users)
      .set({
        username: gUser.name ?? existing.username,
        avatarUrl: gUser.picture ?? existing.avatarUrl,
      })
      .where(eq(users.id, existing.id))
      .run()
    userId = existing.id
  } else {
    const row = db
      .insert(users)
      .values({
        googleId,
        username: gUser.name ?? '',
        email: gUser.email ?? '',
        avatarUrl: gUser.picture ?? '',
      })
      .returning()
      .get()
    userId = row.id
  }

  const role = db.select({ role: users.role }).from(users).where(eq(users.id, userId)).get()!.role

  const token = generateToken()
  const session = JSON.stringify({
    role,
    userId,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  })
  await redis.setex(`${SESSION_USER_PREFIX}${token}`, TOKEN_TTL, session)

  c.header('set-cookie', `3qrain_user_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${TOKEN_TTL}`)

  return c.redirect(WEB_URL!)
}
