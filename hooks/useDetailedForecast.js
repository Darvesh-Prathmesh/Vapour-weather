"use client"
import { useState, useEffect } from "react"

export function useDetailedForecast(lat, lon, refreshKey = 0) {
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lon) {
      setLoading(false)
      return
    }

    const fetchDetailedForecast = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

      if (!apiKey) {
        setError("Missing OpenWeather API key")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Fetch all data in parallel
        const [currentRes, forecastRes, geoRes, airQualityRes] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
          ),
          fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`,
          ),
        ])

        if (!currentRes.ok) {
          throw new Error(`Weather API error: ${currentRes.status}`)
        }

        if (!forecastRes.ok) {
          throw new Error(`Forecast API error: ${forecastRes.status}`)
        }

        const currentData = await currentRes.json()
        const forecastList = await forecastRes.json()
        const geoData = geoRes.ok ? await geoRes.json() : null
        const airQualityData = airQualityRes.ok ? await airQualityRes.json() : null

        // Get location details
        let cityName = currentData.name ?? "Unknown Location"
        let state = ""
        let country = currentData.sys?.country ?? "Unknown"

        if (geoData && Array.isArray(geoData) && geoData.length > 0) {
          const location = geoData[0]
          cityName = location.name || cityName
          state = location.state || ""
          country = location.country || country
        }

        // Process current weather
        const current = {
          city: cityName,
          state: state,
          country: country,
          temperature: Math.round(currentData.main?.temp ?? 0),
          feelsLike: Math.round(currentData.main?.feels_like ?? 0),
          tempMin: Math.round(currentData.main?.temp_min ?? 0),
          tempMax: Math.round(currentData.main?.temp_max ?? 0),
          condition: currentData.weather?.[0]?.main ?? "Cloudy",
          description: currentData.weather?.[0]?.description ?? "",
          icon: currentData.weather?.[0]?.icon ?? "01d",
          windSpeed: currentData.wind?.speed ?? 0, // m/s
          windSpeedMph: currentData.wind?.speed != null ? Math.round(currentData.wind.speed * 2.23694) : 0,
          windDirection: currentData.wind?.deg ?? 0,
          humidity: currentData.main?.humidity ?? 0,
          dewPoint: calculateDewPoint(currentData.main?.temp ?? 0, currentData.main?.humidity ?? 0),
          pressure: currentData.main?.pressure ?? 0,
          visibility: currentData.visibility != null ? Math.round(currentData.visibility / 1000) : 0, // m -> km
          cloudiness: currentData.clouds?.all ?? 0,
          uvIndex: currentData.uvi ?? 0, // May not be available in free tier
          sunrise: currentData.sys?.sunrise ? new Date(currentData.sys.sunrise * 1000) : null,
          sunset: currentData.sys?.sunset ? new Date(currentData.sys.sunset * 1000) : null,
          lastUpdate: new Date(currentData.dt * 1000),
        }

        // Process hourly forecast (next 24-48 hours from 3-hour forecast)
        const hourlyForecast = []
        const now = new Date()
        const forecastItems = forecastList.list || []

        forecastItems.forEach((item) => {
          const itemDate = new Date(item.dt * 1000)
          // Only include next 48 hours
          if (itemDate <= new Date(now.getTime() + 48 * 60 * 60 * 1000)) {
            hourlyForecast.push({
              time: itemDate,
              temperature: Math.round(item.main.temp),
              feelsLike: Math.round(item.main.feels_like),
              condition: item.weather[0]?.main ?? "Cloudy",
              description: item.weather[0]?.description ?? "",
              icon: item.weather[0]?.icon ?? "01d",
              pop: item.pop ? Math.round(item.pop * 100) : 0, // Probability of precipitation (0-100)
              windSpeed: item.wind?.speed ?? 0,
              windSpeedMph: item.wind?.speed != null ? Math.round(item.wind.speed * 2.23694) : 0,
              windDirection: item.wind?.deg ?? 0,
              humidity: item.main?.humidity ?? 0,
            })
          }
        })

        // Process daily forecast (next 7-15 days)
        const dailyForecast = []
        const dayGroups = {}

        forecastItems.forEach((item) => {
          const date = new Date(item.dt * 1000)
          const dayKey = date.toDateString()

          if (!dayGroups[dayKey]) {
            dayGroups[dayKey] = []
          }
          dayGroups[dayKey].push({
            time: date,
            temp: Math.round(item.main.temp),
            tempMin: Math.round(item.main.temp_min),
            tempMax: Math.round(item.main.temp_max),
            condition: item.weather[0]?.main ?? "Cloudy",
            icon: item.weather[0]?.icon ?? "01d",
            pop: item.pop ? Math.round(item.pop * 100) : 0,
            humidity: item.main?.humidity ?? 0,
            windSpeed: item.wind?.speed ?? 0,
            windSpeedMph: item.wind?.speed != null ? Math.round(item.wind.speed * 2.23694) : 0,
          })
        })

        // Build daily forecast for next 7 days
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
          const targetDate = new Date(today)
          targetDate.setDate(today.getDate() + i)
          const dayKey = targetDate.toDateString()
          const dayIndex = targetDate.getDay()
          const dayName = dayNames[dayIndex]

          if (dayGroups[dayKey] && dayGroups[dayKey].length > 0) {
            const dayData = dayGroups[dayKey]
            const temps = dayData.map((d) => d.temp)
            const tempMins = dayData.map((d) => d.tempMin)
            const tempMaxs = dayData.map((d) => d.tempMax)
            const maxPop = Math.max(...dayData.map((d) => d.pop))

            dailyForecast.push({
              day: dayName,
              date: targetDate,
              maxTemp: Math.max(...tempMaxs),
              minTemp: Math.min(...tempMins),
              condition: dayData[Math.floor(dayData.length / 2)]?.condition ?? "Cloudy",
              icon: dayData[Math.floor(dayData.length / 2)]?.icon ?? "01d",
              pop: maxPop,
              isToday: i === 0,
            })
          }
        }

        // Process air quality
        let airQuality = null
        if (airQualityData && airQualityData.list && airQualityData.list.length > 0) {
          const aq = airQualityData.list[0].main
          const aqi = aq.aqi // 1-5 scale
          const aqiLabels = {
            1: "Good",
            2: "Fair",
            3: "Moderate",
            4: "Poor",
            5: "Very Poor",
          }

          airQuality = {
            aqi: aqi,
            aqiLabel: aqiLabels[aqi] || "Unknown",
            co: airQualityData.list[0].components?.co ?? 0,
            no2: airQualityData.list[0].components?.no2 ?? 0,
            o3: airQualityData.list[0].components?.o3 ?? 0,
            pm2_5: airQualityData.list[0].components?.pm2_5 ?? 0,
            pm10: airQualityData.list[0].components?.pm10 ?? 0,
            so2: airQualityData.list[0].components?.so2 ?? 0,
          }
        }

        // Calculate moon phase (approximate)
        const moonPhase = calculateMoonPhase(new Date())

        setForecastData({
          current,
          hourlyForecast,
          dailyForecast,
          airQuality,
          moonPhase,
        })
        setLoading(false)
      } catch (err) {
        console.error("Detailed forecast fetch error:", err)
        setError(err.message || "Could not load forecast data")
        setLoading(false)
      }
    }

    fetchDetailedForecast()
  }, [lat, lon])

  return { forecastData, loading, error }
}

// Helper function to calculate dew point
function calculateDewPoint(temp, humidity) {
  const a = 17.27
  const b = 237.7
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0)
  return Math.round((b * alpha) / (a - alpha))
}

// Helper function to calculate moon phase (0-1, where 0 is new moon, 0.5 is full moon)
function calculateMoonPhase(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Simple approximation
  const daysSinceNewMoon = (year * 365.25 + month * 30.6 + day) % 29.53
  const phase = daysSinceNewMoon / 29.53

  if (phase < 0.0625) return "New Moon"
  if (phase < 0.1875) return "Waxing Crescent"
  if (phase < 0.3125) return "First Quarter"
  if (phase < 0.4375) return "Waxing Gibbous"
  if (phase < 0.5625) return "Full Moon"
  if (phase < 0.6875) return "Waning Gibbous"
  if (phase < 0.8125) return "Last Quarter"
  if (phase < 0.9375) return "Waning Crescent"
  return "New Moon"
}

