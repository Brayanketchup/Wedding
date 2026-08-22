import mongoose from 'mongoose'

const invitationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    tokenHash: { type: String, required: true, unique: true, index: true, select: false },
    tokenPreview: { type: String, required: true },
    tokenCiphertext: { type: String, default: null, select: false },
    decision: { type: String, enum: ['pending', 'yes', 'no'], default: 'pending', index: true },
    respondedAt: { type: Date, default: null },
    hiddenAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
)

export const Invitation = mongoose.model('Invitation', invitationSchema)
