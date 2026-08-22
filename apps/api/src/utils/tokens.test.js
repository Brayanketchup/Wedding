import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createInvitationToken,
  decryptInvitationToken,
  encryptInvitationToken,
  hashInvitationToken,
} from './tokens.js'

const secret = 'a-test-secret-that-is-at-least-32-characters-long'

test('invitation tokens have sufficient randomness and stable hashes', () => {
  const first = createInvitationToken()
  const second = createInvitationToken()

  assert.match(first, /^[A-Za-z0-9_-]{32}$/)
  assert.notEqual(first, second)
  assert.equal(hashInvitationToken(first), hashInvitationToken(first))
  assert.notEqual(hashInvitationToken(first), hashInvitationToken(second))
})

test('invitation tokens can be encrypted for admins and decrypted later', () => {
  const token = createInvitationToken()
  const encrypted = encryptInvitationToken(token, secret)

  assert.notEqual(encrypted, token)
  assert.equal(decryptInvitationToken(encrypted, secret), token)
  assert.throws(() => decryptInvitationToken(encrypted, `${secret}-wrong`))
})
