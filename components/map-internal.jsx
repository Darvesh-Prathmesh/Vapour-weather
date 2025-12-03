"use client"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  })
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onMapClick({ lat, lng })
    },
  })
  return null
}

export function MapComponent({ onLocationSelect, initialCenter = [51.505, -0.09], initialZoom = 2 }) {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [cityName, setCityName] = useState("")

  // Reverse geocoding to get city name from coordinates
  const getCityName = async (lat, lng) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      if (!apiKey) {
        return "Unknown Location"
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const location = data[0]
          const name = location.name || ""
          const country = location.country || ""
          return `${name}${country ? `, ${country}` : ""}`
        }
      }
    } catch (error) {
      console.error("Error fetching city name:", error)
    }
    return "Unknown Location"
  }

  const handleMapClick = async (location) => {
    setSelectedLocation(location)
    const name = await getCityName(location.lat, location.lng)
    setCityName(name)
    
    if (onLocationSelect) {
      onLocationSelect({ ...location, name })
    }
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        className="rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{cityName || "Selected Location"}</p>
                <p className="text-sm text-gray-600">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-lg z-1000">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{cityName || "Selected Location"}</p>
              <p className="text-sm text-gray-600">
                Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
            <button
              onClick={() => {
                if (onLocationSelect) {
                  onLocationSelect({ ...selectedLocation, name: cityName }, true)
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add City
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

