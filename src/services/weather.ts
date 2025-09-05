import axios from 'axios';
import { config } from '../config/env';
import { getCachedWeather, setCachedWeather } from '../services/cache';
import type { WeatherData, OpenWeatherResponse } from '../types/weather';

const transformWeatherData = (data: OpenWeatherResponse): WeatherData => ({
  city: data.name,
  country: data.sys.country,
  temperature: Math.round(data.main.temp),
  feels_like: Math.round(data.main.feels_like),
  humidity: data.main.humidity,
  pressure: data.main.pressure,
  description: data.weather[0].description,
  icon: data.weather[0].icon,
  wind_speed: data.wind.speed,
  visibility: data.visibility || 0,
  timestamp: Date.now()
});

// Obtener datos del clima de una ciudad
export const getWeatherData = async (city: string): Promise<WeatherData> => {
  const cached = await getCachedWeather(city);
  if (cached) {
    console.log(`📦 Cache hit for ${city}`);
    return cached;
  }

  console.log(`🌐 Fetching live data for ${city}`);
  
  try {
    const response = await axios.get<OpenWeatherResponse>(config.OPENWEATHER_BASE_URL, {
      params: {
        q: city,
        appid: config.OPENWEATHER_KEY,
        units: 'metric',
        lang: 'es'
      },
      timeout: 5000
    });

    const weatherData = transformWeatherData(response.data);

    await setCachedWeather(city, weatherData);
    
    return weatherData;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`City "${city}" not found`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Request timeout for city "${city}"`);
    }
    throw new Error(`Failed to fetch weather data for "${city}": ${error.message}`);
  }
};

export const getBatchWeatherData = async (cities: string[]): Promise<{ [city: string]: WeatherData | { error: string } }> => {
  const results: { [city: string]: WeatherData | { error: string } } = {};
  
  const promises = cities.map(async (city) => {
    try {
      const data = await getWeatherData(city.trim());
      results[city.trim()] = data;
    } catch (error: any) {
      results[city.trim()] = { error: error.message };
    }
  });

  await Promise.allSettled(promises);
  return results;
};