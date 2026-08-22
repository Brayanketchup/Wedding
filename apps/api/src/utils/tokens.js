import crypto from 'node:crypto'

export function createInvitationToken() {
  return crypto.randomBytes(24).toString('base64url')
}

export function hashInvitationToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function safeTextEqual(first, second) {
  const a = Buffer.from(String(first))
  const b = Buffer.from(String(second))
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
