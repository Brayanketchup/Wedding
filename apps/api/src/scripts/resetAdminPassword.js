import crypto from 'node:crypto'
import { config } from '../config.js'
import { connectDatabase } from '../db.js'
import { Admin } from '../models/Admin.js'
import { hashPassword } from '../utils/passwords.js'

const email = String(process.argv[2] || '').trim().toLowerCase()

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Provide an email address. Example: npm run admin:reset -- admin@example.com')
  process.exit(1)
}

if (!config.mongodbUri) {
  console.error('MONGODB_URI is missing. Configure the root .env file first.')
  process.exit(1)
}

try {
  await connectDatabase()
  const admin = await Admin.findOne({ email }).select('+passwordHash')
  if (!admin) {
    console.error('No administrator exists with that email.')
    process.exit(1)
  }

  const temporaryPassword = crypto.randomBytes(18).toString('base64url')
  admin.passwordHash = await hashPassword(temporaryPassword)
  admin.mustChangePassword = true
  admin.passwordChangedAt = new Date()
  admin.sessionVersion = Number(admin.sessionVersion || 0) + 1
  await admin.save()

  console.log(`Administrator: ${email}`)
  console.log(`Temporary password: ${temporaryPassword}`)
  console.log('All previous sessions are invalid. The administrator must replace this password at the next login.')
  process.exit(0)
} catch (error) {
  console.error(`Could not reset administrator: ${error.message}`)
  process.exit(1)
}
