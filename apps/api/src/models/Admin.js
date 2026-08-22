import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    mustChangePassword: { type: Boolean, default: true },
    passwordChangedAt: { type: Date, default: null },
    sessionVersion: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Admin = mongoose.model('Admin', adminSchema)
