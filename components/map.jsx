"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import the map to avoid SSR issues
const MapComponent = dynamic(
  () => import("./map-internal").then((mod) => mod.MapComponent),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-2xl">
        <p className="text-white/50">Loading map...</p>
      </div>
    )
  }
)

export function Map({ onLocationSelect, initialCenter = [51.505, -0.09], initialZoom = 2 }) {
  return <MapComponent onLocationSelect={onLocationSelect} initialCenter={initialCenter} initialZoom={initialZoom} />
}
