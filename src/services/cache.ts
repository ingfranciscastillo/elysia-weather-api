import { eq, lt } from 'drizzle-orm';
import { db } from '../config/db/connection';
import { initRedis } from '../lib/redis';
import { getRedisClient, isRedisConnected } from '../lib/redis';
import { config } from '../config/env';
import type { WeatherData } from '../types/weather';
import { weatherTable } from '../config/db/schema';

export const initCache = async () => {
  if (config.USE_REDIS) {
    await initRedis();
    
    if (isRedisConnected()) {
      console.log('✅ Cache system initialized (Redis + SQLite fallback)');
    } else {
      console.log('⚠️  Cache system initialized (SQLite only - Redis not available)');
    }
  } else {
    console.log('✅ Cache system initialized (SQLite only)');
  }
};

export const getCachedWeather = async (city: string): Promise<WeatherData | null> => {
  const now = Date.now();
  const cityKey = city.toLowerCase();
  
  try {
    if (config.USE_REDIS && isRedisConnected()) {
      const redis = getRedisClient();
      if (redis) {
        const cached = await redis.hGetAll(`weather:${cityKey}`);
        
        if (cached.data && cached.timestamp) {
          const age = now - parseInt(cached.timestamp);
          if (age < config.CACHE_TTL) {
            console.log(`📦 Redis cache hit for ${city}`);
            return JSON.parse(cached.data);
          }
          await redis.del(`weather:${cityKey}`);
        }
      }
    }
    
    const cached = await db
      .select()
      .from(weatherTable)
      .where(eq(weatherTable.city, cityKey))
      .limit(1);
    
    if (cached.length > 0) {
      const age = now - cached[0].timestamp;
      if (age < config.CACHE_TTL) {
        console.log(`📦 SQLite cache hit for ${city}`);
        return JSON.parse(cached[0].data);
      }
      
      await db.delete(weatherTable).where(eq(weatherTable.city, cityKey));
    }
    
  } catch (error) {
    console.error('Cache get error:', error);
  }
  
  return null;
};

export const setCachedWeather = async (city: string, data: WeatherData): Promise<void> => {
  const now = Date.now();
  const cityKey = city.toLowerCase();
  const jsonData = JSON.stringify(data);
  
  try {
    if (config.USE_REDIS && isRedisConnected()) {
      const redis = getRedisClient();
      if (redis) {
        await redis.hSet(`weather:${cityKey}`, {
          data: jsonData,
          timestamp: now.toString()
        });
        // Set expiration
        await redis.expire(`weather:${cityKey}`, Math.ceil(config.CACHE_TTL / 1000));
      }
    }
    
    // Guardar también en SQLite como respaldo
    await db
      .insert(weatherTable)
      .values({
        city: cityKey,
        data: jsonData,
        timestamp: now
      })
      .onConflictDoUpdate({
        target: weatherTable.city,
        set: {
          data: jsonData,
          timestamp: now
        }
      });
    
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const cleanExpiredCache = async (): Promise<void> => {
  const expiredTimestamp = Date.now() - config.CACHE_TTL;
  
  try {
    // Limpiar SQLite
    const result = await db
      .delete(weatherTable)
      .where(lt(weatherTable.timestamp, expiredTimestamp));
    
    console.log(`🧹 Cleaned expired cache entries`);
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
};

export const getCacheStats = async () => {
  try {
    const totalEntries = await db.select().from(weatherTable);
    const now = Date.now();
    const validEntries = totalEntries.filter(entry => 
      (now - entry.timestamp) < config.CACHE_TTL
    );
    
    return {
      total_entries: totalEntries.length,
      valid_entries: validEntries.length,
      expired_entries: totalEntries.length - validEntries.length,
      redis_connected: isRedisConnected()
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      total_entries: 0,
      valid_entries: 0,
      expired_entries: 0,
      redis_connected: isRedisConnected()
    };
  }
};