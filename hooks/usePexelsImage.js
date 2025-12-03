"use client"
import { useState, useEffect } from "react"

const PEXELS_API_KEY = "IgvoSTWaXBW7BPfWv6vwxSPNNLmjGDdXOSn5PdA5KPRU9mwUr0Mvgx5s"
const PEXELS_API_URL = "https://api.pexels.com/v1/search"

// Map weather conditions to search terms for better image results
function getSearchQuery(condition, cityName) {
  const conditionMap = {
    Clear: "sunny clear sky",
    Clouds: "cloudy sky",
    Rain: "rainy weather",
    Drizzle: "drizzle rain",
    Thunderstorm: "thunderstorm lightning",
    Snow: "snow winter",
    Mist: "mist fog",
    Fog: "fog mist",
    Haze: "haze foggy",
  }

  const weatherTerm = conditionMap[condition] || "weather"
  // Combine city name and weather condition for more specific results
  return `${cityName} ${weatherTerm}`
}

export function usePexelsImage(condition, cityName) {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!condition || !cityName) {
      setLoading(false)
      return
    }

    const fetchImage = async () => {
      try {
        setLoading(true)
        setError(null)

        const query = getSearchQuery(condition, cityName)
        const url = `${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`

        const response = await fetch(url, {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        })

        if (!response.ok) {
          throw new Error(`Pexels API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.photos && data.photos.length > 0) {
          // Pick a random image from the results for variety
          const randomIndex = Math.floor(Math.random() * data.photos.length)
          const selectedPhoto = data.photos[randomIndex]
          setImageUrl(selectedPhoto.src.large2x || selectedPhoto.src.large || selectedPhoto.src.medium)
        } else {
          // Fallback: try searching with just weather condition
          const fallbackQuery = getSearchQuery(condition, "")
          const fallbackUrl = `${PEXELS_API_URL}?query=${encodeURIComponent(fallbackQuery)}&per_page=10&orientation=landscape`
          
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              Authorization: PEXELS_API_KEY,
            },
          })

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            if (fallbackData.photos && fallbackData.photos.length > 0) {
              const randomIndex = Math.floor(Math.random() * fallbackData.photos.length)
              const selectedPhoto = fallbackData.photos[randomIndex]
              setImageUrl(selectedPhoto.src.large2x || selectedPhoto.src.large || selectedPhoto.src.medium)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Pexels image:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [condition, cityName])

  return { imageUrl, loading, error }
}

