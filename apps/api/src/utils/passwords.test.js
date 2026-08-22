import assert from 'node:assert/strict'
import test from 'node:test'
import { hashPassword, validateNewPassword, verifyPassword } from './passwords.js'

test('password hashes are salted and verifiable', async () => {
  const password = 'a-secure-test-password'
  const first = await hashPassword(password)
  const second = await hashPassword(password)

  assert.notEqual(first, second)
  assert.equal(first.includes(password), false)
  assert.equal(await verifyPassword(password, first), true)
  assert.equal(await verifyPassword('incorrect-password', first), false)
})

test('new passwords must satisfy the length policy', () => {
  assert.equal(validateNewPassword('too-short'), 'Password must contain at least 12 characters.')
  assert.equal(validateNewPassword('long-enough-password'), null)
  assert.equal(validateNewPassword('x'.repeat(129)), 'Password cannot exceed 128 characters.')
})
