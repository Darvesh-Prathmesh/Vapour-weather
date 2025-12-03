"use client";
import React, { useRef, useEffect, useState, useCallback } from "react"
import { MapPin, Wind, Droplets, Cloud, Sun, CloudRain, CloudDrizzle, CloudLightning, Snowflake } from "lucide-react"
import { useSavedCities } from "@/hooks/useSavedCities"
import { useCitiesWeather } from "@/hooks/useCitiesWeather"
import { useUnitConverter } from "@/hooks/useUnitConverter"
import { useAutoRefresh } from "@/hooks/useAutoRefresh"

const weatherIcons = {
  Clear: <Sun className="h-7 w-7" />,
  Clouds: <Cloud className="h-7 w-7" />,
  Rain: <CloudRain className="h-7 w-7" />,
  Drizzle: <CloudDrizzle className="h-7 w-7" />,
  Thunderstorm: <CloudLightning className="h-7 w-7" />,
  Snow: <Snowflake className="h-7 w-7" />,
  Mist: <Cloud className="h-7 w-7" />,
  Fog: <Cloud className="h-7 w-7" />,
  Haze: <Cloud className="h-7 w-7" />,
}

function CityCard({ city, isMain, scale, opacity, converter }) {
  // Convert wind speed from m/s (stored in raw data) to user's preferred unit
  const windSpeedMs = city.windSpeedRaw || (city.windSpeed / 2.23694) // Convert mph back to m/s if needed
  const convertedWindSpeed = converter.windSpeed(windSpeedMs)
  const windSpeedUnit = converter.windSpeedUnit()
  
  // Convert visibility from km to user's preferred unit
  const convertedVisibility = converter.visibility(city.visibility)
  const visibilityUnit = converter.visibilityUnit()

  if (isMain) {
    return (
      <div 
        className="rounded-4xl bg-white/20 backdrop-blur-md p-10 transition-all duration-200 ease-out"
        style={{
          transform: `scale(${scale})`,
          opacity: opacity,
          transformOrigin: 'top center'
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="h-6 w-6 text-white mt-0.5" />
          <span className="text-white font-medium text-xl">{city.city}</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="text-9xl font-light text-white tracking-tight">
            {converter.temperature(city.temperature)}{converter.temperatureUnit()}
          </div>
        </div>

        <div className="flex items-center gap-6 mt-6 text-white/80 text-lg">
          <div className="flex items-center gap-2">
            <Wind className="h-6 w-6" />
            <span>{convertedWindSpeed} {windSpeedUnit}</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6" />
            <span>{city.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6" />
            <span>{convertedVisibility} {visibilityUnit}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="rounded-4xl bg-white/20 backdrop-blur-md p-7 flex items-center justify-between transition-all duration-200 ease-out"
      style={{
        transform: `scale(${scale})`,
        opacity: opacity,
        transformOrigin: 'center'
      }}
    >
      <div>
        <p className="text-white/60 text-base">{city.country}</p>
        <p className="text-white font-medium text-lg">{city.city}</p>
        <p className="text-white/60 text-base">{city.condition}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-5xl font-light text-white">{converter.temperature(city.temperature)}{converter.temperatureUnit()}</span>
        <span className="text-white/60">{weatherIcons[city.condition] ?? <Cloud className="h-8 w-8" />}</span>
      </div>
    </div>
  )
}

export function CityWeatherCards() {
  const { cities, loading: citiesLoading } = useSavedCities()
  const [refreshKey, setRefreshKey] = useState(0)
  const converter = useUnitConverter()
  const scrollContainerRef = useRef(null)
  const [itemScales, setItemScales] = useState({})

  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  const { weatherData, loading: weatherLoading, error } = useCitiesWeather(cities, refreshKey)
  
  // Auto-refresh functionality
  useAutoRefresh(refreshData, [cities.length])

  const loading = citiesLoading || weatherLoading

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !weatherData || weatherData.length === 0) return

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect()
      const scrollTop = container.scrollTop

      const newScales = {}

      // Handle main card (first card) - shrinks based on scroll
      const mainCard = container.children[0]?.children[0]
      if (mainCard) {
        const mainCardRect = mainCard.getBoundingClientRect()
        const mainCardTop = mainCardRect.top - containerRect.top
        
        // Scale from 1.0 to 0.85 as it scrolls up
        const scrollProgress = Math.max(0, Math.min(1, -mainCardTop / 200))
        const mainScale = 1 - (scrollProgress * 0.15)
        const mainOpacity = 1 - (scrollProgress * 0.2)
        
        newScales['main-0'] = { scale: mainScale, opacity: mainOpacity }
      }

      // Handle other cards with center focus effect
      const containerCenter = containerRect.top + containerRect.height / 2

      weatherData.slice(1).forEach((city, index) => {
        const element = container.children[0]?.children[index + 1]
        if (!element) return

        const elementRect = element.getBoundingClientRect()
        const elementCenter = elementRect.top + elementRect.height / 2
        
        // Calculate distance from center
        const distance = Math.abs(containerCenter - elementCenter)
        const maxDistance = containerRect.height / 2
        
        // Calculate scale (1.0 at center, 0.92 at edges)
        const normalizedDistance = Math.min(distance / maxDistance, 1)
        const scale = 1 - (normalizedDistance * 0.08)
        
        // Calculate opacity (1.0 at center, 0.75 at edges)
        const opacity = 1 - (normalizedDistance * 0.25)

        newScales[city.id] = { scale, opacity }
      })

      setItemScales(newScales)
    }

    // Initial calculation
    handleScroll()

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [weatherData])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-[600px]">
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-10 animate-pulse h-64" />
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-7 animate-pulse h-32" />
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-7 animate-pulse h-32" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 w-[600px]">
        <div className="rounded-2xl bg-red-500/20 border border-red-500/40 text-red-100 text-base p-6">
          {error}
        </div>
      </div>
    )
  }

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="flex flex-col gap-6 w-[600px]">
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 text-center">
          <p className="text-white/60 text-base">No cities saved yet. Add cities from the map to see their weather!</p>
        </div>
      </div>
    )
  }

  // First city is the main one, rest are secondary
  const mainCity = weatherData[0] ? { ...weatherData[0], isMain: true } : null
  const otherCities = weatherData.slice(1)

  return (
    <div 
      ref={scrollContainerRef}
      className="flex flex-col gap-8 w-[600px] max-h-[calc(100vh-150px)] overflow-y-auto pr-4"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
        scrollBehavior: 'smooth'
      }}
    >
      <div className="flex flex-col gap-8 py-8">
         {mainCity && (
           <CityCard 
             city={mainCity} 
             isMain 
             scale={itemScales['main-0']?.scale || 1}
             opacity={itemScales['main-0']?.opacity || 1}
             converter={converter}
           />
         )}
         {otherCities.map((city) => (
           <CityCard 
             key={city.id} 
             city={city}
             scale={itemScales[city.id]?.scale || 1}
             opacity={itemScales[city.id]?.opacity || 1}
             converter={converter}
           />
         ))}
      </div>
    </div>
  )
}