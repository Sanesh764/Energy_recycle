const mongoose = require('mongoose');
const env = require('./env');
const dns=require("dns");

dns.setServers(['1.1.1.1', '8.8.8.8']);

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
    if (env.NODE_ENV === 'development') {
      try {
        console.warn('Primary MongoDB URI connection failed, falling back to local MongoDB (mongodb://127.0.0.1:27017/e-waste-passport)...');
        const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/e-waste-passport');
        console.log(`Connected to local MongoDB fallback: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackErr) {
        console.error('Local MongoDB fallback also failed:', fallbackErr.message);
      }
    }
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
