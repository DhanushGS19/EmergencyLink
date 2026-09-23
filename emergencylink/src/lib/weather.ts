import axios from 'axios';

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'placeholder_key';

export interface WeatherData {
  temp: number;
  condition: string;
  visibility: number;
  windSpeed: number;
}

export const getLocalWeather = async (lat: number, lng: number): Promise<WeatherData | null> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    return {
      temp: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      visibility: response.data.visibility,
      windSpeed: response.data.wind.speed
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};
