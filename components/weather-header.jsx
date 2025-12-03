"use client";
import { Plus, Search, Bell, Volume2, VolumeX } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useSettings } from "@/hooks/useSettings"

export function WeatherHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { settings, updateSetting } = useSettings()

  return (
    <header className="flex items-center justify-end w-full px-4 md:px-8">
      {/* Action buttons - Positioned with pixel-based margins */}
      {/* TO MOVE BUTTONS LEFT/RIGHT USING PIXELS:
          - Move RIGHT: Add "ml-[Xpx]" (e.g., ml-[100px] moves 100px right)
          - Move LEFT: Add "mr-[Xpx]" (e.g., mr-[100px] moves 100px left)
          - Example: className="flex items-center gap-4 ml-[50px]" moves 50px right
      */}
      <div className="flex items-center gap-3 md:gap-4 mr-0 lg:mr-[100px]">
        <button 
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md flex items-center justify-center text-white hover:from-white/30 hover:to-white/20 transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-white/20 border border-white/20"
          aria-label="Add"
          title="Add"
        >
          <Plus className="w-6 h-6 md:w-7 md:h-7" />
        </button>

        <button 
          onClick={() => {
            // Mark user interaction for audio playback
            if (typeof window !== 'undefined' && !window.hasUserInteracted) {
              window.hasUserInteracted = true
              // Trigger a custom event to notify audio hook
              document.dispatchEvent(new Event('userInteraction'))
            }
            updateSetting("enableAudio", !settings.enableAudio)
          }}
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg border ${
            settings.enableAudio 
              ? "bg-gradient-to-br from-blue-500/40 to-blue-600/30 hover:from-blue-500/50 hover:to-blue-600/40 shadow-blue-500/30 border-blue-400/30" 
              : "bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 shadow-white/20 border-white/20"
          }`}
          aria-label={settings.enableAudio ? "Disable Music" : "Enable Music"}
          title={settings.enableAudio ? "Disable Music" : "Enable Music"}
        >
          {settings.enableAudio ? (
            <Volume2 className="w-6 h-6 md:w-7 md:h-7" />
          ) : (
            <VolumeX className="w-6 h-6 md:w-7 md:h-7" />
          )}
        </button>

        <button 
          onClick={() => router.push("/notification")}
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg border relative ${
            pathname === "/notification" 
              ? "bg-gradient-to-br from-blue-500/40 to-blue-600/30 hover:from-blue-500/50 hover:to-blue-600/40 shadow-blue-500/30 border-blue-400/30" 
              : "bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 shadow-white/20 border-white/20"
          }`}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-6 h-6 md:w-7 md:h-7" />
          {/* Optional: Add notification badge */}
          {/* <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            3
          </span> */}
        </button>
      </div>
    </header>
  )
}