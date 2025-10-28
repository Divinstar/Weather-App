const API_BASE_URL = 'http://localhost:8000';

export const weatherAPI = {
  // Get weather by city name
  async getWeatherByCity(cityName) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/weather/city?city=${encodeURIComponent(cityName)}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch weather data');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get weather by coordinates
  async getWeatherByCoordinates(latitude, longitude) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/weather?latitude=${latitude}&longitude=${longitude}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch weather data');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Geocode city name
  async geocodeCity(cityName) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/geocode?city=${encodeURIComponent(cityName)}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'City not found');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};