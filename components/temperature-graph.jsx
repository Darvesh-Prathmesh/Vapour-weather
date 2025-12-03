"use client"

import { CloudRain, Sun, Cloud, CloudDrizzle, CloudLightning, Snowflake, Wind } from "lucide-react"

const weatherIcons = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning,
  Snow: Snowflake,
  Mist: Wind,
  Fog: Wind,
  Haze: Wind,
}

function getWeatherIcon(condition) {
  return weatherIcons[condition] || Cloud
}

// Convert temperatures to Y positions (inverted because SVG y goes down)
function tempToY(temp, minTemp, maxTemp, graphHeight) {
  return graphHeight - ((temp - minTemp) / (maxTemp - minTemp)) * graphHeight
}

const defaultForecast = [
  { day: "Sunday", temp: 11, condition: "Rain" },
  { day: "Monday", temp: 13, condition: "Rain" },
  { day: "Tuesday", temp: 14, condition: "Rain" },
  { day: "Wednesday", temp: 10, condition: "Rain", isToday: true },
  { day: "Thursday", temp: 19, condition: "Clear" },
  { day: "Friday", temp: 12, condition: "Rain" },
]

export function TemperatureGraph({ forecast = defaultForecast }) {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-white/60 text-sm">Loading forecast...</div>
      </div>
    )
  }

  // Prepare forecast data with icons
  const forecastData = forecast.map((item) => ({
    day: item.day,
    temp: item.temp,
    icon: getWeatherIcon(item.condition),
    active: item.isToday || false,
  }))

  const displayData = forecastData.length >= 5 ? forecastData.slice(0, 6) : forecastData

  // Calculate temperature range
  const temps = displayData.map((d) => d.temp)
  const minTemp = Math.min(...temps) - 3
  const maxTemp = Math.max(...temps) + 3
  const graphHeight = 200
  const graphWidth = 1000

  // Alignment offset: adjust this value to fine-tune point alignment
  // Positive values move points right, negative values move points left
  const alignmentOffset = 0

  // Calculate x positions to align with flex-1 columns (centered in each column)
  // Each flex-1 item takes 100% / numItems of the width
  // The center of each column is at (index + 0.5) * (100% / numItems)
  const numItems = displayData.length
  const itemWidthPercent = 100 / numItems
  
  const points = displayData.map((data, index) => {
    // Calculate center position of each flex-1 column
    const centerPercent = (index + 0.5) * itemWidthPercent
    const x = (centerPercent / 100) * graphWidth + alignmentOffset
    
    return {
      x,
      y: tempToY(data.temp, minTemp, maxTemp, graphHeight),
      ...data,
    }
  })

  // Create smooth curve path using bezier curves
  const createSmoothPath = () => {
    if (points.length < 2) return ""

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const controlPointX = (current.x + next.x) / 2

      path += ` C ${controlPointX} ${current.y}, ${controlPointX} ${next.y}, ${next.x} ${next.y}`
    }

    return path
  }

  const createAreaPath = () => {
    const linePath = createSmoothPath()
    if (!linePath) return ""
    return `${linePath} L ${points[points.length - 1].x} ${graphHeight + 10} L ${points[0].x} ${graphHeight + 10} Z`
  }

  return (
    <div className="w-full">
      {/* Graph container */}
      <div className="relative mb-6">
        {/* Temperature labels and icons row */}
        <div className="flex justify-between items-end mb-6">
          {displayData.map((data, index) => {
            const Icon = data.icon
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-3">
                <span
                  className={`text-3xl font-bold transition-all duration-300 ${
                    data.active ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "text-white/70"
                  }`}
                >
                  {data.temp}°
                </span>
                <div
                  className={`p-2.5 rounded-full transition-all duration-300 ${
                    data.active ? "bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : ""
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 transition-all duration-300 ${
                      data.active ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "text-white/50"
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* SVG Graph */}
        <div className="relative h-56 w-full">
          <svg
            viewBox={`-10 -10 ${graphWidth + 20} ${graphHeight + 40}`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(147,197,253,0.5)" />
                <stop offset="30%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="50%" stopColor="rgba(255,255,255,1)" />
                <stop offset="70%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(147,197,253,0.5)" />
              </linearGradient>

              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <radialGradient id="activeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>

              <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(147,197,253,0.6)" />
                <stop offset="100%" stopColor="rgba(147,197,253,0)" />
              </radialGradient>
            </defs>

            <path d={createAreaPath()} fill="url(#areaGradient)" />

            <path
              d={createSmoothPath()}
              fill="none"
              stroke="rgba(147,197,253,0.3)"
              strokeWidth="6"
              filter="url(#glow)"
            />

            {/* Main curve line with enhanced glow */}
            <path
              d={createSmoothPath()}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                {point.active && (
                  <>
                    <circle cx={point.x} cy={point.y} r="20" fill="url(#pulseGlow)" className="animate-pulse" />
                    {/* Active point outer glow */}
                    <circle cx={point.x} cy={point.y} r="14" fill="url(#activeGlow)" />
                    <line
                      x1={point.x}
                      y1={point.y + 10}
                      x2={point.x}
                      y2={graphHeight + 15}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                    />
                    <circle cx={point.x} cy={graphHeight + 15} r="3" fill="rgba(255,255,255,0.5)" />
                  </>
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.active ? 8 : 5}
                  fill={point.active ? "white" : "rgba(255,255,255,0.5)"}
                  filter={point.active ? "url(#glow)" : undefined}
                  className="transition-all duration-300"
                />
                {/* Inner point accent */}
                {point.active && <circle cx={point.x} cy={point.y} r="4" fill="rgba(99,149,199,0.9)" />}
                {/* Small inner highlight */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.active ? 2 : 1.5}
                  fill={point.active ? "white" : "rgba(255,255,255,0.8)"}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex justify-between">
        {displayData.map((data, index) => (
          <div key={index} className="flex-1 text-center">
            <span
              className={`text-base font-medium transition-all duration-300 ${
                data.active ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "text-white/50"
              }`}
            >
              {data.day}
            </span>
            {data.active && (
              <div className="flex justify-center mt-2">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}