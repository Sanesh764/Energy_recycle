
const { createClient } = require('redis');
const env = require('./env');

const initialRedisUrl = env.REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = createClient({
  url: initialRedisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Limit retries to prevent unbounded spam if Redis is offline
      if (retries > 3) {
        return false;
      }
      return 1000;
    }
  }
});

redisClient.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Redis Client Error:', err.message);
  }
});

async function connectRedis() {
  if (redisClient.isOpen) {
    return redisClient;
  }

  try {
    await redisClient.connect();
    console.log(`Redis connected successfully (${initialRedisUrl})`);
    return redisClient;
  } catch (err) {
    // If running directly on host and redis hostname failed, attempt localhost fallback
    const isDnsFailure = err.message && (err.message.includes('ENOTFOUND') || err.message.includes('EAI_AGAIN'));
    if (isDnsFailure && initialRedisUrl.includes('redis:6379')) {
      console.warn('Could not resolve redis:6379. Falling back to localhost:6379 for host execution...');
      try {
        const fallbackClient = createClient({
          url: 'redis://localhost:6379',
          socket: { reconnectStrategy: () => false }
        });
        fallbackClient.on('error', (fallbackErr) => {
          if (process.env.NODE_ENV !== 'test') {
            console.error('Redis Fallback Error:', fallbackErr.message);
          }
        });
        await fallbackClient.connect();
        redisClient = fallbackClient;
        console.log('Redis connected successfully (redis://localhost:6379)');
        return redisClient;
      } catch (fallbackError) {
        console.warn('Redis localhost fallback also unavailable:', fallbackError.message);
      }
    }
    throw err;
  }
}

async function disconnectRedis() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
  }
}

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};
