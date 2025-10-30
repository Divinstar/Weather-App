import { useState } from 'react';
import { Search, MapPin, Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Gauge, Loader } from 'lucide-react';

// ============================================
// API CONFIGURATION AND WEATHER SERVICE
// ============================================
// API configuration
const API_BASE_URL = 'https://weather-app-production-c740.up.railway.app';

const weatherAPI = {
  // Get weather by city name
  async getWeatherByCity(cityName) {
    const response = await fetch(
      `${API_BASE_URL}/api/weather/city?city=${encodeURIComponent(cityName)}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch weather data');
    }
    
    return await response.json();
  },

  // Get weather by coordinates
  async getWeatherByCoordinates(latitude, longitude) {
    const response = await fetch(
      `${API_BASE_URL}/api/weather?latitude=${latitude}&longitude=${longitude}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch weather data');
    }
    
    return await response.json();
  }
};

// ============================================
// MAIN WEATHER APP COMPONENT
// ============================================
export default function WeatherApp() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [city, setCity] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ============================================
  // WEATHER ICON MAPPING - Returns appropriate icon based on WMO weather code
  // ============================================
  const getWeatherIcon = (code, size = 'w-16 h-16') => {
    // WMO Weather codes
    if (code === 0) return <Sun className={`${size} text-yellow-400`} />;
    if (code <= 3) return <Cloud className={`${size} text-gray-300`} />;
    if (code <= 67) return <CloudRain className={`${size} text-blue-400`} />;
    if (code <= 77) return <CloudSnow className={`${size} text-blue-200`} />;
    return <Wind className={`${size} text-gray-400`} />;
  };

  // ============================================
  // WEATHER DESCRIPTION MAPPING - Converts WMO codes to human-readable descriptions
  // ============================================
  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  };

  // ============================================
  // FETCH WEATHER BY COORDINATES - Gets weather data using latitude and longitude
  // ============================================
  const fetchWeatherData = async (latitude, longitude, cityName) => {
    setLoading(true);
    setError('');
    try {
      const data = await weatherAPI.getWeatherByCoordinates(latitude, longitude);
      
      setWeatherData({
        city: cityName,
        current: data.current,
        hourly: data.hourly,
        timezone: data.timezone
      });

      setForecastData(data.daily);
      setIsSearched(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SEARCH CITY - Fetches weather data by city name
  // ============================================
  const searchCity = async (searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const data = await weatherAPI.getWeatherByCity(searchQuery);
      
      setWeatherData({
        city: data.city,
        current: data.weather.current,
        hourly: data.weather.hourly,
        timezone: data.weather.timezone
      });

      setForecastData(data.weather.daily);
      setIsSearched(true);
    } catch (err) {
      setError(err.message || 'City not found. Please try another city.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SEARCH BUTTON HANDLER
  // ============================================
  const handleSearch = () => {
    if (city.trim()) {
      searchCity(city.trim());
    }
  };

  // ============================================
  // KEYBOARD ENTER KEY HANDLER FOR SEARCH
  // ============================================
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ============================================
  // GEOLOCATION HANDLER - Uses browser's geolocation API
  // ============================================
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(
            position.coords.latitude,
            position.coords.longitude,
            'Your Location'
          );
        },
        (err) => {
          setError('Unable to get your location. Please search for a city.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  // ============================================
  // DATE/TIME FORMATTING UTILITIES
  // ============================================
  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // ============================================
  // LANDING PAGE - Initial search interface
  // ============================================
  if (!isSearched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0f172a] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background animated weather icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Cloud className="absolute top-20 left-10 text-white/10 w-24 h-24 sm:w-32 sm:h-32 animate-float" />
          <Sun className="absolute top-40 right-20 text-yellow-400/20 w-32 h-32 sm:w-40 sm:h-40 animate-pulse" />
          <CloudRain className="absolute bottom-20 right-40 text-white/10 w-20 h-20 sm:w-28 sm:h-28 animate-float-delayed" />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          {/* Header section */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
              Weather Now
            </h1>
            <p className="text-lg sm:text-xl text-white/80 drop-shadow">
              Get instant weather updates for any city
            </p>
          </div>

          {/* Search card */}
          <div className="backdrop-blur-lg bg-[#1e3a5f]/60 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 animate-slide-up">
            {/* City search input */}
            <div className="relative">
              <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter city name..."
                className="w-full px-12 sm:px-16 py-4 sm:py-5 bg-white/20 backdrop-blur rounded-2xl text-white placeholder-white/60 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 border border-white/30"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/40 backdrop-blur px-4 sm:px-8 py-2 sm:py-3 rounded-xl text-white text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-105 border border-white/30 disabled:opacity-50"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Use location button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUseLocation}
                disabled={loading}
                className="flex items-center gap-2 sm:gap-3 bg-white/20 hover:bg-white/30 backdrop-blur px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-white text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 border border-white/30 group disabled:opacity-50"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
                Use My Location
              </button>
            </div>

            {/* Error message display */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-white text-center text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Custom CSS animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
          .animate-fade-in { animation: fade-in 0.8s ease-out; }
          .animate-slide-up { animation: slide-up 0.6s ease-out 0.2s both; }
        `}</style>
      </div>
    );
  }

  // ============================================
  // WEATHER RESULTS PAGE - Displays weather data after search
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0f172a] p-4 sm:p-6">
      {/* ============================================
          TOP SEARCH BAR - Persistent search interface
          ============================================ */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="backdrop-blur-lg bg-[#1e3a5f]/60 rounded-2xl p-3 sm:p-4 shadow-lg border border-white/20 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search another city..."
              className="w-full px-10 sm:px-12 py-2 sm:py-3 bg-white/20 backdrop-blur rounded-xl text-white placeholder-white/60 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/30 transition-all border border-white/30"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/40 px-3 sm:px-6 py-1 sm:py-2 rounded-lg text-white text-sm font-semibold transition-all hover:scale-105"
            >
              Search
            </button>
          </div>
          <button
            onClick={handleUseLocation}
            disabled={loading}
            className="bg-white/30 hover:bg-white/40 backdrop-blur p-2 sm:p-3 rounded-xl text-white transition-all duration-300 hover:scale-105 border border-white/30 disabled:opacity-50"
            title="Use my location"
          >
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* ============================================
          LOADING STATE
          ============================================ */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-white animate-spin" />
        </div>
      ) : weatherData ? (
        <div className="max-w-7xl mx-auto">
          {/* ============================================
              MAIN LAYOUT - 70/30 split (left/right)
              ============================================ */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ============================================
                LEFT SIDE - Main weather information (70%)
                ============================================ */}
            <div className="flex-1 lg:w-[70%]">
              {/* Current weather card */}
              <div className="backdrop-blur-lg bg-[#1e3a5f]/60 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 mb-6">
                <div className="text-white">
                  {/* Location and time header */}
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2">{weatherData.city}</h2>
                  <p className="text-white/80 text-sm sm:text-base mb-6">{getCurrentTime()}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                    {/* Main temperature display with icon */}
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(weatherData.current.weather_code, 'w-24 h-24 sm:w-32 sm:h-32')}
                      <div>
                        <div className="text-6xl sm:text-7xl font-bold">
                          {Math.round(weatherData.current.temperature_2m)}°
                        </div>
                        <div className="text-lg sm:text-xl text-white/80 mt-2">
                          {getWeatherDescription(weatherData.current.weather_code)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Weather details grid - Humidity, Wind, Visibility, Feels Like */}
                    <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                      <div className="backdrop-blur bg-white/10 rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-5 h-5 text-blue-300" />
                          <span className="text-sm text-white/70">Humidity</span>
                        </div>
                        <div className="text-2xl font-bold">{weatherData.current.relative_humidity_2m}%</div>
                      </div>
                      
                      <div className="backdrop-blur bg-white/10 rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="w-5 h-5 text-gray-300" />
                          <span className="text-sm text-white/70">Wind</span>
                        </div>
                        <div className="text-2xl font-bold">{Math.round(weatherData.current.wind_speed_10m)} km/h</div>
                      </div>
                      
                      <div className="backdrop-blur bg-white/10 rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-5 h-5 text-purple-300" />
                          <span className="text-sm text-white/70">Visibility</span>
                        </div>
                        <div className="text-2xl font-bold">{(weatherData.current.visibility / 1000).toFixed(1)} km</div>
                      </div>
                      
                      <div className="backdrop-blur bg-white/10 rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Gauge className="w-5 h-5 text-orange-300" />
                          <span className="text-sm text-white/70">Feels Like</span>
                        </div>
                        <div className="text-2xl font-bold">{Math.round(weatherData.current.apparent_temperature)}°</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================
                  HOURLY FORECAST - Shows today's weather by hour
                  ============================================ */}
              <div className="backdrop-blur-lg bg-[#1e3a5f]/60 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">Today's Forecast</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-2">
                    {weatherData.hourly.time.slice(0, 24).map((time, index) => {
                      const hour = new Date(time).getHours();
                      const currentHour = new Date().getHours();
                      if (hour >= currentHour && index % 3 === 0) {
                        return (
                          <div key={index} className="flex-shrink-0 backdrop-blur bg-white/10 rounded-2xl p-4 border border-white/20 text-center min-w-[100px]">
                            <div className="text-white/80 text-sm mb-2">
                              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                            </div>
                            <div className="flex justify-center mb-2">
                              {getWeatherIcon(weatherData.hourly.weather_code[index], 'w-8 h-8')}
                            </div>
                            <div className="text-xl font-bold text-white">
                              {Math.round(weatherData.hourly.temperature_2m[index])}°
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================
                RIGHT SIDE - 7-day forecast (30%)
                ============================================ */}
            <div className="lg:w-[30%]">
              <div className="backdrop-blur-lg bg-[#1e3a5f]/60 rounded-3xl p-6 shadow-2xl border border-white/20 sticky top-6">
                <h3 className="text-2xl font-bold text-white mb-4">7-Day Forecast</h3>
                <div className="space-y-3">
                  {forecastData && forecastData.time.slice(0, 7).map((date, index) => (
                    <div key={index} className="backdrop-blur bg-white/10 rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {getWeatherIcon(forecastData.weather_code[index], 'w-10 h-10')}
                          <div className="text-white">
                            <div className="font-semibold">{getDayName(date)}</div>
                            <div className="text-sm text-white/70">
                              {getWeatherDescription(forecastData.weather_code[index])}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {Math.round(forecastData.temperature_2m_max[index])}°
                          </div>
                          <div className="text-sm text-white/60">
                            {Math.round(forecastData.temperature_2m_min[index])}°
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
