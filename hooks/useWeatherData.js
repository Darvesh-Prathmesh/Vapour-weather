"use client"
import { useState, useEffect } from "react"

export function useWeatherData() {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

    if (!apiKey) {
      setError("Missing OpenWeather API key")
      setLoading(false)
      return
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          console.log("📍 Location coordinates:", { latitude, longitude })

          // Fetch current weather and forecast in parallel
          const [weatherRes, forecastRes, geoRes] = await Promise.all([
            fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
            ),
            fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
            ),
            fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`,
            ),
          ])

          if (!weatherRes.ok) {
            throw new Error(`Weather API error: ${weatherRes.status}`)
          }

          if (!forecastRes.ok) {
            throw new Error(`Forecast API error: ${forecastRes.status}`)
          }

          const weatherData = await weatherRes.json()
          const forecastData = await forecastRes.json()
          
          console.log("🌤️ Raw Weather API Response:", weatherData)
          console.log("📅 Raw Forecast API Response:", forecastData)

          // Get city name from reverse geocoding
          let cityName = weatherData.name ?? "Current location"
          let geoData = null
          if (geoRes.ok) {
            geoData = await geoRes.json()
            console.log("🌍 Raw Geocoding API Response:", geoData)
            if (Array.isArray(geoData) && geoData.length > 0 && geoData[0].name) {
              cityName = geoData[0].name
            }
          }
          console.log("🏙️ City name:", cityName)

          // Process current weather
          const current = {
            country: weatherData.sys?.country ?? "Unknown",
            city: cityName,
            temperature: Math.round(weatherData.main?.temp ?? 0),
            condition: weatherData.weather?.[0]?.main ?? "Cloudy",
            description: weatherData.weather?.[0]?.description ?? "",
            windSpeed: weatherData.wind?.speed != null ? Math.round(weatherData.wind.speed * 2.23694) : 0, // m/s -> mph
            humidity: weatherData.main?.humidity ?? 0,
            visibility: weatherData.visibility != null ? Math.round(weatherData.visibility / 1000) : 0, // m -> km
            feelsLike: Math.round(weatherData.main?.feels_like ?? 0),
            pressure: weatherData.main?.pressure ?? 0,
            windDirection: weatherData.wind?.deg ?? 0,
            cloudiness: weatherData.clouds?.all ?? 0,
          }
          console.log("✅ Processed Current Weather:", current)

          // Process forecast data - group by day and get daily max/min
          const dailyForecast = []
          const forecastList = forecastData.list || []
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          // Group forecasts by day
          const dayGroups = {}
          console.log("📊 Forecast list items:", forecastList.length)
          forecastList.forEach((item) => {
            const date = new Date(item.dt * 1000)
            const dayKey = date.toDateString()

            if (!dayGroups[dayKey]) {
              dayGroups[dayKey] = []
            }
            dayGroups[dayKey].push({
              time: date,
              temp: Math.round(item.main.temp),
              condition: item.weather[0]?.main ?? "Cloudy",
              icon: item.weather[0]?.icon ?? "01d",
            })
          })
          console.log("📅 Day Groups (grouped forecast):", dayGroups)

          // Get today's data
          const todayKey = today.toDateString()
          console.log("📆 Today's date key:", todayKey)
          const todayTemps = dayGroups[todayKey] ? dayGroups[todayKey].map((f) => f.temp) : [current.temperature]
          const todayMaxTemp = Math.max(...todayTemps)
          const todayCondition = current.condition
          const todayIcon = weatherData.weather?.[0]?.icon ?? "01d"
          console.log("🌡️ Today's temps:", todayTemps, "Max:", todayMaxTemp)

          // Build forecast starting from today + next 4 days (5 days total)
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          const todayDayIndex = today.getDay()
          console.log("📅 Today's day index:", todayDayIndex, "(" + dayNames[todayDayIndex] + ")")
          
          const finalForecast = []
          
          // Start from today and get next 4 days (5 days total)
          for (let i = 0; i < 5; i++) {
            const targetDate = new Date(today)
            targetDate.setDate(today.getDate() + i)
            const dayKey = targetDate.toDateString()
            const dayIndex = targetDate.getDay()
            const dayName = dayNames[dayIndex]
            
            console.log(`  Processing day ${i} (${dayName}): dayKey=${dayKey}, hasData=${!!dayGroups[dayKey]}`)
            
            // If it's today (i === 0), use current weather data
            if (i === 0) {
              finalForecast.push({
                day: dayName,
                date: targetDate,
                maxTemp: todayMaxTemp,
                minTemp: Math.min(...todayTemps),
                temp: todayMaxTemp,
                condition: todayCondition,
                icon: todayIcon,
                isToday: true,
              })
            }
            // Future days - use forecast data
            else {
              if (dayGroups[dayKey]) {
                const temps = dayGroups[dayKey].map((f) => f.temp)
                const maxTemp = Math.max(...temps)
                const minTemp = Math.min(...temps)
                const mainCondition = dayGroups[dayKey][Math.floor(dayGroups[dayKey].length / 2)]?.condition ?? "Cloudy"
                const mainIcon = dayGroups[dayKey][Math.floor(dayGroups[dayKey].length / 2)]?.icon ?? "01d"

                finalForecast.push({
                  day: dayName,
                  date: targetDate,
                  maxTemp,
                  minTemp,
                  temp: maxTemp,
                  condition: mainCondition,
                  icon: mainIcon,
                  isToday: false,
                })
              } else {
                // Fallback: use today's data if forecast not available yet
                finalForecast.push({
                  day: dayName,
                  date: targetDate,
                  maxTemp: todayMaxTemp,
                  minTemp: Math.min(...todayTemps),
                  temp: todayMaxTemp,
                  condition: todayCondition,
                  icon: todayIcon,
                  isToday: false,
                })
              }
            }
          }

          console.log("🎯 Final Forecast Array (Today + next 4 days):", finalForecast)
          console.log("📊 Final Forecast Summary:", finalForecast.map(f => `${f.day}: ${f.temp}°C (${f.condition}) ${f.isToday ? '[TODAY]' : ''}`))
          
          setCurrentWeather(current)
          setForecast(finalForecast)
          setLoading(false)
        } catch (err) {
          console.error("Weather data fetch error:", err)
          setError(err.message || "Could not load weather data")
          setLoading(false)
        }
      },
      (geoError) => {
        console.error("Geolocation error:", geoError)
        setError("Could not get your location")
        setLoading(false)
      },
    )
  }, [])

  return { currentWeather, forecast, loading, error }
}

