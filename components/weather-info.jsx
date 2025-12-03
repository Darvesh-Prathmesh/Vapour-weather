"use client"

import React from "react"
import { CloudRain, Cloud, Sun, CloudDrizzle, CloudLightning, Snowflake, Wind } from "lucide-react"
import { useWeatherData } from "@/hooks/useWeatherData"
import { TemperatureGraph } from "./temperature-graph"

const weatherIcons = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning,
  Snow: Snowflake,
  Mist: Wind,
  Fog: Wind,
  Haze: Wind,
}

const weatherTemplates = [
  {
    weather_type: "THUNDERSTORM",
    main_status: "Storm with Heavy Rain, Thunder and Lightning",
    description_template: "A furious storm is rolling in, bringing thunder and lightning. Current temperature is [CURRENT_TEMP]°C, with highs forecast around [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. Wind from the [WIND_DIRECTION] at [WIND_SPEED] mph (gusting [WIND_SPEED_MAX] mph). Humidity is [HUMIDITY]%, with heavy downpour expected. Visibility reduced to [VISIBILITY] km.",
  },
  {
    weather_type: "RAIN",
    main_status: "Moderate and Steady Rain, Grey Skies",
    description_template: "Grey skies persist as steady rain falls throughout the day. Current temperature is [CURRENT_TEMP]°C, with highs around [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. Expect gentle breezes from the [WIND_DIRECTION] at [WIND_SPEED] mph. Humidity is [HUMIDITY]%. Cloud cover is [CLOUDINESS]%. Rainfall expected to be less than an inch.",
  },
  {
    weather_type: "DRIZZLE",
    main_status: "Overcast with Light Drizzle, Cool and Damp",
    description_template: "A soft gray sky hangs over the area with fine drizzle and cool, damp air. Current temperature is [CURRENT_TEMP]°C, reaching up to [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. Light wind from the [WIND_DIRECTION] at [WIND_SPEED] mph. Humidity is [HUMIDITY]% with [CLOUDINESS]% cloud cover. Pack a light jacket as the air is clammy.",
  },
  {
    weather_type: "SNOW",
    main_status: "Heavy Snowfall and Flurries, Cold Arctic Air",
    description_template: "Heavy snow is falling, accumulating quickly under cold, Arctic air. Current temperature is [CURRENT_TEMP]°C, with highs not exceeding [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. Winds from the [WIND_DIRECTION] gusting up to [WIND_SPEED] mph. Visibility is reduced to [VISIBILITY] km. Cloud cover is [CLOUDINESS]%.",
  },
  {
    weather_type: "CLEAR",
    main_status: "Clear Sky and Brilliant Sunshine, Perfect Weather",
    description_template: "A fine, clear day with a cloudless blue sky and gentle sunshine. Current temperature is [CURRENT_TEMP]°C, climbing to a mild [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. A light breeze from the [WIND_DIRECTION] at [WIND_SPEED] mph is expected. Humidity is [HUMIDITY]% with excellent visibility of [VISIBILITY] km. Perfect weather for outdoor activities.",
  },
  {
    weather_type: "CLOUDS_FEW",
    main_status: "Mostly Sunny with Few Clouds, Gorgeous Day",
    description_template: "Bright and sunny with a few fluffy white clouds drifting across the sky. Current temperature is [CURRENT_TEMP]°C, with highs around [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. Wind from the [WIND_DIRECTION] at [WIND_SPEED] mph. Cloud cover is [CLOUDINESS]% with [VISIBILITY] km visibility. A gorgeous day made for enjoying the outdoors.",
  },
  {
    weather_type: "CLOUDS_OVERCAST",
    main_status: "Overcast Sky, Cool and Gloomy",
    description_template: "Bleak and dreary day with a dense, granite-gray sky. Current temperature is [CURRENT_TEMP]°C, with highs only reaching [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. Expect a brisk wind from the [WIND_DIRECTION] at [WIND_SPEED] mph. Cloud cover is [CLOUDINESS]% with [VISIBILITY] km visibility. Humidity is [HUMIDITY]%. Rain chance is low, but the sky is foreboding.",
  },
  {
    weather_type: "FOG_MIST",
    main_status: "Dense Fog, Low Visibility",
    description_template: "A heavy blanket of fog covers the area, resulting in very low visibility of [VISIBILITY] km. Current temperature is [CURRENT_TEMP]°C, around [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. Air is still and clammy with almost no wind ([WIND_SPEED] mph from [WIND_DIRECTION]). Humidity is [HUMIDITY]% with [CLOUDINESS]% cloud cover. Drive with extreme caution.",
  },
  {
    weather_type: "EXTREME_HEAT",
    main_status: "Scorching Heat, Excessive Sun",
    description_template: "Blistering and oppressive heat with relentless sun. Current temperature is [CURRENT_TEMP]°C, with highs soaring to [HIGH_TEMP]°C. It feels like [FEELS_LIKE]°C. A slight, muggy breeze from the [WIND_DIRECTION] at [WIND_SPEED] mph. Humidity is [HUMIDITY]% with [VISIBILITY] km visibility. Remember to stay hydrated and avoid strenuous activity.",
  },
]

function getWeatherIcon(condition) {
  const Icon = weatherIcons[condition] || Cloud
  return Icon
}

function getWindDirection(degrees) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const index = Math.round(degrees / 22.5) % 16
  return directions[index] || "N"
}

function mapConditionToWeatherType(condition) {
  const conditionMap = {
    Thunderstorm: "THUNDERSTORM",
    Rain: "RAIN",
    Drizzle: "DRIZZLE",
    Snow: "SNOW",
    Clear: "CLEAR",
    Clouds: "CLOUDS_OVERCAST",
    Mist: "FOG_MIST",
    Fog: "FOG_MIST",
    Haze: "FOG_MIST",
  }
  return conditionMap[condition] || "CLEAR"
}

function getWeatherTemplate(condition) {
  const weatherType = mapConditionToWeatherType(condition)
  return weatherTemplates.find((t) => t.weather_type === weatherType) || weatherTemplates.find((t) => t.weather_type === "CLEAR")
}

function formatMainStatus(status) {
  // Split by comma and add line breaks
  return status.split(',').map((part, index, array) => (
    <React.Fragment key={index}>
      {part.trim()}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ))
}

function formatWeatherDescription(weatherData) {
  const template = getWeatherTemplate(weatherData.condition)
  if (!template) return ""

  // Extract all dynamic data from API
  const windDirection = getWindDirection(weatherData.windDirection || 0)
  const windSpeed = Math.round(weatherData.windSpeed || 0)
  const currentTemp = weatherData.temperature || 0
  const highTemp = weatherData.temperature || 0 // Using current temp as high for now
  const feelsLike = weatherData.feelsLike || currentTemp
  const humidity = weatherData.humidity || 0
  const visibility = weatherData.visibility || 0
  const cloudiness = weatherData.cloudiness || 0
  const windSpeedMax = Math.round(windSpeed + 2)

  // Replace all placeholders with dynamic API data
  let description = template.description_template
    .replace(/\[CURRENT_TEMP\]/g, currentTemp.toString())
    .replace(/\[HIGH_TEMP\]/g, highTemp.toString())
    .replace(/\[FEELS_LIKE\]/g, feelsLike.toString())
    .replace(/\[WIND_DIRECTION\]/g, windDirection)
    .replace(/\[WIND_SPEED\]/g, windSpeed.toString())
    .replace(/\[WIND_SPEED_MIN\]/g, Math.max(0, windSpeed - 2).toString())
    .replace(/\[WIND_SPEED_MAX\]/g, windSpeedMax.toString())
    .replace(/\[HUMIDITY\]/g, humidity.toString())
    .replace(/\[VISIBILITY\]/g, visibility.toString())
    .replace(/\[CLOUDINESS\]/g, cloudiness.toString())
    .replace(/\[RAIN_CHANCE\]/g, humidity.toString()) // Using humidity as rain chance indicator

  return description
}

export function WeatherInfo() {
  const { currentWeather, forecast, loading, error } = useWeatherData()

  if (loading) {
    return (
      <div className="flex flex-col justify-between h-full py-8">
        <div className="pl-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-6 animate-pulse">
            <span className="text-white text-sm font-medium">Loading...</span>
          </div>
          <div className="h-32 bg-white/10 rounded-2xl animate-pulse mb-4" />
          <div className="h-20 bg-white/10 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !currentWeather) {
    return (
      <div className="flex flex-col justify-between h-full py-8">
        <div className="rounded-2xl bg-red-500/20 border border-red-500/40 text-red-100 text-sm p-4">
          {error ?? "Could not load weather data"}
        </div>
      </div>
    )
  }

  const WeatherIcon = getWeatherIcon(currentWeather.condition)
  const weatherTemplate = getWeatherTemplate(currentWeather.condition)
  const mainStatus = weatherTemplate?.main_status || currentWeather.condition
  const description = formatWeatherDescription(currentWeather)

  return (
    <div className="flex flex-col justify-between h-full py-8">
      {/* Top section with badge and weather type */}
      <div className="pl-16">
        {/* Weather Forecast badge */}
        <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-6">
          <span className="text-white text-sm font-medium">Weather Forecast</span>
        </div>

        {/* Weather type */}
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
          {formatMainStatus(mainStatus)}
        </h1>

        {/* Weather description */}
        <p className="text-white/80 text-base max-w-2xl leading-relaxed">{description}</p>
      </div>

      {/* Bottom section with daily forecast */}
      <div className="mt-[100px]">
        <TemperatureGraph forecast={forecast} />
      </div>
    </div>
  )
}