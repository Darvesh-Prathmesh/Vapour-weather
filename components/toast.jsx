"use client"

import { useEffect, useState } from "react"
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react"

const severityIcons = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
  success: CheckCircle,
}

const severityColors = {
  high: "bg-red-500/20 border-red-500/50 text-red-200",
  medium: "bg-yellow-500/20 border-yellow-500/50 text-yellow-200",
  low: "bg-blue-500/20 border-blue-500/50 text-blue-200",
  success: "bg-green-500/20 border-green-500/50 text-green-200",
}

export function Toast({ notification, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = severityIcons[notification.severity] || Info

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(), 300) // Wait for animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] min-w-[320px] max-w-md bg-white/10 backdrop-blur-md rounded-xl p-4 border shadow-2xl transform transition-all duration-300 ${
        severityColors[notification.severity] || severityColors.low
      } ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-1">{notification.title}</div>
          <div className="text-xs opacity-90">{notification.message}</div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(), 300)
          }}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer({ notifications, onClose }) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: 9999 - index,
          }}
        >
          <Toast
            notification={notification}
            onClose={() => onClose(notification.id)}
          />
        </div>
      ))}
    </div>
  )
}

