import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import invitationRoutes from './routes/invitations.js'
import adminRoutes from './routes/admin.js'

export const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({ origin: config.clientOrigin, credentials: true }))
app.use(express.json({ limit: '20kb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/invitations', invitationRoutes)
app.use('/api/admin', adminRoutes)

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found.' }))

if (config.isProduction) {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const webDist = path.resolve(here, '../../web/dist')
  app.use(express.static(webDist))
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    return res.sendFile(path.join(webDist, 'index.html'))
  })
}

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
})
