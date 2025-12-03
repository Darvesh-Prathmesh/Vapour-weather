import { WeatherInfo } from "@/components/weather-info"
import { CityWeatherCards } from "@/components/city-weather-cards"

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 overflow-hidden px-4 md:px-6 lg:px-0">
      {/* Weather Info - takes full width on mobile, main area on desktop */}
      <div className="flex-1 min-w-0">
        <WeatherInfo />
      </div>

      {/* City weather cards - stack below on mobile, on the right for large screens */}
      {/* 
        TO FINE‑TUNE HORIZONTAL POSITION ON DESKTOP:
        - Move RIGHT: increase lg:mr-[Xpx]
        - Move LEFT: decrease/remove lg:mr-[Xpx] or use lg:ml-[Xpx]
      */}
      <div className="shrink-0 w-full lg:w-auto lg:mr-[100px] lg:mt-[50px]">
        <CityWeatherCards />
      </div>
    </div>
  )
}