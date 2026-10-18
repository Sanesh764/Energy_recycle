const mongoose = require('mongoose');
const env = require('./env');
const dns = require('dns');
// Only apply custom public DNS resolvers if explicitly requested or in local dev fallback
if (process.env.CUSTOM_DNS_SERVERS) {
  try {
    dns.setServers(process.env.CUSTOM_DNS_SERVERS.split(',').map((s) => s.trim()));
  } catch (dnsErr) {
    console.warn('Failed to set custom DNS servers:', dnsErr.message);
  }
} else if (process.env.NODE_ENV === 'development') {
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  } catch (dnsErr) {
  }
}

async function connectDB() {
  // readyState: 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection.readyState === 2) {
    // Wait for in-flight connection
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      bufferCommands: false
    });
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
