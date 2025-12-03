"use client"

import { useSettings } from "@/hooks/useSettings"
import { useRouter } from "next/navigation"
import {
  Settings,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Clock,
  Globe,
  MapPin,
  RefreshCw,
  Bell,
  AlertTriangle,
  Info,
  FileText,
  Mail,
  RotateCcw,
  ChevronRight,
  Check,
} from "lucide-react"

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings, loading } = useSettings()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-white text-lg md:text-xl animate-pulse text-center">Loading settings...</div>
      </div>
    )
  }

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

  const SelectOption = ({ label, value, options, onChange, description }) => (
    <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
      <div className="text-white font-medium mb-1">{label}</div>
      {description && <div className="text-white/60 text-sm mb-3">{description}</div>}
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              value === option.value
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-blue-500/20 p-2 rounded-xl">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
  )

  const LinkButton = ({ icon: Icon, label, onClick, href }) => (
    <button
      onClick={onClick || (href ? () => router.push(href) : undefined)}
      className="w-full p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center justify-between group hover:scale-[1.02]"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-white/60 group-hover:text-blue-400 transition-colors" />
        <span className="text-white font-medium">{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
    </button>
  )

  return (
    <div className="min-h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 md:px-8 pt-6 md:pt-8 pb-4">
        <div className="bg-gradient-to-br from-white-500/20 to-white-500/20 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-blue-500/30 p-3 md:p-4 rounded-2xl animate-pulse">
              <Settings className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">Settings</h1>
              <p className="text-white/60 text-sm md:text-base">Customize your weather app experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-8 pb-6 md:pb-8"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
          scrollBehavior: "smooth",
        }}
      >
        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* 1. Units of Measurement */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-200">
              <SectionHeader icon={Thermometer} title="Units" />
              <div className="space-y-3">
                <SelectOption
                  label="Temperature"
                  value={settings.temperatureUnit}
                  options={[
                    { label: "°C", value: "celsius" },
                    { label: "°F", value: "fahrenheit" },
                  ]}
                  onChange={(value) => updateSetting("temperatureUnit", value)}
                />
                <SelectOption
                  label="Wind Speed"
                  value={settings.windSpeedUnit}
                  options={[
                    { label: "km/h", value: "kmh" },
                    { label: "mph", value: "mph" },
                    { label: "Knots", value: "knots" },
                  ]}
                  onChange={(value) => updateSetting("windSpeedUnit", value)}
                />
                <SelectOption
                  label="Precipitation"
                  value={settings.precipitationUnit}
                  options={[
                    { label: "mm", value: "mm" },
                    { label: "in", value: "in" },
                  ]}
                  onChange={(value) => updateSetting("precipitationUnit", value)}
                />
              </div>
            </div>

            {/* 2. Display Settings */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-200">
              <SectionHeader icon={Clock} title="Display" />
              <div className="space-y-3">
                <SelectOption
                  label="Time Format"
                  value={settings.timeFormat}
                  options={[
                    { label: "12-Hour", value: "12" },
                    { label: "24-Hour", value: "24" },
                  ]}
                  onChange={(value) => updateSetting("timeFormat", value)}
                />
                <SelectOption
                  label="Visibility"
                  value={settings.visibilityUnit}
                  options={[
                    { label: "km", value: "km" },
                    { label: "mi", value: "mi" },
                  ]}
                  onChange={(value) => updateSetting("visibilityUnit", value)}
                />
                <SelectOption
                  label="Pressure"
                  value={settings.pressureUnit}
                  options={[
                    { label: "hPa", value: "hpa" },
                    { label: "inHg", value: "inhg" },
                  ]}
                  onChange={(value) => updateSetting("pressureUnit", value)}
                />
              </div>
            </div>

            {/* 3. Language */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-200">
              <SectionHeader icon={Globe} title="Language" />
              <SelectOption
                label="Display Language"
                value={settings.language}
                options={[
                  { label: "English", value: "en" },
                  { label: "Spanish", value: "es" },
                  { label: "French", value: "fr" },
                  { label: "German", value: "de" },
                  { label: "Italian", value: "it" },
                  { label: "Portuguese", value: "pt" },
                ]}
                onChange={(value) => updateSetting("language", value)}
              />
            </div>

            {/* 4. Legal & About */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-200">
              <SectionHeader icon={Info} title="About" />
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-white/60 text-sm space-y-1">
                    <p className="font-semibold text-white">Version 1.0.0</p>
                    <p className="mt-2">
                      Data by{" "}
                      <a
                        href="https://openweathermap.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        OpenWeatherMap
                      </a>
                    </p>
                  </div>
                </div>
                <LinkButton
                  icon={FileText}
                  label="Privacy Policy"
                  onClick={() => alert("Privacy Policy")}
                />
                <LinkButton
                  icon={FileText}
                  label="Terms of Service"
                  onClick={() => alert("Terms of Service")}
                />
                <LinkButton
                  icon={Mail}
                  label="Contact Support"
                  onClick={() => window.location.href = "mailto:support@weatherapp.com"}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* 5. Location & Data */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-200">
              <SectionHeader icon={MapPin} title="Location & Data" />
              <div className="space-y-3">
                <ToggleSwitch
                  enabled={settings.useCurrentLocation}
                  onChange={(value) => updateSetting("useCurrentLocation", value)}
                  label="Use Current Location"
                  description="Auto-detect GPS location"
                />
                <LinkButton
                  icon={MapPin}
                  label="Manage Saved Cities"
                  href="/add-city"
                />
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium">Auto Refresh</div>
                      <div className="text-white/60 text-sm mt-1">
                        Auto-update weather data
                      </div>
                    </div>
                    <button
                      onClick={() => updateSetting("autoRefresh", !settings.autoRefresh)}
                      className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                        settings.autoRefresh ? "bg-blue-500 shadow-lg shadow-blue-500/50" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg ${
                          settings.autoRefresh ? "translate-x-6" : "translate-x-0"
                        }`}
                      >
                        {settings.autoRefresh && (
                          <Check className="h-4 w-4 text-blue-500 absolute top-1 left-1" />
                        )}
                      </div>
                    </button>
                  </div>
                  {settings.autoRefresh && (
                    <div className="mt-3">
                      <SelectOption
                        label="Refresh Interval"
                        value={settings.refreshInterval.toString()}
                        options={[
                          { label: "15 min", value: "15" },
                          { label: "30 min", value: "30" },
                          { label: "1 hour", value: "60" },
                          { label: "2 hours", value: "120" },
                        ]}
                        onChange={(value) => updateSetting("refreshInterval", parseInt(value))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Notifications */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-white/30 transition-all duration-200">
              <SectionHeader icon={Bell} title="Notifications" />
              <div className="space-y-3">
                <ToggleSwitch
                  enabled={settings.enableAlerts}
                  onChange={(value) => updateSetting("enableAlerts", value)}
                  label="Enable Weather Alerts"
                  description="Master toggle for notifications"
                />
                {settings.enableAlerts && (
                  <div className="space-y-2 pl-4 border-l-2 border-blue-400/30">
                    <div className="text-white/80 font-medium mb-3 text-sm">Severe Weather Alerts</div>
                    {Object.entries(settings.severeWeatherAlerts).map(([key, value]) => (
                      <ToggleSwitch
                        key={key}
                        enabled={value}
                        onChange={(newValue) =>
                          updateSetting(`severeWeatherAlerts.${key}`, newValue)
                        }
                        label={key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 7. Reset Settings */}
            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md rounded-3xl p-6 border border-red-500/30 hover:border-red-500/50 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold mb-1 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Reset Settings
                  </div>
                  <div className="text-white/60 text-sm">
                    Restore all to defaults
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Reset all settings to default?")) {
                      resetSettings()
                    }
                  }}
                  className="px-6 py-3 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded-xl transition-all duration-200 flex items-center gap-2 border border-red-500/40 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}