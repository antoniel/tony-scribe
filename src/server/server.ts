import type { AppVariables } from '@/server/types'
import { createMiddleware } from 'hono/factory'
import { db } from './database'

export const TrueDeps = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  c.set('db', db)
  await next()
})
