"use client"
import { useState, useEffect } from "react"

export function useCitiesWeather(cities, refreshKey = 0) {
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeatherForCities = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

      if (!apiKey) {
        setError("Missing OpenWeather API key")
        setLoading(false)
        return
      }

      if (!cities || cities.length === 0) {
        setWeatherData([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Fetch weather for all cities in parallel
        const weatherPromises = cities.map(async (city) => {
          try {
            const [weatherRes, geoRes] = await Promise.all([
              fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${apiKey}&units=metric`,
              ),
              fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${city.lat}&lon=${city.lng}&limit=1&appid=${apiKey}`,
              ),
            ])

            if (!weatherRes.ok) {
              throw new Error(`Weather API error: ${weatherRes.status}`)
            }

            const weatherData = await weatherRes.json()
            
            // Get city name from reverse geocoding or use saved name
            let cityName = city.name || weatherData.name || "Unknown Location"
            if (geoRes.ok) {
              const geoData = await geoRes.json()
              if (Array.isArray(geoData) && geoData.length > 0 && geoData[0].name) {
                cityName = geoData[0].name
              }
            }

            // Process weather data - store raw values for conversion
            return {
              id: city.id,
              country: weatherData.sys?.country ?? "Unknown",
              city: cityName,
              temperature: Math.round(weatherData.main?.temp ?? 0),
              condition: weatherData.weather?.[0]?.main ?? "Cloudy",
              description: weatherData.weather?.[0]?.description ?? "",
              windSpeedRaw: weatherData.wind?.speed ?? 0, // Store raw m/s value
              windSpeed: weatherData.wind?.speed != null ? Math.round(weatherData.wind.speed * 2.23694) : 0, // m/s -> mph (for backward compatibility)
              humidity: weatherData.main?.humidity ?? 0,
              visibility: weatherData.visibility != null ? Math.round(weatherData.visibility / 1000) : 0, // m -> km
              feelsLike: Math.round(weatherData.main?.feels_like ?? 0),
              pressure: weatherData.main?.pressure ?? 0,
              windDirection: weatherData.wind?.deg ?? 0,
              cloudiness: weatherData.clouds?.all ?? 0,
            }
          } catch (err) {
            console.error(`Error fetching weather for city ${city.name}:`, err)
            // Return a fallback object for failed cities
            return {
              id: city.id,
              country: "Unknown",
              city: city.name || "Unknown Location",
              temperature: 0,
              condition: "Cloudy",
              description: "Unable to fetch weather data",
              windSpeed: 0,
              humidity: 0,
              visibility: 0,
              feelsLike: 0,
              pressure: 0,
              windDirection: 0,
              cloudiness: 0,
              error: err.message,
            }
          }
        })

        const results = await Promise.all(weatherPromises)
        setWeatherData(results)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching weather data:", err)
        setError(err.message || "Could not load weather data")
        setLoading(false)
      }
    }

    fetchWeatherForCities()
  }, [cities, refreshKey])

  return { weatherData, loading, error }
}

