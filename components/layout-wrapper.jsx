"use client"

import { useState, useEffect } from "react"
import { WeatherSidebar } from "@/components/weather-sidebar"
import { WeatherHeader } from "@/components/weather-header"
import { useWeatherData } from "@/hooks/useWeatherData"
import { usePexelsImage } from "@/hooks/usePexelsImage"
import { useNotifications } from "@/hooks/useNotifications"
import { useWeatherAudio } from "@/hooks/useWeatherAudio"
import { ToastContainer } from "@/components/toast"
import { Spinner as AILoader } from "@/components/ui/ai-loader"

export function LayoutWrapper({ children }) {
  const { currentWeather, loading: weatherLoading } = useWeatherData()
  const condition = currentWeather?.condition || "Clear"
  const cityName = currentWeather?.city || ""
  const { imageUrl, loading: imageLoading } = usePexelsImage(condition, cityName)
  const { newAlerts, clearNewAlerts } = useNotifications()
  const [toastNotifications, setToastNotifications] = useState([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Initialize weather audio
  useWeatherAudio()

  // Check if everything is loaded
  useEffect(() => {
    if (!weatherLoading && !imageLoading && currentWeather) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [weatherLoading, imageLoading, currentWeather])

  // Handle new alerts and show toast notifications
  useEffect(() => {
    if (newAlerts.length > 0) {
      setToastNotifications((prev) => [...newAlerts, ...prev])
      clearNewAlerts()
    }
  }, [newAlerts, clearNewAlerts])

  const handleToastClose = (id) => {
    setToastNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Build background style
  const backgroundStyle = {
    backgroundColor: "black",
    backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    transition: "background-image 0.5s ease-in-out",
  }

  return (
    <main className="h-screen bg-cover bg-center p-4 relative overflow-hidden" style={backgroundStyle}>
      {/* AI Loader - Show during initial load */}
      {isInitialLoad && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
          <AILoader className="w-10 h-10" />
          <p className="text-lg font-medium">Welcome to Vapour Forecast</p>
        </div>
      )}
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      {/* Content with relative positioning */}
      <div className={`relative z-10 h-full ${isInitialLoad ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>
        {/* Fixed sidebar on the left */}
        <WeatherSidebar />

        {/* Main content shifted to the right of the sidebar */}
        <div className="ml-20 flex flex-col h-full overflow-hidden">
          {/* Header at the top, joined to the sidebar */}
          <div className="mb-6">
            <WeatherHeader />
          </div>

          {/* Page content */}
          {children}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer notifications={toastNotifications} onClose={handleToastClose} />
    </main>
  )
}

