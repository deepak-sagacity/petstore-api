import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
      console.log('Redis connected successfully');
    }
  } catch (error) {
    console.log('Redis not available, running without cache');
  }
};

export const cache = {
  get: async (key: string) => {
    try {
      if (!redis.isOpen) return null;
      const data = await redis.get(key);
      const result = data ? JSON.parse(data) : null;
      console.log(`Cache GET [${key}]: ${result ? 'HIT' : 'MISS'}`);
      return result;
    } catch (error) {
      return null;
    }
  },
  
  set: async (key: string, value: any, ttl: number = 300) => {
    try {
      if (!redis.isOpen) return;
      await redis.setEx(key, ttl, JSON.stringify(value));
      console.log(`Cache SET [${key}]: TTL ${ttl}s`);
    } catch (error) {
      // Silently fail if Redis is not available
    }
  },
  
  del: async (key: string) => {
    try {
      if (!redis.isOpen) return;
      await redis.del(key);
      console.log(`Cache DEL [${key}]`);
    } catch (error) {
      // Silently fail if Redis is not available
    }
  },
  
  // Check if key exists
  exists: async (key: string) => {
    try {
      if (!redis.isOpen) return false;
      return await redis.exists(key) === 1;
    } catch (error) {
      return false;
    }
  },
  
  // Get all cache keys
  keys: async (pattern: string = '*') => {
    try {
      if (!redis.isOpen) return [];
      return await redis.keys(pattern);
    } catch (error) {
      return [];
    }
  },
  
  // Get TTL for a key
  ttl: async (key: string) => {
    try {
      if (!redis.isOpen) return -1;
      return await redis.ttl(key);
    } catch (error) {
      return -1;
    }
  }
};

export default redis;