import mongoose from 'mongoose'
import { config } from './config.js'

export async function connectDatabase() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not configured. Copy .env.example to .env and add your MongoDB Atlas URL.')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(config.mongodbUri)
  return mongoose.connection
}
