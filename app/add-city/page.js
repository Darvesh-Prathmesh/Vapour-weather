"use client"

import { Map } from "@/components/map"
import { useState, useRef, useEffect } from "react"
import { useSavedCities } from "@/hooks/useSavedCities"
import { Trash2, MapPin, Plus, X } from "lucide-react"

export default function AddCityPage() {
  const [selectedCity, setSelectedCity] = useState(null)
  const { cities, addCity, removeCity, clearAllCities } = useSavedCities()
  const scrollContainerRef = useRef(null)
  const [itemScales, setItemScales] = useState({})

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect()
      const containerCenter = containerRect.top + containerRect.height / 2

      const newScales = {}

      cities.forEach((city, index) => {
        const element = container.children[0]?.children[index]
        if (!element) return

        const elementRect = element.getBoundingClientRect()
        const elementCenter = elementRect.top + elementRect.height / 2
        
        // Calculate distance from center
        const distance = Math.abs(containerCenter - elementCenter)
        const maxDistance = containerRect.height / 2
        
        // Calculate scale (1.0 at center, 0.92 at edges)
        const normalizedDistance = Math.min(distance / maxDistance, 1)
        const scale = 1 - (normalizedDistance * 0.08)
        
        // Calculate opacity (1.0 at center, 0.7 at edges)
        const opacity = 1 - (normalizedDistance * 0.3)

        newScales[city.id] = { scale, opacity }
      })

      setItemScales(newScales)
    }

    // Initial calculation
    handleScroll()

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [cities])

  const handleAddCity = (cityToAdd = null) => {
    const city = cityToAdd || selectedCity
    if (city) {
      const added = addCity(city)
      if (added) {
        setSelectedCity(null)
        alert(`City "${city.name}" added successfully!`)
      } else {
        alert("This city is already in your list!")
      }
    }
  }

  const handleLocationSelect = (location, shouldAdd = false) => {
    setSelectedCity(location)
    if (shouldAdd) {
      handleAddCity(location)
    }
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-8 pt-8 pb-4 ml-8">
        <h1 className="text-5xl font-bold text-white mb-3">Add City from Map</h1>
        <p className="text-white/60 text-lg">
          Click anywhere on the map to select a location. The city name will be fetched automatically.
        </p>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 overflow-hidden px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Map Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6 overflow-hidden">
            {/* Map Container */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/20 ml-8">
              <div className="h-[600px] rounded-2xl overflow-hidden">
                <Map onLocationSelect={handleLocationSelect} />
              </div>
            </div>


          </div>

          {/* Saved Cities Sidebar - Takes 1 column */}
          <div className="lg:col-span-1 overflow-hidden">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 h-[648px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Saved Cities</h2>
                {cities.length > 0 && (
                  <button
                    onClick={clearAllCities}
                    className="text-white/50 hover:text-red-400 text-sm transition-colors font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto pr-2" 
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
                  scrollBehavior: 'smooth'
                }}
              >
                {cities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="bg-white/5 rounded-full p-6 mb-4">
                      <MapPin className="h-12 w-12 text-white/30" />
                    </div>
                    <p className="text-white/50 text-base font-medium mb-2">No cities saved yet</p>
                    <p className="text-white/30 text-sm">Click on the map to add your first city</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cities.map((city, index) => {
                      const scale = itemScales[city.id]?.scale || 1
                      const opacity = itemScales[city.id]?.opacity || 1
                      
                      return (
                        <div
                          key={city.id}
                          className="transition-all duration-200 ease-out"
                          style={{
                            transform: `scale(${scale})`,
                            opacity: opacity,
                            transformOrigin: 'center'
                          }}
                        >
                          <div
                            className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-white/20 group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                                  <h3 className="font-semibold text-white truncate">{city.name}</h3>
                                </div>
                                <div className="text-xs text-white/50 space-y-1 font-mono">
                                  <p>Lat: {city.lat.toFixed(4)}</p>
                                  <p>Lng: {city.lng.toFixed(4)}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeCity(city.id)}
                                className="text-white/30 hover:text-red-400 transition-colors p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg"
                                title="Remove city"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {cities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 shrink-0">
                  <p className="text-white/40 text-sm text-center">
                    {cities.length} {cities.length === 1 ? 'city' : 'cities'} saved
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}