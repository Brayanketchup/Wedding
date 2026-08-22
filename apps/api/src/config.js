import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(here, '../../../.env') })

export const config = {
  port: Number(process.env.PORT || 4000),
  mongodbUri: process.env.MONGODB_URI || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  publicAppUrl: process.env.PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ''),
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || '',
  isProduction: process.env.NODE_ENV === 'production',
}

export function validateConfig() {
  const missing = []
  if (!config.mongodbUri) missing.push('MONGODB_URI')
  if (!config.adminEmail) missing.push('ADMIN_EMAIL')
  if (!config.adminPassword) missing.push('ADMIN_PASSWORD')
  if (config.jwtSecret.length < 32) missing.push('JWT_SECRET (at least 32 characters)')
  return missing
}
