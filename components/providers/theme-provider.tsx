"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.classList.add(resolvedTheme)
  document.documentElement.style.colorScheme = resolvedTheme
  return resolvedTheme
}

export type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
  /** Supported for compatibility with the previous next-themes provider. */
  attribute?: "class"
  disableTransitionOnChange?: boolean
}

/**
 * Client-side theme provider that avoids rendering an inline script, which React
 * 19 rejects when a component is rendered on the client.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setStoredTheme] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light")
  const currentTheme = React.useRef(theme)
  currentTheme.current = theme

  React.useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as Theme | null
    const initialTheme = savedTheme === "light" || savedTheme === "dark" || (enableSystem && savedTheme === "system")
      ? savedTheme
      : defaultTheme === "system" && !enableSystem ? "light" : defaultTheme

    setStoredTheme(initialTheme)
    setResolvedTheme(applyTheme(initialTheme))

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleSystemThemeChange = () => {
      if (currentTheme.current === "system") setResolvedTheme(applyTheme("system"))
    }
    mediaQuery.addEventListener("change", handleSystemThemeChange)
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange)
  }, [defaultTheme, enableSystem])

  const setTheme = React.useCallback((nextTheme: Theme) => {
    const themeToApply = nextTheme === "system" && !enableSystem ? "light" : nextTheme

    if (disableTransitionOnChange) {
      const style = document.createElement("style")
      style.textContent = "*,*::before,*::after{transition:none!important}"
      document.head.appendChild(style)
      window.requestAnimationFrame(() => style.remove())
    }

    window.localStorage.setItem("theme", themeToApply)
    setStoredTheme(themeToApply)
    setResolvedTheme(applyTheme(themeToApply))
  }, [disableTransitionOnChange, enableSystem])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
