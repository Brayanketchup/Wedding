import { config } from '../config.js'
import { connectDatabase } from '../db.js'
import { Invitation } from '../models/Invitation.js'
import { createInvitationToken, hashInvitationToken } from '../utils/tokens.js'

const names = process.argv.slice(2).map((name) => name.trim()).filter(Boolean)

if (!names.length) {
  console.error('Add one or more guest names. Example: npm run seed -- "Lucía Torres" "Mateo Díaz"')
  process.exit(1)
}

if (!config.mongodbUri) {
  console.error('MONGODB_URI is missing. Copy .env.example to .env first.')
  process.exit(1)
}

try {
  await connectDatabase()

  for (const name of names) {
    const token = createInvitationToken()
    await Invitation.create({
      name,
      tokenHash: hashInvitationToken(token),
      tokenPreview: `${token.slice(0, 5)}…${token.slice(-4)}`,
    })
    console.log(`${name}: ${config.publicAppUrl}/invite/${token}`)
  }

  process.exit(0)
} catch (error) {
  console.error(`Could not create invitations: ${error.message}`)
  process.exit(1)
}
