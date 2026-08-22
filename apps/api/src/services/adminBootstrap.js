import { config } from '../config.js'
import { Admin } from '../models/Admin.js'
import { hashPassword } from '../utils/passwords.js'

let bootstrapPromise

export function ensureBootstrapAdmin() {
  bootstrapPromise ||= (async () => {
    const existing = await Admin.exists({ email: config.adminEmail })
    if (existing) return

    const passwordHash = await hashPassword(config.adminPassword)
    try {
      await Admin.create({
        email: config.adminEmail,
        passwordHash,
        mustChangePassword: true,
      })
      console.log(`Created initial database admin for ${config.adminEmail}`)
    } catch (error) {
      if (error.code !== 11000) throw error
    }
  })().catch((error) => {
    bootstrapPromise = undefined
    throw error
  })

  return bootstrapPromise
}
