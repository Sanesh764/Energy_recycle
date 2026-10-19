
const { redisClient } = require('../config/redis');

async function getCachedJson(key) {
  if (!redisClient.isReady) return null;

  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Redis cache read failed:', error.message);
    return null;
  }
}

async function setCachedJson(key, value, ttlSeconds = 60) {
  if (!redisClient.isReady) return;

  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch (error) {
    console.error('Redis cache write failed:', error.message);
  }
}

async function deleteCache(key) {
  if (!redisClient.isReady) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis cache delete failed:', error.message);
  }
}
async function invalidateDeviceList(userId, role = 'citizen') {
  await deleteCache(`devices:list:${role}:${userId}`);
}

async function invalidateDeviceCaches(ownerId) {
  if (!redisClient.isReady) return;
  try {
    if (ownerId) {
      await deleteCache(`devices:list:citizen:${ownerId.toString()}`);
    }
    // Also invalidate any cached admin device lists
    if (typeof redisClient.keys === 'function') {
      const adminKeys = await redisClient.keys('devices:list:admin:*');
      if (Array.isArray(adminKeys) && adminKeys.length > 0) {
        await Promise.all(adminKeys.map((k) => redisClient.del(k)));
      }
    }
  } catch (error) {
    console.error('Redis cache invalidation failed:', error.message);
  }
}

module.exports = {
  getCachedJson,
  setCachedJson,
  deleteCache,
  invalidateDeviceList,
  invalidateDeviceCaches
};
