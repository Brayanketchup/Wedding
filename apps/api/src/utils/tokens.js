import crypto from 'node:crypto'

const tokenCipherVersion = 'v1'

function invitationEncryptionKey(secret) {
  return crypto.createHash('sha256').update(`boda-invitation-token:${secret}`).digest()
}

export function createInvitationToken() {
  return crypto.randomBytes(24).toString('base64url')
}

export function hashInvitationToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function encryptInvitationToken(token, secret) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', invitationEncryptionKey(secret), iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [tokenCipherVersion, iv.toString('base64url'), authTag.toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptInvitationToken(value, secret) {
  const [version, encodedIv, encodedAuthTag, encodedToken, ...extra] = String(value || '').split('.')
  if (version !== tokenCipherVersion || !encodedIv || !encodedAuthTag || !encodedToken || extra.length) {
    throw new Error('Invalid encrypted invitation token.')
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    invitationEncryptionKey(secret),
    Buffer.from(encodedIv, 'base64url'),
  )
  decipher.setAuthTag(Buffer.from(encodedAuthTag, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(encodedToken, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}
