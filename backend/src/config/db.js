const mongoose = require('mongoose');
const env = require('./env');
const dns = require('dns');
// Helper to apply DNS servers
function applyDnsServers(servers) {
  try {
    dns.setServers(servers);
    return true;
  } catch (dnsErr) {
    console.warn('Failed to set DNS servers:', dnsErr.message);
    return false;
  }
}

// Only apply custom public DNS resolvers if explicitly requested or outside test mode
if (process.env.CUSTOM_DNS_SERVERS) {
  applyDnsServers(process.env.CUSTOM_DNS_SERVERS.split(',').map((s) => s.trim()));
} else if (process.env.NODE_ENV !== 'test') {
  // On Windows, Docker, and certain networks, the default DNS resolver fails on SRV queries (_mongodb._tcp)
  // Pre-configure reliable public DNS resolvers (Cloudflare 1.1.1.1, Google 8.8.8.8)
  applyDnsServers(['8.8.8.8', '1.1.1.1']);
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

  const connectionOptions = {
    serverSelectionTimeoutMS: 8000,
    bufferCommands: false
  };

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, connectionOptions);
    if (env.NODE_ENV !== 'test') {
      console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    // If connection failed due to DNS SRV lookup error, retry once with public DNS
    const isDnsError =
      error.syscall === 'querySrv' ||
      (error.message && error.message.includes('querySrv')) ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND';

    if (isDnsError) {
      console.warn(`DNS SRV resolution failed with initial resolver (${error.code || error.message}). Retrying with public DNS resolvers (8.8.8.8, 1.1.1.1)...`);
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const retryConn = await mongoose.connect(env.MONGODB_URI, connectionOptions);
        if (env.NODE_ENV !== 'test') {
          console.log(`MongoDB connected after DNS retry: ${retryConn.connection.host}`);
        }
        return retryConn;
      } catch (retryErr) {
        console.error('MongoDB connection retry with public DNS also failed:', retryErr.message);
      }
    }

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
    console.error('MongoDB connection error occurred:', error.message || error);
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
