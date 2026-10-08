const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connect to MongoDB using validated MONGODB_URI.
 * Credentials and URI details are never printed to logs.
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    if (env.NODE_ENV !== 'test') {
      console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    console.error('MongoDB connection error occurred');
    throw error;
  }
}

/**
 * Disconnect from MongoDB gracefully.
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('MongoDB disconnection error occurred');
  }
}

module.exports = {
  connectDB,
  disconnectDB
};
