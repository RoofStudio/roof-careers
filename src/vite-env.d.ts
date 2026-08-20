/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Apps Script Web App /exec URL. Public by design — see README. */
  readonly VITE_APPS_SCRIPT_URL?: string
  /** Cloudflare Turnstile sitekey. Public by design; the secret stays in Apps Script. */
  readonly VITE_TURNSTILE_SITEKEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  turnstile?: {
    render: (
      container: HTMLElement,
      options: {
        sitekey: string
        theme?: "light" | "dark" | "auto"
        callback?: (token: string) => void
        "expired-callback"?: () => void
        "error-callback"?: () => void
      }
    ) => string
    reset: (widgetId?: string) => void
    remove: (widgetId?: string) => void
  }
}
