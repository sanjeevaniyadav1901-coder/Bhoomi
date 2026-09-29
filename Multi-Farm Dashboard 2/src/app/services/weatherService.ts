// Real-time weather service for Maharashtra regions
// Using OpenWeatherMap API as an example

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  rainProbability: number;
  description: string;
  lastUpdated: Date;
}

// Maharashtra city coordinates
const MAHARASHTRA_CITIES = {
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Nashik': { lat: 19.9975, lon: 73.7898 },
  'Aurangabad': { lat: 19.8762, lon: 75.3433 },
  'Solapur': { lat: 17.6599, lon: 75.9064 },
  'Nagpur': { lat: 21.1458, lon: 79.0882 },
  'Kolhapur': { lat: 16.7050, lon: 74.2433 },
  'Satara': { lat: 17.6805, lon: 73.9903 },
};

// Replace with your actual OpenWeatherMap API key
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch real-time weather data for a Maharashtra city
 */
export async function fetchRealTimeWeather(cityName: string): Promise<WeatherData> {
  const city = MAHARASHTRA_CITIES[cityName as keyof typeof MAHARASHTRA_CITIES];
  
  if (!city) {
    throw new Error(`City ${cityName} not found in Maharashtra database`);
  }

  try {
    // Fetch current weather
    const currentWeatherResponse = await fetch(
      `${BASE_URL}/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`
    );

    if (!currentWeatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const currentWeather = await currentWeatherResponse.json();

    // Fetch forecast for rain probability
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`
    );

    const forecast = forecastResponse.ok ? await forecastResponse.json() : null;

    // Calculate rain probability from forecast
    let rainProbability = 0;
    if (forecast && forecast.list && forecast.list.length > 0) {
      // Check next 24 hours (8 * 3-hour intervals)
      const next24Hours = forecast.list.slice(0, 8);
      const rainyPeriods = next24Hours.filter((period: any) => 
        period.weather[0].main.toLowerCase().includes('rain')
      );
      rainProbability = Math.round((rainyPeriods.length / next24Hours.length) * 100);
    }

    // Extract rainfall from last 3 hours (if available)
    const rainfall = currentWeather.rain?.['3h'] || currentWeather.rain?.['1h'] || 0;

    return {
      temperature: Math.round(currentWeather.main.temp),
      humidity: currentWeather.main.humidity,
      windSpeed: Math.round(currentWeather.wind.speed * 3.6), // Convert m/s to km/h
      rainfall: Math.round(rainfall * 10) / 10,
      rainProbability,
      description: currentWeather.weather[0].description,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    
    // Return mock data for Maharashtra if API fails
    return getMockWeatherForMaharashtra(cityName);
  }
}

/**
 * Get mock weather data for Maharashtra (fallback)
 */
function getMockWeatherForMaharashtra(cityName: string): WeatherData {
  // Simulate Maharashtra weather patterns
  const baseTemp = 28 + Math.random() * 10; // 28-38°C typical for Maharashtra
  const baseHumidity = 60 + Math.random() * 30; // 60-90% humidity
  
  return {
    temperature: Math.round(baseTemp),
    humidity: Math.round(baseHumidity),
    windSpeed: Math.round(10 + Math.random() * 15), // 10-25 km/h
    rainfall: Math.round(Math.random() * 15 * 10) / 10,
    rainProbability: Math.round(Math.random() * 100),
    description: getRandomWeatherDescription(),
    lastUpdated: new Date(),
  };
}

function getRandomWeatherDescription(): string {
  const descriptions = [
    'Clear sky',
    'Few clouds',
    'Scattered clouds',
    'Broken clouds',
    'Partly cloudy',
    'Light rain',
    'Moderate rain',
    'Sunny',
    'Hot and humid',
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * Search for weather by city name in Maharashtra
 */
export function searchMaharashtraCities(query: string): string[] {
  if (!query) return Object.keys(MAHARASHTRA_CITIES);
  
  const lowerQuery = query.toLowerCase();
  return Object.keys(MAHARASHTRA_CITIES).filter(city =>
    city.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all available Maharashtra cities
 */
export function getAllMaharashtraCities(): string[] {
  return Object.keys(MAHARASHTRA_CITIES);
}

/**
 * Fetch weather for multiple cities
 */
export async function fetchMultipleCitiesWeather(cities: string[]): Promise<Record<string, WeatherData>> {
  const weatherPromises = cities.map(async (city) => {
    const weather = await fetchRealTimeWeather(city);
    return { city, weather };
  });

  const results = await Promise.all(weatherPromises);
  
  return results.reduce((acc, { city, weather }) => {
    acc[city] = weather;
    return acc;
  }, {} as Record<string, WeatherData>);
}

/**
 * Setup auto-refresh for weather data
 */
export function setupWeatherAutoRefresh(
  cityName: string,
  callback: (weather: WeatherData) => void,
  intervalMs: number = 300000 // 5 minutes default
): () => void {
  // Initial fetch
  fetchRealTimeWeather(cityName).then(callback);

  // Setup interval
  const intervalId = setInterval(() => {
    fetchRealTimeWeather(cityName).then(callback);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
