"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSettings } from "@/hooks/useSettings"
import { useWeatherData } from "@/hooks/useWeatherData"

const NOTIFICATION_STORAGE_KEY = "weather-app-notifications"

export function useNotifications() {
  const { settings } = useSettings()
  const { currentWeather } = useWeatherData()
  const [notifications, setNotifications] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const [newAlerts, setNewAlerts] = useState([])
  const shownAlertsRef = useRef(new Set())

  // Load notification history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setNotifications(parsed)
        // Mark existing notifications as shown
        parsed.forEach((n) => shownAlertsRef.current.add(n.id))
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }, [])

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.error("Error saving notifications:", error)
    }
  }, [notifications])

  // Check weather conditions and trigger alerts
  useEffect(() => {
    if (!settings?.enableAlerts || !currentWeather) {
      setNewAlerts([])
      return
    }

    const alerts = []
    const now = new Date()

    // Check for severe weather conditions
    if (currentWeather.condition === "Thunderstorm" && settings.severeWeatherAlerts.thunderstorms) {
      alerts.push({
        id: `thunderstorm-${now.getTime()}`,
        type: "thunderstorms",
        title: "Thunderstorm Alert",
        message: `Thunderstorm detected in ${currentWeather.city}. Stay indoors and avoid open areas.`,
        severity: "high",
        timestamp: now,
        condition: currentWeather.condition,
      })
    }

    if (currentWeather.condition === "Rain" && currentWeather.humidity > 80 && settings.severeWeatherAlerts.floods) {
      alerts.push({
        id: `flood-${now.getTime()}`,
        type: "floods",
        title: "Heavy Rain Alert",
        message: `Heavy rainfall in ${currentWeather.city}. Risk of flooding. Exercise caution.`,
        severity: "medium",
        timestamp: now,
        condition: currentWeather.condition,
      })
    }

    if (currentWeather.condition === "Snow" && settings.severeWeatherAlerts.snow) {
      alerts.push({
        id: `snow-${now.getTime()}`,
        type: "snow",
        title: "Snow Alert",
        message: `Snowfall in ${currentWeather.city}. Drive carefully and dress warmly.`,
        severity: "medium",
        timestamp: now,
        condition: currentWeather.condition,
      })
    }

    // Extreme temperature alerts
    if (currentWeather.temperature > 35 && settings.severeWeatherAlerts.extremeHeat) {
      alerts.push({
        id: `heat-${now.getTime()}`,
        type: "extremeHeat",
        title: "Extreme Heat Warning",
        message: `Extreme heat in ${currentWeather.city} (${currentWeather.temperature}°C). Stay hydrated and avoid prolonged sun exposure.`,
        severity: "high",
        timestamp: now,
        condition: "Extreme Heat",
      })
    }

    if (currentWeather.temperature < 0 && settings.severeWeatherAlerts.extremeCold) {
      alerts.push({
        id: `cold-${now.getTime()}`,
        type: "extremeCold",
        title: "Extreme Cold Warning",
        message: `Freezing temperatures in ${currentWeather.city} (${currentWeather.temperature}°C). Dress warmly and protect exposed skin.`,
        severity: "high",
        timestamp: now,
        condition: "Extreme Cold",
      })
    }

    // High wind alerts
    if (currentWeather.windSpeed > 50 && settings.severeWeatherAlerts.hurricanes) {
      alerts.push({
        id: `wind-${now.getTime()}`,
        type: "hurricanes",
        title: "High Wind Warning",
        message: `Strong winds in ${currentWeather.city} (${currentWeather.windSpeed} mph). Secure outdoor objects.`,
        severity: "medium",
        timestamp: now,
        condition: "High Winds",
      })
    }

    // Check if these are new alerts (not already shown)
    const trulyNewAlerts = alerts.filter((alert) => !shownAlertsRef.current.has(alert.id))

    if (trulyNewAlerts.length > 0) {
      // Mark as shown
      trulyNewAlerts.forEach((alert) => shownAlertsRef.current.add(alert.id))

      // Add to notifications history
      setNotifications((prev) => [...trulyNewAlerts, ...prev].slice(0, 100)) // Keep last 100

      // Update active alerts
      setActiveAlerts((prev) => [...trulyNewAlerts, ...prev])

      // Set new alerts for toast display
      setNewAlerts(trulyNewAlerts)
    }
  }, [
    currentWeather?.condition,
    currentWeather?.temperature,
    currentWeather?.windSpeed,
    currentWeather?.humidity,
    currentWeather?.city,
    settings?.enableAlerts,
    settings?.severeWeatherAlerts?.thunderstorms,
    settings?.severeWeatherAlerts?.floods,
    settings?.severeWeatherAlerts?.snow,
    settings?.severeWeatherAlerts?.extremeHeat,
    settings?.severeWeatherAlerts?.extremeCold,
    settings?.severeWeatherAlerts?.hurricanes,
  ])

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setActiveAlerts([])
  }

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const clearNewAlerts = useCallback(() => {
    setNewAlerts([])
  }, [])

  return {
    notifications,
    activeAlerts,
    newAlerts,
    clearNotification,
    clearAllNotifications,
    markAsRead,
    clearNewAlerts,
  }
}

