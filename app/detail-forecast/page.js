"use client"

import { useState, useEffect, useCallback } from "react"
import { useDetailedForecast } from "@/hooks/useDetailedForecast"
import { useUnitConverter } from "@/hooks/useUnitConverter"
import { useAutoRefresh } from "@/hooks/useAutoRefresh"
import { 
  MapPin, 
  Clock, 
  Thermometer, 
  Wind, 
  Droplets, 
  Gauge, 
  Eye, 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Snowflake,
  Sunrise,
  Sunset,
  Activity,
  AlertCircle,
  ChevronRight
} from "lucide-react"

const weatherIcons = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning,
  Snow: Snowflake,
  Mist: Cloud,
  Fog: Cloud,
  Haze: Cloud,
}

function getWeatherIcon(condition) {
  return weatherIcons[condition] || Cloud
}

function getWindDirection(degrees) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  return directions[Math.round(degrees / 22.5) % 16]
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

export default function DetailForecastPage() {
  const [location, setLocation] = useState({ lat: null, lon: null })
  const [refreshKey, setRefreshKey] = useState(0)
  const converter = useUnitConverter()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocation({ lat: 51.505, lon: -0.09 })
        }
      )
    } else {
      setLocation({ lat: 51.505, lon: -0.09 })
    }
  }, [])

  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  const { forecastData, loading, error } = useDetailedForecast(location.lat, location.lon, refreshKey)
  
  // Auto-refresh functionality
  useAutoRefresh(refreshData, [location.lat, location.lon])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-white text-lg md:text-xl animate-pulse text-center">Loading forecast data...</div>
      </div>
    )
  }

  if (error || !forecastData) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-red-500/20 border border-red-500/40 text-red-100 text-sm md:text-base p-4 md:p-6 rounded-2xl text-center">
          {error || "Could not load forecast data"}
        </div>
      </div>
    )
  }

  const { current, hourlyForecast, dailyForecast, airQuality, moonPhase } = forecastData
  const WeatherIcon = getWeatherIcon(current.condition)

  return (
    <div className="min-h-screen overflow-hidden flex flex-col">
      {/* Header Section - Fixed */}
      <div className="shrink-0 px-4 md:px-8 pt-6 md:pt-8 pb-4">
        <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-500/20 p-2 rounded-xl">
                  <MapPin className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white">
                  {current.city}
                  {current.state && `, ${current.state}`}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-white/60 ml-10 md:ml-14 text-xs md:text-sm flex-wrap">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{converter.formatTime(current.lastUpdate)} • {formatDate(current.lastUpdate)}</span>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="flex items-center gap-3 md:gap-4 justify-start md:justify-end">
                <WeatherIcon className="h-14 w-14 md:h-20 md:w-20 text-white animate-pulse" />
                <div>
                  <div className="text-5xl md:text-7xl font-light text-white leading-none">
                    {converter.temperature(current.temperature)}{converter.temperatureUnit()}
                  </div>
                  <div className="text-white/80 text-lg capitalize mt-1">{current.description}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-6 md:pb-8" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
        scrollBehavior: 'smooth'
      }}>
        <div className="space-y-6">
          {/* Today's Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Thermometer className="h-4 w-4" />
                <span className="text-xs">Current</span>
              </div>
              <div className="text-3xl font-bold text-white">{converter.temperature(current.temperature)}{converter.temperatureUnit()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Thermometer className="h-4 w-4" />
                <span className="text-xs">Feels Like</span>
              </div>
              <div className="text-3xl font-bold text-white">{converter.temperature(current.feelsLike)}{converter.temperatureUnit()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Sun className="h-4 w-4" />
                <span className="text-xs">High</span>
              </div>
              <div className="text-3xl font-bold text-white">{converter.temperature(current.tempMax)}{converter.temperatureUnit()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Moon className="h-4 w-4" />
                <span className="text-xs">Low</span>
              </div>
              <div className="text-3xl font-bold text-white">{converter.temperature(current.tempMin)}{converter.temperatureUnit()}</div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Hourly Forecast */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Hourly Forecast
                </h2>
                <div className="overflow-x-auto">
                  <div className="flex gap-3 pb-2">
                    {hourlyForecast.slice(0, 12).map((hour, index) => {
                      const HourIcon = getWeatherIcon(hour.condition)
                      return (
                        <div 
                          key={index} 
                          className="bg-white/5 rounded-xl p-3 min-w-[100px] text-center hover:bg-white/10 transition-all duration-200 hover:scale-105"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="text-white/60 text-xs mb-2">
                            {index === 0 ? "Now" : converter.formatTime(hour.time)}
                          </div>
                          <HourIcon className="h-6 w-6 mx-auto mb-2 text-white" />
                          <div className="text-lg font-bold text-white mb-1">{converter.temperature(hour.temperature)}{converter.temperatureUnit()}</div>
                          <div className="text-white/60 text-xs">{hour.pop}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Detailed Metrics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Wind, label: "Wind", value: `${converter.windSpeed(current.windSpeed)} ${converter.windSpeedUnit()}`, extra: getWindDirection(current.windDirection) },
                    { icon: Droplets, label: "Humidity", value: `${current.humidity}%` },
                    { icon: Droplets, label: "Dew Point", value: `${converter.temperature(current.dewPoint)}${converter.temperatureUnit()}` },
                    { icon: Gauge, label: "Pressure", value: `${converter.pressure(current.pressure)} ${converter.pressureUnit()}` },
                    { icon: Eye, label: "Visibility", value: `${converter.visibility(current.visibility)} ${converter.visibilityUnit()}` },
                    { icon: Sun, label: "UV Index", value: current.uvIndex || "N/A" },
                  ].map((metric, index) => (
                    <div 
                      key={index} 
                      className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex items-center gap-2 text-white/60 mb-2">
                        <metric.icon className="h-4 w-4" />
                        <span className="text-xs">{metric.label}</span>
                      </div>
                      <div className="text-xl font-bold text-white">{metric.value}</div>
                      {metric.extra && <div className="text-white/60 text-xs mt-1">{metric.extra}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Astronomy */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sun className="h-5 w-5 text-blue-400" />
                  Astronomy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 hover:scale-105">
                    <div className="flex items-center gap-2 text-white/60 mb-2">
                      <Sunrise className="h-5 w-5" />
                      <span className="text-xs">Sunrise</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {current.sunrise ? converter.formatTime(current.sunrise) : "N/A"}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 hover:scale-105">
                    <div className="flex items-center gap-2 text-white/60 mb-2">
                      <Sunset className="h-5 w-5" />
                      <span className="text-xs">Sunset</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {current.sunset ? converter.formatTime(current.sunset) : "N/A"}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 hover:scale-105">
                    <div className="flex items-center gap-2 text-white/60 mb-2">
                      <Moon className="h-5 w-5" />
                      <span className="text-xs">Moon</span>
                    </div>
                    <div className="text-lg font-bold text-white">{moonPhase}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* 7-Day Forecast */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-400" />
                  7-Day Forecast
                </h2>
                <div className="space-y-2">
                  {dailyForecast.map((day, index) => {
                    const DayIcon = getWeatherIcon(day.condition)
                    return (
                      <div
                        key={index}
                        className={`bg-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all duration-200 group ${
                          day.isToday ? "ring-2 ring-blue-400" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-20">
                            <div className="text-white font-semibold text-sm">{day.isToday ? "Today" : day.day}</div>
                            <div className="text-white/60 text-xs">
                              {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                          </div>
                          <DayIcon className="h-6 w-6 text-white" />
                          <div className="text-white/60 text-sm capitalize">{day.condition}</div>
                        </div>
                           <div className="flex items-center gap-4">
                             <div className="text-white/60 text-sm">{day.pop}%</div>
                             <div className="text-white font-semibold">
                               {converter.temperature(day.maxTemp)}{converter.temperatureUnit()} / {converter.temperature(day.minTemp)}{converter.temperatureUnit()}
                             </div>
                          <ChevronRight className="h-4 w-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Air Quality */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Air Quality
                </h2>
                {airQuality ? (
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-white/60">
                          <Activity className="h-4 w-4" />
                          <span className="text-sm">AQI</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          airQuality.aqi <= 2 ? "bg-green-500/20 text-green-300" :
                          airQuality.aqi === 3 ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-red-500/20 text-red-300"
                        }`}>
                          {airQuality.aqiLabel}
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-white">{airQuality.aqi}/5</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "PM2.5", value: airQuality.pm2_5 },
                        { label: "PM10", value: airQuality.pm10 },
                        { label: "O₃", value: airQuality.o3 },
                        { label: "NO₂", value: airQuality.no2 },
                      ].map((item, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200 hover:scale-105">
                          <div className="text-white/60 text-xs mb-1">{item.label}</div>
                          <div className="text-lg font-semibold text-white">{item.value.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-4 text-center text-white/60">
                    Air quality data not available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}