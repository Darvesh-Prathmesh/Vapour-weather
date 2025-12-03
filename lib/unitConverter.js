import { useSettings } from "@/hooks/useSettings"

// Temperature conversion
export function convertTemperature(celsius, unit) {
  if (unit === "fahrenheit") {
    return Math.round((celsius * 9) / 5 + 32)
  }
  return Math.round(celsius)
}

export function getTemperatureUnit(unit) {
  return unit === "fahrenheit" ? "°F" : "°C"
}

// Wind speed conversion
export function convertWindSpeed(ms, unit) {
  // Input is in m/s
  switch (unit) {
    case "mph":
      return Math.round(ms * 2.23694) // m/s to mph
    case "knots":
      return Math.round(ms * 1.94384) // m/s to knots
    case "kmh":
    default:
      return Math.round(ms * 3.6) // m/s to km/h
  }
}

export function getWindSpeedUnit(unit) {
  switch (unit) {
    case "mph":
      return "mph"
    case "knots":
      return "knots"
    case "kmh":
    default:
      return "km/h"
  }
}

// Precipitation conversion
export function convertPrecipitation(mm, unit) {
  if (unit === "in") {
    return (mm / 25.4).toFixed(2)
  }
  return mm.toFixed(1)
}

export function getPrecipitationUnit(unit) {
  return unit === "in" ? "in" : "mm"
}

// Visibility conversion
export function convertVisibility(km, unit) {
  if (unit === "mi") {
    return (km * 0.621371).toFixed(1)
  }
  return km.toFixed(1)
}

export function getVisibilityUnit(unit) {
  return unit === "mi" ? "mi" : "km"
}

// Pressure conversion
export function convertPressure(hpa, unit) {
  if (unit === "inhg") {
    return (hpa * 0.02953).toFixed(2)
  }
  return Math.round(hpa)
}

export function getPressureUnit(unit) {
  return unit === "inhg" ? "inHg" : "hPa"
}

// Time format conversion
export function formatTime(date, format = "12") {
  if (!date) return "N/A"
  
  const d = date instanceof Date ? date : new Date(date)
  
  if (format === "24") {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }
  
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

// Helper to get all conversions at once
export function useUnitConversions() {
  // This will be used in components that have access to settings
  // For now, we'll create a helper that takes settings as parameter
  return null
}

