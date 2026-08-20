import { useEffect, useState } from "react"

export type ThemePreference = "system" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "roof-careers-theme"

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === "system" || value === "light" || value === "dark"

const getMediaQuery = () =>
  typeof window === "undefined" ? null : window.matchMedia("(prefers-color-scheme: dark)")

export const getThemePreference = (): ThemePreference => {
  if (typeof localStorage === "undefined") return "system"
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isThemePreference(stored) ? stored : "system"
  } catch {
    return "system"
  }
}

export const getSystemTheme = (): ResolvedTheme => (getMediaQuery()?.matches ? "dark" : "light")

export const resolveTheme = (preference: ThemePreference = getThemePreference()): ResolvedTheme =>
  preference === "system" ? getSystemTheme() : preference

export const applyTheme = (preference: ThemePreference = getThemePreference()) => {
  if (typeof document === "undefined") return

  const resolvedTheme = resolveTheme(preference)
  const root = document.documentElement

  root.classList.toggle("dark", resolvedTheme === "dark")
  root.classList.toggle("light", resolvedTheme === "light")
  root.dataset.theme = resolvedTheme
  root.dataset.themePreference = preference
  root.style.colorScheme = resolvedTheme
}

export const setThemePreference = (preference: ThemePreference) => {
  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    /* ignore storage failures */
  }
  applyTheme(preference)
}

export const initializeTheme = () => {
  applyTheme()
}

export const useTheme = () => {
  const [preference, setPreference] = useState<ThemePreference>(getThemePreference)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  useEffect(() => {
    const mediaQuery = getMediaQuery()
    if (!mediaQuery) return

    const onSystemThemeChange = () => {
      setSystemTheme(getSystemTheme())
      if (getThemePreference() === "system") applyTheme("system")
    }

    mediaQuery.addEventListener("change", onSystemThemeChange)
    return () => mediaQuery.removeEventListener("change", onSystemThemeChange)
  }, [])

  const updatePreference = (nextPreference: ThemePreference) => {
    setThemePreference(nextPreference)
    setPreference(nextPreference)
  }

  const resolvedTheme = preference === "system" ? systemTheme : preference

  return {
    preference,
    resolvedTheme,
    setThemePreference: updatePreference,
    toggleTheme: () => updatePreference(resolvedTheme === "dark" ? "light" : "dark")
  }
}
