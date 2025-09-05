import { Elysia } from 'elysia';
import { getWeatherData, getBatchWeatherData } from '../services/weather';

export const weatherRoutes = new Elysia()
  .get('/weather/:city', async ({ params: { city }, status }) => {
    try {
      const weatherData = await getWeatherData(city);
      status(200);
      
      return {
        success: true,
        data: weatherData
      };
    } catch (error: any) {
      console.error(`❌ Error fetching weather for ${city}:`, error.message);
      status(error.message.includes('not found') ? 404 : 500);
      
      return {
        success: false,
        error: error.message,
        city: city
      };
    }
  })

  .get('/weather', async ({ query, status }) => {
    const { cities } = query;
    
    if (!cities || typeof cities !== 'string') {
      status(400);
      return {
        success: false,
        error: 'Missing or invalid "cities" query parameter. Use: ?cities=NY,Paris,Madrid'
      };
    }

    const cityList = cities.split(',').filter(city => city.trim().length > 0);
    
    if (cityList.length === 0) {
      status(400);
      return {
        success: false,
        error: 'No valid cities provided'
      };
    }

    if (cityList.length > 10) {
      status(400);
      return {
        success: false,
        error: 'Maximum 10 cities allowed per request'
      };
    }

    try {
      const results = await getBatchWeatherData(cityList);
      status(200);
      
      return {
        success: true,
        count: cityList.length,
        data: results
      };
    } catch (error: any) {
      console.error('❌ Batch weather error:', error.message);
      status(500);
      
      return {
        success: false,
        error: 'Internal server error processing batch request'
      };
    }
  });

  