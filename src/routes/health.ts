
import { Elysia } from 'elysia';
import { isRedisConnected } from '../lib/redis';
import { getCacheStats } from '../services/cache';

export const healthRoutes = new Elysia()
  .get('/health', async ({ status }) => {
    status(200);
    
    const cacheStats = await getCacheStats();
    
    return {
      status: 'healthy',
      service: 'weather-microservice',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cache: {
        isRedisConnected: isRedisConnected(),
        isSqliteEnabled: true,
        ...cacheStats
      },
      version: '2.0.0'
    };
  });