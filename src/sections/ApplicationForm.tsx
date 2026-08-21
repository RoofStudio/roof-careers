import React, { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiArrowRight, HiExclamationTriangle, HiPaperAirplane } from "react-icons/hi2"
import Button from "../components/Button"
import ChipGroup from "../components/ChipGroup"
import Field from "../components/Field"
import ToolPicker from "../components/ToolPicker"
import {
  AI_INTEGRATION,
  AI_WORKFLOW,
  CORE_STRENGTH,
  FINISHING,
  PIPELINE_AREAS,
  PRIMARY_EXPERTISE,
  PROJECT_REACH,
  PROJECT_TYPES,
  RESPONSIBILITY,
  VISUAL_CHALLENGE,
  WORK_MODE
} from "../data/profile"
import { TOTAL_CHECKBOXES } from "../data/tools"
import { buildPayload, submitApplication, type ProfilePayload } from "../lib/submit"
import { TURNSTILE_ENABLED, useTurnstile } from "../lib/turnstile"
import { useTheme } from "../theme"

const CONTACT_EMAIL = "hello@roofstudio.tv"

const EMPTY_PROFILE: ProfilePayload = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  portfolio: "",
  links: ""
}

type FieldKey = keyof ProfilePayload
type Errors = Partial<Record<FieldKey | "tools", string>>

/** Deliberately loose: the goal is to catch typos, not to police valid addresses. */
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

/**
 * People paste "behance.net/foo" far more often than they type a scheme.
 * Rejecting that would cost real candidates, so we repair it instead.
 */
const normalizeUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ""
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const isUsableUrl = (value: string) => {
  try {
    const url = new URL(normalizeUrl(value))
    // A bare "https://foo" has no dot and is almost always a half-typed link.
    return url.hostname.includes(".")
  } catch {
    return false
  }
}

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

/** A card section, so the page reads as a sequence of short steps. */
const Card: React.FC<{ label: string; children: React.ReactNode; id?: string }> = ({
  label,
  children,
  id
}) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="text-column scroll-mt-20 rounded-card border border-line bg-panel p-7 shadow-card sm:p-10"
  >
    <p className="label mb-6">{label}</p>
    <div className="flex flex-col gap-8">{children}</div>
  </motion.section>
)

interface ApplicationFormProps {
  onSuccess: () => void
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSuccess }) => {
  const { t, i18n } = useTranslation()
  const { resolvedTheme } = useTheme()

  const [profile, setProfile] = useState<ProfilePayload>(EMPTY_PROFILE)
  const [expertise, setExpertise] = useState("")
  const [responsibility, setResponsibility] = useState("")
  const [workMode, setWorkMode] = useState("")
  const [reach, setReach] = useState("")
  const [challenge, setChallenge] = useState("")
  const [aiIntegration, setAiIntegration] = useState("")
  const [aiWorkflow, setAiWorkflow] = useState<string[]>([])
  const [strength, setStrength] = useState("")
  const [finishing, setFinishing] = useState("")
  const [pipeline, setPipeline] = useState<string[]>([])
  const [projectTypes, setProjectTypes] = useState<string[]>([])
  const [projectLinks, setProjectLinks] = useState<Record<string, string>>({})
  const [aiLedLink, setAiLedLink] = useState("")
  const [aiExecutedLink, setAiExecutedLink] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [otherTools, setOtherTools] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle")

  /** Honeypot — hidden from humans, irresistible to naive bots. */
  const [hp, setHp] = useState("")
  const mountedAt = useRef(Date.now())

  const turnstile = useTurnstile(resolvedTheme)
  const selectedCount = selected.size

  const setField = (key: FieldKey) => (value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
    // Clear the complaint as soon as they start fixing it — nagging while
    // someone types is the fastest way to make a form feel hostile.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const toggleTool = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setErrors((prev) => (prev.tools ? { ...prev, tools: undefined } : prev))
  }

  const toolProgress = useMemo(
    () => `${selectedCount} / ${TOTAL_CHECKBOXES}`,
    [selectedCount]
  )

  const validate = (): Errors => {
    const next: Errors = {}
    const required = t("form.errors.required")

    if (!profile.fullName.trim()) next.fullName = required
    if (!profile.email.trim()) next.email = required
    else if (!looksLikeEmail(profile.email)) next.email = t("form.errors.email")
    if (!profile.phone.trim()) next.phone = required
    if (!profile.location.trim()) next.location = required
    if (!profile.portfolio.trim()) next.portfolio = required
    else if (!isUsableUrl(profile.portfolio)) next.portfolio = t("form.errors.url")

    if (selectedCount === 0 && !otherTools.trim()) next.tools = t("form.errors.tools")

    return next
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0]
      document.getElementById(firstKey === "tools" ? "tools" : firstKey)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      })
      if (firstKey !== "tools") document.getElementById(firstKey)?.focus({ preventScroll: true })
      setStatus("error")
      return
    }

    // A filled honeypot means a bot. Show the same success it would see from a
    // real submit, and drop the payload on the floor.
    if (hp.trim()) return onSuccess()

    setStatus("sending")

    try {
      await submitApplication(
        buildPayload({
          profile: {
            ...profile,
            portfolio: normalizeUrl(profile.portfolio),
            links: profile.links.trim()
          },
          expertise,
          responsibility,
          workMode,
          reach,
          challenge,
          aiIntegration,
          aiWorkflow,
          strength,
          finishing,
          pipeline,
          aiLedLink: normalizeUrl(aiLedLink),
          aiExecutedLink: normalizeUrl(aiExecutedLink),
          projectTypes,
          projectLinks: Object.fromEntries(
            Object.entries(projectLinks).map(([id, link]) => [id, normalizeUrl(link)])
          ),
          selected,
          otherTools,
          hp,
          elapsedMs: Date.now() - mountedAt.current,
          turnstileToken: turnstile.token,
          language: i18n.language
        })
      )
      // Back to idle *before* handing off: if anything upstream fails to swap
      // the page, the candidate gets a live button rather than a dead spinner.
      setStatus("idle")
      onSuccess()
    } catch (error) {
      console.error("[roof-careers] submit failed", error)
      turnstile.reset()
      setStatus("error")
    }
  }

  const hasFieldErrors = Object.keys(errors).length > 0
  const sending = status === "sending"

  return (
    <section id="form" className="wide-column scroll-mt-20 pb-24">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        {/* ── The basics ─────────────────────────────────────────────── */}
        <Card label={t("form.label")}>
          <div>
            <h2 className="display text-2xl sm:text-3xl">{t("form.title")}</h2>
            <p className="mt-2 text-sm text-muted">{t("form.subtitle")}</p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  id="fullName"
                  label={t("form.fields.fullName.label")}
                  placeholder={t("form.fields.fullName.placeholder")}
                  value={profile.fullName}
                  onChange={setField("fullName")}
                  error={errors.fullName}
                  autoComplete="name"
                />
              </div>

              <Field
                id="email"
                type="email"
                label={t("form.fields.email.label")}
                placeholder={t("form.fields.email.placeholder")}
                value={profile.email}
                onChange={setField("email")}
                error={errors.email}
                autoComplete="email"
                inputMode="email"
              />

              <Field
                id="phone"
                type="tel"
                label={t("form.fields.phone.label")}
                placeholder={t("form.fields.phone.placeholder")}
                value={profile.phone}
                onChange={setField("phone")}
                error={errors.phone}
                autoComplete="tel"
                inputMode="tel"
              />

              <div className="sm:col-span-2">
                <Field
                  id="location"
                  label={t("form.fields.location.label")}
                  placeholder={t("form.fields.location.placeholder")}
                  value={profile.location}
                  onChange={setField("location")}
                  error={errors.location}
                  autoComplete="address-level2"
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  id="portfolio"
                  type="url"
                  label={t("form.fields.portfolio.label")}
                  placeholder={t("form.fields.portfolio.placeholder")}
                  value={profile.portfolio}
                  onChange={setField("portfolio")}
                  error={errors.portfolio}
                  inputMode="url"
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  id="links"
                  label={t("form.fields.links.label")}
                  placeholder={t("form.fields.links.placeholder")}
                  value={profile.links}
                  onChange={setField("links")}
                  optional
                />
              </div>
            </div>
          </div>

          {/* Off-screen rather than display:none — some bots skip hidden fields
              but happily fill a positioned one. Never announced, never tabbed. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="company-website">Company website</label>
            <input
              id="company-website"
              name="company-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
            />
          </div>
        </Card>

        {/* ── Your creative practice ─────────────────────────────
            Nine ladders instead of the flat list of 26 practice areas V5 had.
            Each asks about the WORK ("how far do you follow a project?") rather
            than about the person ("are you senior?") — the only version of that
            question anyone answers honestly. */}
        <Card label={t("profile.practiceLabel")}>
          <ChipGroup
            id="expertise"
            mode="single"
            title={t("profile.expertiseTitle")}
            choices={PRIMARY_EXPERTISE}
            selected={expertise}
            onToggle={(id) => setExpertise((prev) => (prev === id ? "" : id))}
          />

          <ChipGroup
            id="responsibility"
            mode="single"
            layout="stack"
            title={t("profile.responsibilityTitle")}
            choices={RESPONSIBILITY}
            selected={responsibility}
            onToggle={(id) => setResponsibility((prev) => (prev === id ? "" : id))}
          />

          <ChipGroup
            id="workMode"
            mode="single"
            layout="stack"
            title={t("profile.workModeTitle")}
            choices={WORK_MODE}
            selected={workMode}
            onToggle={(id) => setWorkMode((prev) => (prev === id ? "" : id))}
          />

          <ChipGroup
            id="reach"
            mode="single"
            layout="stack"
            title={t("profile.reachTitle")}
            choices={PROJECT_REACH}
            selected={reach}
            onToggle={(id) => setReach((prev) => (prev === id ? "" : id))}
          />

          <ChipGroup
            id="challenge"
            mode="single"
            layout="stack"
            title={t("profile.challengeTitle")}
            choices={VISUAL_CHALLENGE}
            selected={challenge}
            onToggle={(id) => setChallenge((prev) => (prev === id ? "" : id))}
          />

          <ChipGroup
            id="aiIntegration"
            mode="single"
            layout="stack"
            title={t("profile.aiIntegrationTitle")}
            choices={AI_INTEGRATION}
            selected={aiIntegration}
            onToggle={(id) => setAiIntegration((prev) => (prev === id ? "" : id))}
          />

          <ChipGroup
            id="aiWorkflow"
            layout="stack"
            title={t("profile.aiWorkflowTitle")}
            hint={t("profile.aiWorkflowHint")}
            choices={AI_WORKFLOW}
            selected={aiWorkflow}
            onToggle={(id) => setAiWorkflow((prev) => toggleIn(prev, id))}
          />

          <ChipGroup
            id="strength"
            mode="single"
            layout="stack"
            title={t("profile.strengthTitle")}
            choices={CORE_STRENGTH}
            selected={strength}
            onToggle={(id) => setStrength((prev) => (prev === id ? "" : id))}
          />

          <ChipGroup
            id="finishing"
            mode="single"
            layout="stack"
            title={t("profile.finishingTitle")}
            choices={FINISHING}
            selected={finishing}
            onToggle={(id) => setFinishing((prev) => (prev === id ? "" : id))}
          />
        </Card>

        {/* ── Production pipeline ──────────────────────────── */}
        <Card label={t("profile.pipelineLabel")}>
          <ChipGroup
            id="pipeline"
            title={t("profile.pipelineTitle")}
            hint={t("profile.pipelineHint")}
            choices={PIPELINE_AREAS}
            selected={pipeline}
            onToggle={(id) => setPipeline((prev) => toggleIn(prev, id))}
          />
        </Card>

        {/* ── Project experience ─────────────────────────────
            "Creative or artistic LEADERSHIP role" answers "has this person
            directed?" as a fact about the work, never as a question about the
            person. The link appears per type, only once that type is ticked. */}
        <Card label={t("profile.projectLabel")}>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-fg">{t("profile.projectTitle")}</p>
            <p className="mb-1 text-xs text-faint">{t("profile.projectHint")}</p>

            <ul className="flex flex-col gap-2">
              {PROJECT_TYPES.map((type) => {
                const active = projectTypes.includes(type.id)
                return (
                  <li key={type.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={active}
                      onClick={() => setProjectTypes((prev) => toggleIn(prev, type.id))}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-field border px-3.5 py-2 text-left text-sm font-medium transition-colors ${
                        active
                          ? "border-accent-strong bg-accent-soft font-semibold text-fg"
                          : "border-line bg-panel-2 text-muted hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                          active
                            ? "border-accent-strong bg-accent text-ink-on"
                            : "border-line-strong bg-panel"
                        }`}
                      >
                        {active && <span className="text-[10px] font-black text-ink-on">✓</span>}
                      </span>
                      {t(type.labelKey)}
                    </button>

                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 pl-6">
                            <Field
                              id={`project-${type.id}`}
                              type="url"
                              label={t("profile.projectLinkLabel")}
                              placeholder={t("profile.projectLinkPlaceholder")}
                              value={projectLinks[type.id] ?? ""}
                              onChange={(value) =>
                                setProjectLinks((prev) => ({ ...prev, [type.id]: value }))
                              }
                              optional
                              inputMode="url"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          </div>
        </Card>

        {/* ── AI projects ─────────────────────────────────
            Two links, split by the distinction the team actually cares about:
            who DIRECTED the use of AI versus who operated it. */}
        <Card label={t("profile.aiProjectsLabel")}>
          <div className="grid gap-6">
            <p className="text-sm text-muted">{t("profile.aiProjectsIntro")}</p>

            <div>
              <p className="mb-1 text-sm font-semibold text-fg">{t("profile.ledLabel")}</p>
              <p className="mb-3 text-xs text-faint">{t("profile.ledHint")}</p>
              <Field
                id="aiLedLink"
                type="url"
                label={t("profile.projectLinkLabel")}
                placeholder={t("profile.linkPlaceholder")}
                value={aiLedLink}
                onChange={setAiLedLink}
                optional
                inputMode="url"
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-fg">{t("profile.executedLabel")}</p>
              <p className="mb-3 text-xs text-faint">{t("profile.executedHint")}</p>
              <Field
                id="aiExecutedLink"
                type="url"
                label={t("profile.projectLinkLabel")}
                placeholder={t("profile.linkPlaceholder")}
                value={aiExecutedLink}
                onChange={setAiExecutedLink}
                optional
                inputMode="url"
              />
            </div>
          </div>
        </Card>

        {/* ── Tools ──────────────────────────────────────────────────── */}
        <motion.div
          id="tools"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="scroll-mt-20"
        >
          <div className="text-column mb-6 flex flex-col gap-2 text-center">
            <p className="label">{t("tools.label")}</p>
            <h2 className="display text-2xl text-balance sm:text-3xl">{t("tools.title")}</h2>
            <p className="note text-lg">{t("tools.subtitle")}</p>

            <div className="mt-2 flex items-center justify-center gap-3">
              <span
                aria-live="polite"
                className={`rounded-full border px-3 py-1 text-xs font-semibold tabular-nums transition-colors ${
                  selectedCount > 0
                    ? "border-accent-strong bg-accent-soft text-fg"
                    : "border-line bg-panel text-muted"
                }`}
              >
                {toolProgress}
              </span>
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="cursor-pointer text-xs font-medium text-muted underline underline-offset-4 hover:text-fg"
                >
                  {t("tools.clear")}
                </button>
              )}
            </div>
          </div>

          <ToolPicker selected={selected} onToggle={toggleTool} />

          <div className="text-column mt-4 rounded-card border border-line bg-panel p-5 shadow-card">
            <Field
              id="otherTools"
              label={t("tools.other.label")}
              placeholder={t("tools.other.placeholder")}
              value={otherTools}
              onChange={(value) => {
                setOtherTools(value)
                setErrors((prev) => (prev.tools ? { ...prev, tools: undefined } : prev))
              }}
              optional
            />
          </div>

          {errors.tools && (
            <p role="alert" className="mt-3 text-center text-sm font-medium text-negative">
              {errors.tools}
            </p>
          )}
        </motion.div>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div className="text-column flex flex-col items-center gap-4">
          {TURNSTILE_ENABLED && <div ref={turnstile.containerRef} className="min-h-[65px]" />}

          {status === "error" && (
            <div
              role="alert"
              className="flex w-full items-start gap-3 rounded-card border border-negative/40 bg-negative-soft px-5 py-4"
            >
              <HiExclamationTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-negative" />
              <div className="text-sm">
                <p className="font-semibold text-fg">
                  {hasFieldErrors ? t("submit.checkFields") : t("submit.failed")}
                </p>
                {!hasFieldErrors && (
                  <p className="mt-1 text-muted">
                    {t("submit.failedHint", { email: CONTACT_EMAIL })}
                  </p>
                )}
              </div>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={sending}
            icon={<HiPaperAirplane aria-hidden className="h-4 w-4" />}
            iconRight={!sending ? <HiArrowRight aria-hidden className="h-4 w-4" /> : undefined}
          >
            {sending ? t("submit.sending") : t("submit.cta")}
          </Button>

          <p className="text-center text-xs text-faint">{t("submit.privacy")}</p>
        </div>
      </form>
    </section>
  )
}

export default ApplicationForm
