// index.ts
import { Elysia } from 'elysia';
import { weatherRoutes } from './routes/weather';
import { healthRoutes } from './routes/health';
import { loggingMiddleware } from './middleware/logging';
import { initCache, cleanExpiredCache } from './services/cache';
import { initRedis, closeRedis } from './lib/redis';
import { config } from './config/env';

console.log('🌤️  Starting Weather Microservice...');

try {
  await initCache();
  
  await cleanExpiredCache();
  
  setInterval(cleanExpiredCache, 30 * 60 * 1000);
  
} catch (error) {
  console.error('❌ Initialization failed:', error);
  process.exit(1);
}

const app = new Elysia()
  .use(loggingMiddleware)
  .use(healthRoutes)
  .use(weatherRoutes)
  
  .all('*', ({ status }) => {
    status(404);
    return {
      success: false,
      error: 'Endpoint not found',
      available_endpoints: [
        'GET /health',
        'GET /weather/:city',
        'GET /weather?cities=city1,city2,city3'
      ]
    };
  });

const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await closeRedis();
    console.log('✅ All connections closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

app.listen(config.PORT, () => {
  console.log('🌤️  Weather Microservice v2.0');
  console.log('='.repeat(50));
  console.log(`🚀 Server running at http://localhost:${config.PORT}`);
  console.log(`📦 Cache: ${config.USE_REDIS ? 'Redis + SQLite (dual layer)' : 'SQLite only'}`);
  console.log(`⏰ Cache TTL: ${config.CACHE_TTL / 1000 / 60} minutes`);
  console.log(`🗄️  ORM: Drizzle with bun:sqlite`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log(`  GET  /health`);
  console.log(`  GET  /weather/:city`);
  console.log(`  GET  /weather?cities=NY,Paris,Madrid`);
  console.log('='.repeat(50));
});

export default app;