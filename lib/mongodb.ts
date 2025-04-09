import mongoose from "mongoose"

// Get MongoDB URI from environment variable or use a hardcoded fallback for development
// This is not ideal for production, but helps with development
const MONGODB_URI = process.env.MONGODB_URI! 

console.log('MongoDB URI available:', !!MONGODB_URI)

// Define the global mongoose type
declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Mongoose> | null } | undefined
}

// Define the connection cache interface
interface ConnectionCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Initialize the connection cache
let cached: ConnectionCache = global.mongoose || { conn: null, promise: null }

// Save the connection cache to the global object
if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectToDatabase(): Promise<mongoose.Connection> {
  // If we have a connection, return it
  if (cached.conn) {
    return cached.conn
  }

  // If we don't have a promise to connect, create one
  if (!cached.promise) {
    // MongoDB connection options
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Add these options for MongoDB Atlas
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    console.log('Connecting to MongoDB...')

    // Create a promise to connect to MongoDB
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully')
        return mongoose
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err)
        throw err
      })
  }

  try {
    // Wait for the connection
    const mongoose = await cached.promise
    cached.conn = mongoose.connection
  } catch (e) {
    // If there's an error, clear the promise and throw
    cached.promise = null
    console.error('Failed to connect to MongoDB:', e)
    throw new Error(`MongoDB connection failed: ${e instanceof Error ? e.message : String(e)}`)
  }

  return cached.conn
}
