import { WeatherInfo } from "@/components/weather-info"
import { CityWeatherCards } from "@/components/city-weather-cards"

export default function Home() {
  return (
    <>
      {/* Content area: WeatherInfo in center, CityWeatherCards on right */}
      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Weather Info in the middle, below header */}
        <div className="flex-1">
          <WeatherInfo />
        </div>

        {/* City weather cards to the right */}
        {/* 
          TO MOVE CARDS LEFT/RIGHT:
          - Move RIGHT: Add mr-[Xpx] (e.g., mr-4 = 16px right, mr-8 = 32px right)
          - Move LEFT: Add ml-[Xpx] (e.g., ml-4 = 16px left, ml-8 = 32px left)
          - Or use negative margins: -mr-4, -ml-4, etc.
          - Examples: mr-10 (40px right), ml-20 (80px left), mr-[50px] (50px right)
        */}
        <div className="shrink-0 mr-[100px] mt-[50px]">
          <CityWeatherCards />
        </div>
      </div>
    </>
  )
}