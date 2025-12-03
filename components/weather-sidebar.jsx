"use client"
import React from "react"
import { LayoutGrid,  Globe, MapPin, Calendar, Settings, RefreshCw, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useSettings } from "@/hooks/useSettings"

export function WeatherSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { settings, updateSetting } = useSettings()
  
  const navItems = [
    { icon: <LayoutGrid className="h-5 w-5" />, label: "Dashboard", href: "/" },
    { icon: <Globe className="h-5 w-5" />, label: "World", href: "/add-city" },
    { icon: <MapPin className="h-5 w-5" />, label: "Locations", href: "/detail-forecast" },
  ]

  return (
    <aside className="hidden md:flex fixed left-4 top-4 bottom-4 w-20 flex-col items-center justify-between rounded-2xl bg-white/20 backdrop-blur-xl backdrop-saturate-150 py-6 z-50" style={{ backdropFilter: 'blur(24px) saturate(180%)' }}>
      {/* Logo */}
      <div className="flex flex-col items-center gap-8">
        <div className="text-white/90">
          <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 10C4 10 8 6 16 6C24 6 28 10 28 10"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M4 16C4 16 8 12 16 12C24 12 28 16 28 16"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M4 22C4 22 8 18 16 18C24 18 28 22 28 22"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <button
                key={index}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                  isActive ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80",
                )}
                aria-label={item.label}
                onClick={() => router.push(item.href)}
              >
                {/* Active indicator */}
                {isActive && <span className="absolute left-0 h-6 w-1 rounded-r-full bg-white" />}
                {item.icon}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => updateSetting("enableAudio", !settings.enableAudio)}
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
            settings.enableAudio
              ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
              : "text-white/50 hover:bg-white/5 hover:text-white/80"
          )}
          aria-label={settings.enableAudio ? "Mute Audio" : "Unmute Audio"}
          title={settings.enableAudio ? "Mute Audio" : "Unmute Audio"}
        >
          {settings.enableAudio ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </button>
        <button
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
            pathname === "/weatherapp-setting" 
              ? "bg-white/10 text-white" 
              : "text-white/50 hover:bg-white/5 hover:text-white/80"
          )}
          aria-label="Settings"
          onClick={() => router.push("/weatherapp-setting")}
        >
          {pathname === "/weatherapp-setting" && (
            <span className="absolute left-0 h-6 w-1 rounded-r-full bg-white" />
          )}
          <Settings className="h-5 w-5" />
        </button>
        <button
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white/80"
          aria-label="Refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>
    </aside>
  )
}

