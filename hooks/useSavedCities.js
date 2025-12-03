"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "weather-app-saved-cities"

export function useSavedCities() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  // Load cities from localStorage on mount
  useEffect(() => {
    try {
      const savedCities = localStorage.getItem(STORAGE_KEY)
      if (savedCities) {
        setCities(JSON.parse(savedCities))
      }
    } catch (error) {
      console.error("Error loading cities from localStorage:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save cities to localStorage whenever cities change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
      } catch (error) {
        console.error("Error saving cities to localStorage:", error)
      }
    }
  }, [cities, loading])

  const addCity = (city) => {
    // Check if city already exists (by coordinates)
    const exists = cities.some(
      (c) => c.lat === city.lat && c.lng === city.lng
    )

    if (!exists) {
      const newCity = {
        id: Date.now().toString(),
        name: city.name || "Unknown Location",
        lat: city.lat,
        lng: city.lng,
        addedAt: new Date().toISOString(),
      }
      setCities((prev) => [...prev, newCity])
      return true
    }
    return false
  }

  const removeCity = (id) => {
    setCities((prev) => prev.filter((city) => city.id !== id))
  }

  const clearAllCities = () => {
    setCities([])
  }

  return {
    cities,
    addCity,
    removeCity,
    clearAllCities,
    loading,
  }
}

