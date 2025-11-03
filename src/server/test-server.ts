import { env } from '@/env'
import { serve } from '@hono/node-server'
import { app } from './index'
import { fakeDeps, getFakeDb } from './tests/utils'

const startTestServer = async () => {
  const fakeDb = await getFakeDb()

  const testDeps = fakeDeps(fakeDb)

  const PORT = env.PORT ?? 9000

  serve({
    fetch: app(testDeps).fetch,
    port: PORT
  })

  console.log(` ✅ Test server starting on port ${PORT}...`)
  console.log(` 📊 Using fake database for testing`)
}

startTestServer().catch(console.error)
