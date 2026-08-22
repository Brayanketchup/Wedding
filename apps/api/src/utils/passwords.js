import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)
const KEY_LENGTH = 64
const COST = 32768
const BLOCK_SIZE = 8
const PARALLELIZATION = 1
const MAX_MEMORY = 64 * 1024 * 1024

export function validateNewPassword(password) {
  if (typeof password !== 'string' || password.length < 12) {
    return 'Password must contain at least 12 characters.'
  }
  if (password.length > 128) return 'Password cannot exceed 128 characters.'
  return null
}

async function deriveKey(password, salt, cost = COST, blockSize = BLOCK_SIZE, parallelization = PARALLELIZATION) {
  return scrypt(password, salt, KEY_LENGTH, {
    cost,
    blockSize,
    parallelization,
    maxmem: MAX_MEMORY,
  })
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const derivedKey = await deriveKey(String(password), salt)
  return ['scrypt', COST, BLOCK_SIZE, PARALLELIZATION, salt.toString('base64url'), derivedKey.toString('base64url')].join('$')
}

export async function verifyPassword(password, storedHash) {
  try {
    const [algorithm, costValue, blockSizeValue, parallelizationValue, saltValue, hashValue] = String(storedHash).split('$')
    if (algorithm !== 'scrypt' || !saltValue || !hashValue) return false

    const expected = Buffer.from(hashValue, 'base64url')
    const actual = await deriveKey(
      String(password),
      Buffer.from(saltValue, 'base64url'),
      Number(costValue),
      Number(blockSizeValue),
      Number(parallelizationValue),
    )
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}
