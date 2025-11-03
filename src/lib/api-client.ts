import type { AppType } from '@/server'
import { AppError } from '@/server/error'
import { hc } from 'hono/client'
import { ContentfulStatusCode } from 'hono/utils/http-status'

export const client = hc<AppType>(import.meta.env.VITE_API_URL || 'http://localhost:5173', {
  async fetch(input: RequestInfo | URL, requestInit?: RequestInit): Promise<Response> {
    const response = await fetch(input, requestInit)

    if (!response.ok) {
      const error: AppError = {
        __tag: 'AppError',
        name: 'AppError',
        status: response.status as ContentfulStatusCode,
        message: (await response.json()).message
      }
      throw error
    }

    return response
  }
})
