import { Router } from 'express'
import { Invitation } from '../models/Invitation.js'
import { hashInvitationToken } from '../utils/tokens.js'

const router = Router()
const validToken = /^[A-Za-z0-9_-]{20,100}$/

async function findInvitation(token) {
  if (!validToken.test(token)) return null
  return Invitation.findOne({ tokenHash: hashInvitationToken(token), hiddenAt: null })
}

router.get('/:token', async (req, res, next) => {
  try {
    const invitation = await findInvitation(req.params.token)
    if (!invitation) return res.status(404).json({ message: 'This invitation is private or the link is invalid.' })

    return res.json({
      invitation: {
        name: invitation.name,
        decision: invitation.decision,
        respondedAt: invitation.respondedAt,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/:token/rsvp', async (req, res, next) => {
  try {
    const { decision } = req.body
    if (!['yes', 'no'].includes(decision)) {
      return res.status(400).json({ message: 'Please choose yes or no.' })
    }

    const invitation = await findInvitation(req.params.token)
    if (!invitation) return res.status(404).json({ message: 'This invitation is private or the link is invalid.' })

    invitation.decision = decision
    invitation.respondedAt = new Date()
    await invitation.save()

    return res.json({
      invitation: {
        name: invitation.name,
        decision: invitation.decision,
        respondedAt: invitation.respondedAt,
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
