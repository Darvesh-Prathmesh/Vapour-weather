"use client"

import { useEffect, useRef } from "react"
import { useSettings } from "@/hooks/useSettings"

export function useAutoRefresh(callback, dependencies = []) {
  const { settings } = useSettings()
  const callbackRef = useRef(callback)
  const intervalRef = useRef(null)

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only set up auto-refresh if enabled and interval is set
    if (settings.autoRefresh && settings.refreshInterval > 0) {
      const intervalMs = settings.refreshInterval * 60 * 1000 // Convert minutes to milliseconds

      // Call immediately on mount/change
      callbackRef.current()

      // Set up interval
      intervalRef.current = setInterval(() => {
        callbackRef.current()
      }, intervalMs)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [settings.autoRefresh, settings.refreshInterval, ...dependencies])
}

