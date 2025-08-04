import { Request, Response } from 'express';
import { cache } from '../utils/redis';

export class CacheController {
  // Get all cache keys
  getCacheKeys = async (req: Request, res: Response) => {
    try {
      const pattern = req.query.pattern as string || '*';
      const keys = await cache.keys(pattern);
      res.json({ keys, count: keys.length });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  // Check if specific key exists
  checkCacheKey = async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const exists = await cache.exists(key);
      const ttl = await cache.ttl(key);
      const data = exists ? await cache.get(key) : null;
      
      res.json({
        key,
        exists,
        ttl: ttl > 0 ? `${ttl}s` : ttl === -1 ? 'no expiry' : 'expired',
        data
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  // Clear specific cache key
  clearCacheKey = async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      await cache.del(key);
      res.json({ message: `Cache key '${key}' cleared` });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}