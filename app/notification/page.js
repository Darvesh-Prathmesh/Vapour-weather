"use client"

import { useState, useEffect, useRef } from "react"
import { useNotifications } from "@/hooks/useNotifications"
import { useSettings } from "@/hooks/useSettings"
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  X,
  Trash2,
  CheckCircle,
  Settings,
  Check,
  Sparkles,
} from "lucide-react"

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const severityColors = {
  high: "bg-red-500/20 border-red-500/40 text-red-200",
  medium: "bg-yellow-500/20 border-yellow-500/40 text-yellow-200",
  low: "bg-blue-500/20 border-blue-500/40 text-blue-200",
}

const severityIcons = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: AlertCircle,
}

export default function NotificationPage() {
  const { notifications, activeAlerts, clearNotification, clearAllNotifications, markAsRead } =
    useNotifications()
  const { settings, updateSetting } = useSettings()
  const [filter, setFilter] = useState("all")
  const scrollContainerRef = useRef(null)
  const [itemScales, setItemScales] = useState({})

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : activeAlerts

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || filteredNotifications.length === 0) return

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect()
      const containerCenter = containerRect.top + containerRect.height / 2

      const newScales = {}

      filteredNotifications.forEach((notification) => {
        const element = document.getElementById(`notification-${notification.id}`)
        if (!element) return

        const elementRect = element.getBoundingClientRect()
        const elementCenter = elementRect.top + elementRect.height / 2
        
        const distance = Math.abs(containerCenter - elementCenter)
        const maxDistance = containerRect.height / 2
        
        const normalizedDistance = Math.min(distance / maxDistance, 1)
        const scale = 1 - (normalizedDistance * 0.05)
        const opacity = 1 - (normalizedDistance * 0.2)

        newScales[notification.id] = { scale, opacity }
      })

      setItemScales(newScales)
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [filteredNotifications])

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 group">
      <div className="flex-1">
        <div className="text-white font-medium group-hover:text-blue-400 transition-colors">{label}</div>
        {description && <div className="text-white/60 text-sm mt-1">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
          enabled ? "bg-blue-500 shadow-lg shadow-blue-500/50" : "bg-white/20"
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {enabled && (
            <Check className="h-4 w-4 text-blue-500 absolute top-1 left-1" />
          )}
        </div>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 md:px-8 pt-6 md:pt-8 pb-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/30 p-3 md:p-4 rounded-2xl relative">
                <Bell className="h-8 w-8 text-blue-400" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">Notifications</h1>
                <p className="text-white/60">
                  {notifications.length} total • {activeAlerts.length} active
                </p>
              </div>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all duration-200 flex items-center gap-2 border border-red-500/40 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30"
              >
                <Trash2 className="h-5 w-5" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden px-4 md:px-8 pb-6 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20 hover:border-white/30 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/20 p-2 rounded-xl">
                  <Settings className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Settings</h2>
              </div>
              <div className="space-y-3">
                <ToggleSwitch
                  enabled={settings.enableAlerts}
                  onChange={(value) => updateSetting("enableAlerts", value)}
                  label="Enable Alerts"
                  description="Master toggle"
                />
                {settings.enableAlerts && (
                  <div className="space-y-2 pl-4 border-l-2 border-blue-400/30">
                    <div className="text-white/80 font-medium mb-3 text-sm">Severe Weather</div>
                    {Object.entries(settings.severeWeatherAlerts).map(([key, value]) => (
                      <ToggleSwitch
                        key={key}
                        enabled={value}
                        onChange={(newValue) => updateSetting(`severeWeatherAlerts.${key}`, newValue)}
                        label={key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Total</p>
                    <p className="text-3xl font-bold text-white">{notifications.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Unread</p>
                    <p className="text-3xl font-bold text-white">
                      {notifications.filter(n => !n.read).length}
                    </p>
                  </div>
                  <Sparkles className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Active</p>
                    <p className="text-3xl font-bold text-white">{activeAlerts.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Notifications List */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: "all", label: "All", count: notifications.length },
                { id: "unread", label: "Unread", count: notifications.filter((n) => !n.read).length },
                { id: "active", label: "Active", count: activeAlerts.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === tab.id
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:scale-105"
                  }`}
                >
                  {tab.label} <span className="opacity-70">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Notifications List with Scroll */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
                scrollBehavior: "smooth",
              }}
            >
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">
                    {filter === "all"
                      ? "No notifications yet"
                      : filter === "unread"
                      ? "All notifications read"
                      : "No active alerts"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const Icon = severityIcons[notification.severity] || AlertCircle
                    const isRead = notification.read
                    const scale = itemScales[notification.id]?.scale || 1
                    const opacity = itemScales[notification.id]?.opacity || 1
                    
                    return (
                      <div
                        id={`notification-${notification.id}`}
                        key={notification.id}
                        className={`bg-white/5 rounded-xl p-5 border transition-all duration-200 hover:bg-white/10 ${
                          severityColors[notification.severity] || severityColors.low
                        } ${isRead ? "opacity-60" : ""} group`}
                        style={{
                          transform: `scale(${scale})`,
                          opacity: opacity,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 bg-white/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base">{notification.title}</h3>
                                {!isRead && (
                                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {!isRead && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                    title="Mark as read"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => clearNotification(notification.id)}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                  title="Dismiss"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm opacity-90 mb-3">{notification.message}</p>
                            <div className="flex items-center gap-3 text-xs opacity-70">
                              <span>{formatTime(notification.timestamp)}</span>
                              <span>•</span>
                              <span>{formatDate(notification.timestamp)}</span>
                              {notification.condition && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize px-2 py-1 bg-white/10 rounded">{notification.condition}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}