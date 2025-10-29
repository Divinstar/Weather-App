from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Optional

app = FastAPI()

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[*],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base URLs for APIs
WEATHER_API_BASE = "https://api.open-meteo.com/v1"
GEO_API_BASE = "https://geocoding-api.open-meteo.com/v1"

@app.get("/")
async def root():
    return {"message": "Weather API Backend"}

@app.get("/api/geocode")
async def geocode_city(city: str):
    """
    Search for a city and get its coordinates
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GEO_API_BASE}/search",
                params={
                    "name": city,
                    "count": 1,
                    "language": "en",
                    "format": "json"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if not data.get("results"):
                raise HTTPException(status_code=404, detail="City not found")
            
            return data["results"][0]
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geocode data: {str(e)}")

@app.get("/api/weather")
async def get_weather(latitude: float, longitude: float):
    """
    Get weather data for given coordinates
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WEATHER_API_BASE}/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility",
                    "hourly": "temperature_2m,weather_code",
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min",
                    "timezone": "auto"
                }
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

@app.get("/api/weather/city")
async def get_weather_by_city(city: str):
    """
    Get weather data by city name (combines geocoding and weather fetch)
    """
    try:
        # First get coordinates
        location = await geocode_city(city)
        
        # Then get weather
        weather = await get_weather(location["latitude"], location["longitude"])
        
        return {
            "city": location["name"],
            "country": location.get("country", ""),
            "weather": weather
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
