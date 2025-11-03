import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ZodError } from 'zod'

interface ValidationError {
  success: false
  error: ZodError
}

export const errorLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    let requestBody: unknown
    try {
      if (c.req.header('content-type')?.includes('application/json')) {
        const clonedReq = c.req.raw.clone()
        requestBody = await clonedReq.json()
      }
    } catch {}

    try {
      await next()
    } catch (err) {
      if (err && typeof err === 'object' && 'success' in err && !err.success) {
        const validationError = err as ValidationError
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ VALIDATION ERROR')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('Path:', c.req.path)
        console.error('Method:', c.req.method)
        console.error('Request Body:', JSON.stringify(requestBody, null, 2))
        console.error('Issues:', JSON.stringify(validationError.error.issues, null, 2))
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      }

      if (err instanceof HTTPException) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ HTTP EXCEPTION')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('Path:', c.req.path)
        console.error('Method:', c.req.method)
        console.error('Status:', err.status)
        console.error('Message:', err.message)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      }

      if (err instanceof Error && !(err instanceof HTTPException)) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ SERVER ERROR')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('Path:', c.req.path)
        console.error('Method:', c.req.method)
        console.error('Name:', err.name)
        console.error('Message:', err.message)
        console.error('Stack:', err.stack)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      }

      throw err
    }
  }
}
