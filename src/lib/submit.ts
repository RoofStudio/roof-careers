import { GROUP_BY_ID, TOOL_BY_ID, parseSelectionKey } from "../data/tools"

export interface ProfilePayload {
  fullName: string
  email: string
  phone: string
  location: string
  portfolio: string
  links: string
  imdb: string
  reels: string
}

/** One tool, in one production area. The same tool can appear more than once. */
export interface ToolPick {
  id: string
  name: string
  group: string
  groupName: string
}

export interface SubmissionPayload {
  profile: ProfilePayload
  /** Single-select answers. */
  expertise: string
  aiRelationship: string
  /** Multi-select answers. */
  practice: string[]
  aiWorkflow: string[]
  stages: string[]
  projectTypes: string[]
  /** Credits link per project type, keyed by project type id. */
  projectLinks: Record<string, string>
  tools: ToolPick[]
  otherTools: string
  meta: {
    submittedAt: string
    language: string
    timezone: string
    userAgent: string
    /** Bump when the field set changes, so old rows stay readable. */
    formVersion: string
  }
  guard: {
    hp: string
    elapsedMs: number
    turnstileToken: string
  }
}

/** v4: the duplicated AI-experience ladder was dropped. */
export const FORM_VERSION = "4"

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined

export const buildPayload = (input: {
  profile: ProfilePayload
  expertise: string
  practice: string[]
  aiWorkflow: string[]
  aiRelationship: string
  projectTypes: string[]
  projectLinks: Record<string, string>
  stages: string[]
  selected: Set<string>
  otherTools: string
  hp: string
  elapsedMs: number
  turnstileToken: string
  language: string
}): SubmissionPayload => ({
  profile: input.profile,
  expertise: input.expertise,
  practice: input.practice,
  aiWorkflow: input.aiWorkflow,
  aiRelationship: input.aiRelationship,
  projectTypes: input.projectTypes,
  // A link for a type they did not tick is an orphan the columns cannot
  // explain, so it never leaves the browser.
  projectLinks: Object.fromEntries(
    input.projectTypes
      .map((id) => [id, (input.projectLinks[id] ?? "").trim()] as const)
      .filter(([, link]) => link)
  ),
  stages: input.stages,
  tools: [...input.selected].map((key) => {
    const { groupId, toolId } = parseSelectionKey(key)
    return {
      id: toolId,
      name: TOOL_BY_ID[toolId]?.name ?? toolId,
      group: groupId,
      groupName: GROUP_BY_ID[groupId]?.id ?? groupId
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
