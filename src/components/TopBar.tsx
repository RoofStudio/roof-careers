import React from "react"
import { useTranslation } from "react-i18next"
import RoofWordmark from "./RoofWordmark"
import { LANGUAGES } from "../i18n"

/**
 * The mark on the left, the language on the right, a hairline underneath.
 *
 * The theme toggle used to live here. There is one theme now — Base Sand,
 * Deep Coffee ink — so there is nothing to toggle.
 *
 * The language control is set like the studio's own nav: Ambit, uppercase,
 * the active one underlined in Powerful Green. It is deliberately not a pill:
 * roofstudio.tv marks the current page with a green rule under the word and
 * nothing else, and a filled capsule up here would be the only chip on a page
 * that has no chips left.
 */
const TopBar: React.FC = () => {
  const { t, i18n } = useTranslation()

  return (
    <header className="sticky top-0 z-30 border-b border-rule/15 bg-surface/85 backdrop-blur-md">
      <div className="wide-column flex items-center justify-between gap-4 py-4">
        <a
          href="https://roofstudio.tv"
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 rounded-sm"
        >
          <RoofWordmark className="w-24 sm:w-28" />
        </a>

        <nav role="group" aria-label={t("nav.language")} className="flex items-center gap-5">
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
                className={`cursor-pointer pb-0.5 text-sm font-semibold tracking-[-0.02em] uppercase transition-colors ${
                  active
                    ? "border-b-2 border-accent text-fg"
                    : "border-b-2 border-transparent text-muted hover:text-fg"
                }`}
              >
                {lang.short}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default TopBar
