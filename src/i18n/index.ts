import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import ptBR from "./locales/pt-BR.json"
import en from "./locales/en.json"

export const LANGUAGES = [
  { code: "pt-BR", short: "PT", label: "Português" },
  { code: "en", short: "EN", label: "English" }
] as const

export type LanguageCode = (typeof LANGUAGES)[number]["code"]

const STORAGE_KEY = "roof-careers-lang"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "pt-BR": { translation: ptBR },
      en: { translation: en }
    },
    // A browser set to any pt-* (pt, pt-PT, pt-BR) must land on Portuguese —
    // navigator often reports a bare "pt", which would otherwise fall through
    // to English. Everyone else gets English.
    fallbackLng: { pt: ["pt-BR"], "pt-PT": ["pt-BR"], default: ["en"] },
    supportedLngs: ["pt-BR", "en"],
    load: "currentOnly",
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"]
    },
    interpolation: { escapeValue: false }
  })

/** Keep <html lang> in sync — it drives hyphenation and screen-reader voice. */
const syncDocumentLang = (lng: string) => {
  if (typeof document !== "undefined") document.documentElement.lang = lng
}

syncDocumentLang(i18n.language)
i18n.on("languageChanged", syncDocumentLang)

export default i18n
