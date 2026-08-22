import { Router } from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { config } from '../config.js'
import { ADMIN_COOKIE, requireAdmin } from '../middleware/adminAuth.js'
import { Invitation } from '../models/Invitation.js'
import { createInvitationToken, hashInvitationToken, safeTextEqual } from '../utils/tokens.js'

const router = Router()
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false })

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
}

router.post('/login', loginLimiter, (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const authenticated = safeTextEqual(email, config.adminEmail) && safeTextEqual(password, config.adminPassword)

  if (!authenticated) return res.status(401).json({ message: 'Incorrect email or password.' })

  const token = jwt.sign({ email }, config.jwtSecret, {
    expiresIn: '8h',
    issuer: 'boda-api',
    audience: 'boda-admin',
  })
  res.cookie(ADMIN_COOKIE, token, cookieOptions)
  return res.json({ admin: { email } })
})

router.post('/logout', (_req, res) => {
  res.clearCookie(ADMIN_COOKIE, { ...cookieOptions, maxAge: undefined })
  return res.status(204).end()
})

router.get('/session', requireAdmin, (req, res) => {
  res.json({ admin: { email: req.admin.email } })
})

router.get('/invitations', requireAdmin, async (_req, res, next) => {
  try {
    const [invitations, grouped] = await Promise.all([
      Invitation.find().sort({ respondedAt: -1, createdAt: -1 }).lean(),
      Invitation.aggregate([{ $group: { _id: '$decision', count: { $sum: 1 } } }]),
    ])

    const counts = Object.fromEntries(grouped.map((item) => [item._id, item.count]))
    return res.json({
      stats: {
        total: invitations.length,
        yes: counts.yes || 0,
        no: counts.no || 0,
        pending: counts.pending || 0,
      },
      invitations: invitations.map(({ _id, name, tokenPreview, decision, respondedAt, createdAt }) => ({
        id: _id,
        name,
        tokenPreview,
        decision,
        respondedAt,
        createdAt,
      })),
    })
  } catch (error) {
    next(error)
  }
})

router.post('/invitations', requireAdmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim()
    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ message: 'Enter a guest name between 2 and 120 characters.' })
    }

    const token = createInvitationToken()
    const invitation = await Invitation.create({
      name,
      tokenHash: hashInvitationToken(token),
      tokenPreview: `${token.slice(0, 5)}…${token.slice(-4)}`,
    })

    return res.status(201).json({
      invitation: {
        id: invitation.id,
        name: invitation.name,
        decision: invitation.decision,
        createdAt: invitation.createdAt,
      },
      url: `${config.publicAppUrl.replace(/\/$/, '')}/invite/${token}`,
    })
  } catch (error) {
    next(error)
  }
})

export default router
