import mongoose from 'mongoose'
import { config } from './config.js'

let connectionPromise

export async function connectDatabase() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not configured. Copy .env.example to .env and add your MongoDB Atlas URL.')
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection

  mongoose.set('strictQuery', true)
  connectionPromise ||= mongoose.connect(config.mongodbUri).catch((error) => {
    connectionPromise = undefined
    throw error
  })
  await connectionPromise
  return mongoose.connection
}
