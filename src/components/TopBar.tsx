import React from "react"
import { useTranslation } from "react-i18next"
import { HiMoon, HiSun } from "react-icons/hi2"
import RoofWordmark from "./RoofWordmark"
import { LANGUAGES } from "../i18n"
import { useTheme } from "../theme"

const TopBar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 backdrop-blur-md">
      <div className="wide-column flex items-center justify-between gap-4 py-3">
        <a
          href="https://roofstudio.tv"
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 rounded-sm"
        >
          <RoofWordmark className="w-20 sm:w-24" />
        </a>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={t("nav.language")}
            className="flex items-center rounded-full border border-line bg-panel p-0.5 shadow-soft"
          >
            {LANGUAGES.map((lang) => {
              const active = i18n.language === lang.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  lang={lang.code}
                  aria-pressed={active}
                  title={lang.label}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors ${
                    active ? "bg-accent text-ink-on" : "text-muted hover:text-fg"
                  }`}
                >
                  {lang.short}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            title={resolvedTheme === "dark" ? t("nav.toLight") : t("nav.toDark")}
            aria-label={resolvedTheme === "dark" ? t("nav.toLight") : t("nav.toDark")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-panel text-muted shadow-soft transition-colors hover:border-line-strong hover:text-fg"
          >
            {resolvedTheme === "dark" ? (
              <HiSun className="h-4 w-4" />
            ) : (
              <HiMoon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopBar
