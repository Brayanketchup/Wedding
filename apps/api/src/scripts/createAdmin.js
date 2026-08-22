import crypto from 'node:crypto'
import { config } from '../config.js'
import { connectDatabase } from '../db.js'
import { Admin } from '../models/Admin.js'
import { hashPassword } from '../utils/passwords.js'

const email = String(process.argv[2] || '').trim().toLowerCase()

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Provide an email address. Example: npm run admin:create -- admin@example.com')
  process.exit(1)
}

if (!config.mongodbUri) {
  console.error('MONGODB_URI is missing. Configure the root .env file first.')
  process.exit(1)
}

try {
  await connectDatabase()
  if (await Admin.exists({ email })) {
    console.error('An administrator with that email already exists.')
    process.exit(1)
  }

  const temporaryPassword = crypto.randomBytes(18).toString('base64url')
  await Admin.create({
    email,
    passwordHash: await hashPassword(temporaryPassword),
    mustChangePassword: true,
  })

  console.log(`Administrator: ${email}`)
  console.log(`Temporary password: ${temporaryPassword}`)
  console.log('Share this password securely. It will not be shown again, and the administrator must replace it at first login.')
  process.exit(0)
} catch (error) {
  console.error(`Could not create administrator: ${error.message}`)
  process.exit(1)
}
