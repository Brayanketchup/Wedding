import { app } from './app.js'
import { config, validateConfig } from './config.js'
import { connectDatabase } from './db.js'

const missing = validateConfig()
if (missing.length) {
  console.error(`Missing configuration: ${missing.join(', ')}`)
  process.exit(1)
}

try {
  await connectDatabase()
  app.listen(config.port, () => {
    console.log(`Boda API listening on http://localhost:${config.port}`)
  })
} catch (error) {
  console.error(`Could not start the API: ${error.message}`)
  process.exit(1)
}
