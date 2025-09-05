// src/types/weather.ts
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  wind_speed: number;
  visibility: number;
  timestamp: number;
}

export interface CacheEntry {
  city: string;
  data: string;
  timestamp: number;
}

export interface OpenWeatherResponse {
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: { speed: number };
  visibility: number;
}