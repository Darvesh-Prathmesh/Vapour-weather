"use client"

import { useSettings } from "@/hooks/useSettings"
import {
  convertTemperature,
  getTemperatureUnit,
  convertWindSpeed,
  getWindSpeedUnit,
  convertPrecipitation,
  getPrecipitationUnit,
  convertVisibility,
  getVisibilityUnit,
  convertPressure,
  getPressureUnit,
  formatTime as formatTimeUtil,
} from "@/lib/unitConverter"

export function useUnitConverter() {
  const { settings } = useSettings()

  return {
    // Temperature
    temperature: (celsius) => convertTemperature(celsius, settings.temperatureUnit),
    temperatureUnit: () => getTemperatureUnit(settings.temperatureUnit),
    
    // Wind Speed
    windSpeed: (ms) => convertWindSpeed(ms, settings.windSpeedUnit),
    windSpeedUnit: () => getWindSpeedUnit(settings.windSpeedUnit),
    
    // Precipitation
    precipitation: (mm) => convertPrecipitation(mm, settings.precipitationUnit),
    precipitationUnit: () => getPrecipitationUnit(settings.precipitationUnit),
    
    // Visibility
    visibility: (km) => convertVisibility(km, settings.visibilityUnit),
    visibilityUnit: () => getVisibilityUnit(settings.visibilityUnit),
    
    // Pressure
    pressure: (hpa) => convertPressure(hpa, settings.pressureUnit),
    pressureUnit: () => getPressureUnit(settings.pressureUnit),
    
    // Time Format
    formatTime: (date) => formatTimeUtil(date, settings.timeFormat),
    
    // Settings reference
    settings,
  }
}

