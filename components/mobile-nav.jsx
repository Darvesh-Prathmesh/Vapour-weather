"use client"

import { LayoutGrid, Globe, MapPin, Settings, Bell } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { id: "dashboard", icon: LayoutGrid, label: "Home", href: "/" },
  { id: "world", icon: Globe, label: "World", href: "/add-city" },
  { id: "detail", icon: MapPin, label: "Forecast", href: "/detail-forecast" },
  { id: "notifications", icon: Bell, label: "Alerts", href: "/notification" },
  { id: "settings", icon: Settings, label: "Settings", href: "/weatherapp-setting" },
]

export function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 md:hidden">
      <div className="flex items-center justify-between rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-2xl text-[11px] font-medium transition-all duration-200",
                isActive
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-white" : "text-white/70")} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}


