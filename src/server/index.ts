import type { MiddlewareHandler } from 'hono'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { AppError } from './error'
import { errorLogger } from './middleware/error-logger'
import { noteRoutes, patientRoutes } from './modules'
import type { AppVariables } from './types'

export const app = (depsMiddleware: MiddlewareHandler<{ Variables: AppVariables }>) =>
  new Hono<{ Variables: AppVariables }>()
    .use(depsMiddleware)
    .use('*', logger())
    .use('*', errorLogger())
    .use('*', cors())
    .use('*', prettyJSON())
    .get('/', (c) => {
      return c.json({ message: 'Tony Scribe API', ok: true }, 200)
    })
    .route('/api/patients', patientRoutes)
    .route('/api/notes', noteRoutes)
    .notFound((c) => {
      return c.json({ message: 'Not Found', ok: false }, 404)
    })
    .onError((err, c) => {
      if (err instanceof AppError) {
        return c.json({ message: err.message }, err.status)
      }
      console.error(`Server Error: ${err}`, err)
      return c.json({ message: 'Internal Server Error' }, 500)
    })

export type AppType = ReturnType<typeof app>
