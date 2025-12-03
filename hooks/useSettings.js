"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "weather-app-settings"

const defaultSettings = {
  // Units of Measurement
  temperatureUnit: "celsius", // "celsius" or "fahrenheit"
  windSpeedUnit: "mph", // "kmh", "mph", or "knots"
  precipitationUnit: "mm", // "mm" or "in"
  visibilityUnit: "km", // "km" or "mi"
  pressureUnit: "hpa", // "hpa" or "inhg"
  timeFormat: "12", // "12" or "24"
  
  // Language
  language: "en", // "en", "es", "fr", etc.
  
  // Location & Data
  useCurrentLocation: true,
  autoRefresh: true,
  refreshInterval: 30, // minutes
  
  // Notifications
  enableAlerts: false,
  severeWeatherAlerts: {
    thunderstorms: true,
    floods: true,
    hurricanes: true,
    tornadoes: true,
    snow: true,
    extremeHeat: true,
    extremeCold: true,
  },
  
  // Audio
  enableAudio: true,
  audioVolume: 0.3, // 0.0 to 1.0
}

export function useSettings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // Merge with defaults to ensure all keys exist
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch (error) {
        console.error("Error saving settings to localStorage:", error)
      }
    }
  }, [settings, loading])

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      // Handle nested keys (e.g., "severeWeatherAlerts.thunderstorms")
      if (key.includes(".")) {
        const [parent, child] = key.split(".")
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }
      }
      return {
        ...prev,
        [key]: value,
      }
    })
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return {
    settings,
    updateSetting,
    resetSettings,
    loading,
  }
}

