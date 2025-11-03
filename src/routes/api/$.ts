import { app } from '@/server'
import { TrueDeps } from '@/server/server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: ({ request }) => app(TrueDeps).fetch(request),
      POST: ({ request }) => app(TrueDeps).fetch(request),
      PATCH: ({ request }) => app(TrueDeps).fetch(request),
      DELETE: ({ request }) => app(TrueDeps).fetch(request),
      PUT: ({ request }) => app(TrueDeps).fetch(request)
    }
  }
})
