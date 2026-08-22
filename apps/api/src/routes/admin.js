import { Router } from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { config } from '../config.js'
import { ADMIN_COOKIE, requireAdmin, requirePasswordReady } from '../middleware/adminAuth.js'
import { Admin } from '../models/Admin.js'
import { Invitation } from '../models/Invitation.js'
import { createInvitationToken, hashInvitationToken } from '../utils/tokens.js'
import { hashPassword, validateNewPassword, verifyPassword } from '../utils/passwords.js'

const router = Router()
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false })

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
}

function publicAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    mustChangePassword: admin.mustChangePassword,
  }
}

function issueSession(res, admin) {
  const token = jwt.sign({ sessionVersion: admin.sessionVersion }, config.jwtSecret, {
    subject: admin.id,
    expiresIn: '8h',
    issuer: 'boda-api',
    audience: 'boda-admin',
  })
  res.cookie(ADMIN_COOKIE, token, cookieOptions)
}

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const admin = await Admin.findOne({ email, active: true }).select('+passwordHash')

    if (!admin) {
      await hashPassword('invalid-login-password')
      return res.status(401).json({ message: 'Incorrect email or password.' })
    }

    const authenticated = await verifyPassword(password, admin.passwordHash)
    if (!authenticated) return res.status(401).json({ message: 'Incorrect email or password.' })

    issueSession(res, admin)
    return res.json({ admin: publicAdmin(admin) })
  } catch (error) {
    next(error)
  }
})

router.post('/password', requireAdmin, async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '')
    const newPassword = String(req.body.newPassword || '')
    const validationError = validateNewPassword(newPassword)
    if (validationError) return res.status(400).json({ message: validationError })

    const admin = await Admin.findById(req.admin.id).select('+passwordHash')
    const currentMatches = admin && await verifyPassword(currentPassword, admin.passwordHash)
    if (!currentMatches) return res.status(401).json({ message: 'Your current password is incorrect.' })
    if (await verifyPassword(newPassword, admin.passwordHash)) {
      return res.status(400).json({ message: 'Your new password must be different from the current password.' })
    }

    admin.passwordHash = await hashPassword(newPassword)
    admin.mustChangePassword = false
    admin.passwordChangedAt = new Date()
    admin.sessionVersion = Number(admin.sessionVersion || 0) + 1
    await admin.save()

    issueSession(res, admin)
    return res.json({ admin: publicAdmin(admin) })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', (_req, res) => {
  res.clearCookie(ADMIN_COOKIE, { ...cookieOptions, maxAge: undefined })
  return res.status(204).end()
})

router.get('/session', requireAdmin, (req, res) => {
  res.json({ admin: publicAdmin(req.admin) })
})

router.get('/invitations', requireAdmin, requirePasswordReady, async (_req, res, next) => {
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

router.post('/invitations', requireAdmin, requirePasswordReady, async (req, res, next) => {
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
      url: `${(config.publicAppUrl || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')}/invite/${token}`,
    })
  } catch (error) {
    next(error)
  }
})

export default router
