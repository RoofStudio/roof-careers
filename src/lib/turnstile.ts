import { useCallback, useEffect, useRef, useState } from "react"

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY

/**
 * Turnstile is optional. With no sitekey the form still works — it just falls
 * back to the honeypot and the time-to-submit check. Turn it on the day the
 * spam actually shows up.
 */
export const TURNSTILE_ENABLED = Boolean(SITEKEY)

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

let scriptPromise: Promise<void> | null = null

const loadTurnstileScript = (): Promise<void> => {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve()

    const script = document.createElement("script")
    script.src = SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("failed to load Turnstile"))
    document.head.appendChild(script)
  })

  return scriptPromise
}

/**
 * Mounts the widget and hands back the current token.
 *
 * `token` is "" until the challenge is solved and again once it expires, so a
 * stale token can never be submitted.
 */
export const useTurnstile = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [token, setToken] = useState("")
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!TURNSTILE_ENABLED || !containerRef.current) return

    let cancelled = false
    const container = containerRef.current

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(container, {
          sitekey: SITEKEY as string,
          theme: "light",
          callback: (value) => setToken(value),
          "expired-callback": () => setToken(""),
          "error-callback": () => {
            setToken("")
            setFailed(true)
          }
        })
      })
      .catch(() => setFailed(true))

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
    // Mount once. The widget bakes its colors in at render time, which used to
    // mean re-rendering whenever the page changed theme — there is one theme
    // now, so there is nothing left to react to.
  }, [])

  const reset = useCallback(() => {
    setToken("")
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current)
  }, [])

  return { containerRef, token, reset, failed }
}
