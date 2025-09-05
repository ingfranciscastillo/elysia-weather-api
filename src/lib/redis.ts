import { createClient, type RedisClientType } from 'redis';
import { config } from '../config/env';

let redis: RedisClientType;

export const initRedis = async (): Promise<void> => {
  try {
    redis = createClient({
      url: config.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        keepAlive: true,
      },
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    redis.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redis.on('ready', () => {
      console.log('✅ Redis connected and ready');
    });

    redis.on('end', () => {
      console.log('🔚 Redis connection closed');
    });

    await redis.connect();
  } catch (error) {
    console.warn('⚠️  Redis not available, using SQLite only:', error.message);
    redis = null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redis || null;
};

export const closeRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    console.log('✅ Redis connection closed');
  }
};

export const isRedisConnected = (): boolean => {
  return redis?.isOpen || false;
};