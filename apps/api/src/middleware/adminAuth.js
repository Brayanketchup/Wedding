import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { Admin } from '../models/Admin.js'

export const ADMIN_COOKIE = 'boda_admin_session'

export async function requireAdmin(req, res, next) {
  const token = req.cookies[ADMIN_COOKIE]
  if (!token) return res.status(401).json({ message: 'Authentication required.' })

  let payload
  try {
    payload = jwt.verify(token, config.jwtSecret, { issuer: 'boda-api', audience: 'boda-admin' })
  } catch {
    res.clearCookie(ADMIN_COOKIE, { path: '/' })
    return res.status(401).json({ message: 'Your session has expired.' })
  }

  try {
    const admin = await Admin.findById(payload.sub)
    if (!admin || !admin.active || admin.sessionVersion !== payload.sessionVersion) {
      res.clearCookie(ADMIN_COOKIE, { path: '/' })
      return res.status(401).json({ message: 'Your session has expired.' })
    }
    req.admin = admin
    next()
  } catch (error) {
    next(error)
  }
}

export function requirePasswordReady(req, res, next) {
  if (req.admin.mustChangePassword) {
    return res.status(403).json({
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'You must update your password before continuing.',
    })
  }
  next()
}
