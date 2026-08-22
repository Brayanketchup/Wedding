import { app } from '../apps/api/src/expressApp.js'
import { validateConfig } from '../apps/api/src/config.js'
import { connectDatabase } from '../apps/api/src/db.js'

let startupPromise

export default async function handler(req, res) {
  const missing = validateConfig()
  if (missing.length) {
    return res.status(500).json({ message: `Server configuration is incomplete: ${missing.join(', ')}` })
  }

  try {
    startupPromise ||= connectDatabase().catch((error) => {
      startupPromise = undefined
      throw error
    })
    await startupPromise
    return app(req, res)
  } catch (error) {
    console.error('Database connection failed:', error.message)
    return res.status(503).json({ message: 'The database is temporarily unavailable.' })
  }
}
