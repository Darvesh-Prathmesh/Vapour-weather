"use client"

import { useEffect, useRef, useState } from "react"
import { useSettings } from "@/hooks/useSettings"
import { useWeatherData } from "@/hooks/useWeatherData"

// Map weather conditions to audio files
const weatherAudioMap = {
  Clear: "/weather-background/sunny.wav",
  Clouds: "/weather-background/sunny 2.wav",
  Rain: "/weather-background/heavy rain.wav",
  Drizzle: "/weather-background/light_rain.wav",
  Thunderstorm: "/weather-background/thunderstorm.wav",
  Snow: "/weather-background/light_rain.wav",
  Mist: "/weather-background/windyy.mp3",
  Fog: "/weather-background/windyy.mp3",
  Haze: "/weather-background/windyy.mp3",
  Wind: "/weather-background/windyy.mp3",
}

// Global flag to track user interaction (shared across all instances)
let hasUserInteracted = false

export function useWeatherAudio() {
  const { settings } = useSettings()
  const { currentWeather } = useWeatherData()
  const audioRef = useRef(null)
  const currentAudioRef = useRef(null)
  const [userInteracted, setUserInteracted] = useState(hasUserInteracted)

  // Listen for user interaction to enable audio playback
  useEffect(() => {
    if (hasUserInteracted) return

    const handleInteraction = () => {
      hasUserInteracted = true
      setUserInteracted(true)
    }

    // Listen for various user interactions
    const events = ['click', 'touchstart', 'keydown', 'userInteraction']
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction)
      })
    }
  }, [])

  useEffect(() => {
    if (!settings.enableAudio || !currentWeather) {
      // Stop audio if disabled or no weather data
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      return
    }

    // Don't play audio until user has interacted with the page
    if (!userInteracted) {
      return
    }

    const condition = currentWeather.condition || "Clear"
    const audioPath = weatherAudioMap[condition] || weatherAudioMap.Clear

    // If same audio is already playing, don't restart
    if (currentAudioRef.current === audioPath && audioRef.current && !audioRef.current.paused) {
      return
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Create and play new audio
    const audio = new Audio(audioPath)
    audio.loop = true
    audio.volume = settings.audioVolume || 0.3
    
    // Play audio - this should work now since user has interacted
    audio.play().catch((error) => {
      console.error("Error playing audio:", error)
      // If still fails, mark as not interacted to retry on next interaction
      if (error.name === 'NotAllowedError') {
        hasUserInteracted = false
        setUserInteracted(false)
      }
    })

    audioRef.current = audio
    currentAudioRef.current = audioPath

    // Update volume when setting changes
    const updateVolume = () => {
      if (audioRef.current) {
        audioRef.current.volume = settings.audioVolume || 0.3
      }
    }

    updateVolume()

    // Cleanup on unmount or when disabled
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [
    settings.enableAudio,
    settings.audioVolume,
    currentWeather?.condition,
    userInteracted,
  ])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current && settings.enableAudio) {
      audioRef.current.volume = settings.audioVolume || 0.3
    }
  }, [settings.audioVolume, settings.enableAudio])

  return {
    isPlaying: audioRef.current && !audioRef.current.paused,
  }
}

