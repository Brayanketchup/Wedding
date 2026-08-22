import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export const ADMIN_COOKIE = 'boda_admin_session'

export function requireAdmin(req, res, next) {
  const token = req.cookies[ADMIN_COOKIE]
  if (!token) return res.status(401).json({ message: 'Authentication required.' })

  try {
    req.admin = jwt.verify(token, config.jwtSecret, { issuer: 'boda-api', audience: 'boda-admin' })
    next()
  } catch {
    res.clearCookie(ADMIN_COOKIE)
    return res.status(401).json({ message: 'Your session has expired.' })
  }
}
