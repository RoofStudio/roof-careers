import { TOOL_BY_ID, type Level } from "../data/tools"

export interface ProfilePayload {
  fullName: string
  email: string
  phone: string
  location: string
  portfolio: string
  links: string
}

export interface SubmissionPayload {
  profile: ProfilePayload
  /** Roles the person has actually delivered a project in. */
  roles: string[]
  /** Where their work has been seen, plus one link if any of it has. */
  published: string[]
  publishedLink: string
  /**
   * Only the checked tools. `group` and `ai` ride along so the sheet can derive
   * the pipeline and the AI-fluency count without holding a second copy of the
   * tool table that would drift out of date.
   */
  tools: { id: string; name: string; level: Level; group: string; ai: boolean }[]
  otherTools: string
  meta: {
    submittedAt: string
    language: string
    timezone: string
    userAgent: string
    /** Bump when the field set changes, so old rows stay readable. */
    formVersion: string
  }
  /** Anti-spam signals — the Apps Script decides what to do with them. */
  guard: {
    /** Honeypot: a human never fills a field they cannot see. */
    hp: string
    /** Milliseconds between page load and submit. Bots are instant. */
    elapsedMs: number
    /** Cloudflare Turnstile token, when the sitekey is configured. */
    turnstileToken: string
  }
}

/** v2: roles/published replaced the free-text "Field of Work". */
export const FORM_VERSION = "2"

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined

export const buildPayload = (input: {
  profile: ProfilePayload
  roles: string[]
  published: string[]
  publishedLink: string
  selected: Record<string, Level>
  otherTools: string
  hp: string
  elapsedMs: number
  turnstileToken: string
  language: string
}): SubmissionPayload => ({
  profile: input.profile,
  roles: input.roles,
  published: input.published,
  publishedLink: input.publishedLink.trim(),
  tools: Object.entries(input.selected).map(([id, level]) => {
    const tool = TOOL_BY_ID[id]
    return {
      id,
      name: tool?.name ?? id,
      level,
      group: tool?.group ?? "",
      ai: tool?.ai ?? false
    }
  }),
  otherTools: input.otherTools.trim(),
  meta: {
    submittedAt: new Date().toISOString(),
    language: input.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    userAgent: navigator.userAgent,
    formVersion: FORM_VERSION
  },
  guard: {
    hp: input.hp,
    elapsedMs: input.elapsedMs,
    turnstileToken: input.turnstileToken
  }
})

export class SubmitError extends Error {}

/**
 * POST the payload to the Apps Script Web App.
 *
 * `text/plain` is deliberate: it keeps this a CORS "simple request", so the
 * browser never sends a preflight OPTIONS — which Apps Script does not answer.
 * The script reads the raw body from `e.postData.contents` and parses it there.
 */
export const submitApplication = async (payload: SubmissionPayload): Promise<void> => {
  if (!APPS_SCRIPT_URL) {
    throw new SubmitError("VITE_APPS_SCRIPT_URL is not set — see README.md")
  }

  let response: Response
  try {
    response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    })
  } catch (cause) {
    throw new SubmitError(`network error: ${String(cause)}`)
  }

  if (!response.ok) {
    throw new SubmitError(`HTTP ${response.status}`)
  }

  // The script answers `{"ok":true}`. Anything else — including an Apps Script
  // error page rendered as HTML — counts as a failed submission, so the
  // candidate is told to retry instead of being thanked for nothing.
  const text = await response.text()
  let body: { ok?: boolean; error?: string }
  try {
    body = JSON.parse(text)
  } catch {
    throw new SubmitError(`unexpected response: ${text.slice(0, 200)}`)
  }

  if (!body.ok) {
    throw new SubmitError(body.error ?? "rejected by the script")
  }
}
