import React, { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiArrowRight, HiExclamationTriangle, HiPaperAirplane } from "react-icons/hi2"
import Button from "../components/Button"
import ChipGroup from "../components/ChipGroup"
import Field from "../components/Field"
import ToolPicker from "../components/ToolPicker"
import {
  AI_WORKFLOW,
  CORE_STRENGTH,
  PIPELINE_AREAS,
  PRIMARY_EXPERTISE,
  PROJECT_TYPES
} from "../data/profile"
import { TOTAL_CHECKBOXES } from "../data/tools"
import {
  LINK_FIELDS,
  buildPayload,
  submitApplication,
  type LinkField,
  type ProfilePayload
} from "../lib/submit"
import { TURNSTILE_ENABLED, useTurnstile } from "../lib/turnstile"

const CONTACT_EMAIL = "hello@roofstudio.tv"

const EMPTY_PROFILE: ProfilePayload = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  portfolio: "",
  website: "",
  behance: "",
  vimeo: "",
  instagram: "",
  linkedin: "",
  otherLink: ""
}

/** The locale sub-key for each link field. Only `otherLink` differs. */
const LINK_LABEL_KEY: Record<LinkField, string> = {
  website: "website",
  behance: "behance",
  vimeo: "vimeo",
  instagram: "instagram",
  linkedin: "linkedin",
  otherLink: "other"
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

/**
 * A block, set the way roofstudio.tv sets every block: a hairline across the
 * top, the label alone in a narrow left column, the content to its right.
 *
 * It used to be a card — rounded, filled, shadowed — which is a shape the
 * brand does not have anywhere. The label column carries the structure now,
 * and on a phone it simply stacks above the content.
 *
 * The content is capped at 46rem even though the column is wider. Nothing is
 * gained by a 950px-wide text input, and the reference pages cap their body
 * the same way.
 */
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
    className="grid scroll-mt-24 gap-8 border-t border-rule/25 pt-10 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-14"
  >
    <p className="label md:pt-1">{label}</p>
    <div className="flex max-w-[46rem] flex-col gap-10">{children}</div>
  </motion.section>
)

interface ApplicationFormProps {
  onSuccess: () => void
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSuccess }) => {
  const { t, i18n } = useTranslation()

  const [profile, setProfile] = useState<ProfilePayload>(EMPTY_PROFILE)
  // Every question is multi-select now, so every answer is a list.
  const [expertise, setExpertise] = useState<string[]>([])
  const [aiWorkflow, setAiWorkflow] = useState<string[]>([])
  const [strength, setStrength] = useState<string[]>([])
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

  const turnstile = useTurnstile()
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

  const toolProgress = useMemo(() => `${selectedCount} / ${TOTAL_CHECKBOXES}`, [selectedCount])

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
            ...(Object.fromEntries(
              LINK_FIELDS.map((key) => [key, normalizeUrl(profile[key])])
            ) as Record<LinkField, string>)
          },
          expertise,
          aiWorkflow,
          strength,
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
  const selectAll = t("profile.selectAll")

  return (
    <section id="form" className="wide-column scroll-mt-20 pb-28">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-16">
        {/* ── The basics ─────────────────────────────────────────────── */}
        <Card label={t("form.label")}>
          <div>
            <h2 className="display">{t("form.title")}</h2>
            <p className="voice mt-4 text-xl text-muted">{t("form.subtitle")}</p>

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
            </div>
          </div>

          {/* One named row per service, instead of the single free-text box
              this used to be. People filled that box with three URLs, a comma
              and a note, and the sheet got a column nobody could filter. */}
          <div>
            <p className="text-base font-semibold text-fg">{t("form.fields.links.label")}</p>
            <p className="mt-1 text-sm text-faint">{t("form.fields.links.hint")}</p>

            <div className="mt-4 flex flex-col gap-4">
              {LINK_FIELDS.map((key) => (
                <Field
                  key={key}
                  id={key}
                  type="url"
                  label={t(`form.fields.links.${LINK_LABEL_KEY[key]}.label`)}
                  placeholder={t(`form.fields.links.${LINK_LABEL_KEY[key]}.placeholder`)}
                  value={profile[key]}
                  onChange={setField(key)}
                  optional
                  inputMode="url"
                />
              ))}
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
            Three questions, numbered, all multi-select. V9 asked nine. Six of
            them were the same fact asked again in different clothes — four
            angles on seniority, plus a reach question the pipeline section
            already answers and an AI question the workflow row below it
            already answers. */}
        <Card label={t("profile.practiceLabel")}>
          <ChipGroup
            id="expertise"
            number={1}
            title={t("profile.expertiseTitle")}
            hint={selectAll}
            choices={PRIMARY_EXPERTISE}
            selected={expertise}
            onToggle={(id) => setExpertise((prev) => toggleIn(prev, id))}
          />

          <ChipGroup
            id="aiWorkflow"
            number={2}
            layout="stack"
            title={t("profile.aiWorkflowTitle")}
            hint={selectAll}
            choices={AI_WORKFLOW}
            selected={aiWorkflow}
            onToggle={(id) => setAiWorkflow((prev) => toggleIn(prev, id))}
          />

          <ChipGroup
            id="strength"
            number={3}
            layout="stack"
            title={t("profile.strengthTitle")}
            hint={selectAll}
            choices={CORE_STRENGTH}
            selected={strength}
            onToggle={(id) => setStrength((prev) => toggleIn(prev, id))}
          />
        </Card>

        {/* ── Production pipeline ──────────────────────────── */}
        <Card label={t("profile.pipelineLabel")}>
          <ChipGroup
            id="pipeline"
            title={t("profile.pipelineTitle")}
            hint={selectAll}
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
            <p className="text-base font-semibold text-fg">{t("profile.projectTitle")}</p>
            <p className="mb-1 text-sm text-faint">{t("profile.projectHint")}</p>

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
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-field border px-3.5 py-2.5 text-left text-base font-medium transition-colors ${
                        active
                          ? "border-accent-strong bg-accent-soft font-semibold text-fg"
                          : "border-rule/25 text-muted hover:border-rule/60 hover:text-fg"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                          active
                            ? "border-accent-strong bg-accent text-ink-on"
                            : "border-rule/40"
                        }`}
                      >
                        {active && <span className="text-[10px] font-semibold text-ink-on">✓</span>}
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
            <p className="voice text-xl text-muted">{t("profile.aiProjectsIntro")}</p>

            <div>
              <p className="mb-1 text-base font-semibold text-fg">{t("profile.ledLabel")}</p>
              <p className="mb-3 text-sm text-faint">{t("profile.ledHint")}</p>
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
              <p className="mb-1 text-base font-semibold text-fg">{t("profile.executedLabel")}</p>
              <p className="mb-3 text-sm text-faint">{t("profile.executedHint")}</p>
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
          {/* Head in the block grid, mosaic underneath at full width — 90
              checkboxes squeezed into a content column would be four columns
              of one. */}
          <div className="mb-10 grid gap-8 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-14">
            <p className="label md:pt-1">{t("tools.label")}</p>

            <div className="flex max-w-[46rem] flex-col gap-3">
            <h2 className="display text-balance">{t("tools.title")}</h2>
            <p className="voice text-xl text-muted">{t("tools.subtitle")}</p>

            <div className="mt-2 flex items-center gap-3">
              <span
                aria-live="polite"
                className={`rounded-full border px-3 py-1 text-xs font-semibold tabular-nums transition-colors ${
                  selectedCount > 0
                    ? "border-accent-strong bg-accent-soft text-fg"
                    : "border-rule/25 text-muted"
                }`}
              >
                {toolProgress}
              </span>
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="cursor-pointer text-sm font-medium text-muted underline underline-offset-4 hover:text-fg"
                >
                  {t("tools.clear")}
                </button>
              )}
            </div>
            </div>
          </div>

          <ToolPicker selected={selected} onToggle={toggleTool} />

          <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-14">
            <span aria-hidden />
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
            <p role="alert" className="mt-3 text-sm font-medium text-negative">
              {errors.tools}
            </p>
          )}
        </motion.div>

        {/* ── Submit ───────────────────────────────────────────────── */}
        <div className="grid gap-8 border-t border-rule/25 pt-10 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-14">
          <span aria-hidden />
          <div className="flex max-w-[46rem] flex-col items-start gap-5">
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

            <p className="text-sm text-faint">{t("submit.privacy")}</p>
          </div>
        </div>
      </form>
    </section>
  )
}

export default ApplicationForm
