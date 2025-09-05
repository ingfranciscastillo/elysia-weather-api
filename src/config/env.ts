export const config = {
  PORT: process.env.PORT || 3000,
  OPENWEATHER_KEY: process.env.OPENWEATHER_KEY,
  CACHE_TTL: 10 * 60 * 1000,
  USE_REDIS: false, // Deshabilitado temporalmente
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
  DB_FILE_NAME: process.env.DB_FILE_NAME || 'weather_cache.db'
};

if (!config.OPENWEATHER_KEY) {
  console.error('❌ Error: OPENWEATHER_KEY environment variable is required');
  process.exit(1);
}