import React from "react"
import { useTranslation } from "react-i18next"
import { HiCheck, HiChevronLeft, HiChevronRight } from "react-icons/hi2"
import {
  TOOL_PARTS,
  checkboxesInPart,
  groupsForPart,
  selectionKey,
  type ToolPart
} from "../data/tools"

interface ToolPickerProps {
  /** Keys are `${groupId}:${toolId}` — the same tool in two areas is two picks. */
  selected: Set<string>
  onToggle: (key: string) => void
  /** Index into TOOL_PARTS. Owned by the form, which gates Send on reaching the last. */
  step: number
  onStep: (index: number) => void
}

/**
 * 90 checkboxes across 8 production areas, split into two STEPS and packed as
 * a real mosaic.
 *
 * `columns: 280px` is `repeat(auto-fill, minmax(280px, 1fr))` with masonry
 * packing — as many columns as fit at 280px or wider, each stretching to fill,
 * and a card starting wherever the previous one ended. Plain CSS grid would
 * make every row as tall as its tallest card, opening holes the height of the
 * missing rows; `grid-template-rows: masonry` is still behind a flag.
 *
 * The same tool appears in every area it belongs to (Runway is here 3 times),
 * because "Runway for VFX" and "Runway for storyboard" are different answers.
 *
 * STEPS, NOT TABS, AND THE DIFFERENCE IS NOT DECORATION.
 * Two tabs say "pick the one that applies to you". Two numbered steps with a
 * rule between them say "there are two of these and you are on the first".
 * This audience skims; the shape of the control has to carry the instruction,
 * because the label under it will not be read.
 *
 * Step 2 stays clickable from the start — this is a stepper, not a lock. What
 * actually stops someone finishing on step 1 is that Send does not exist until
 * step 2 has been reached, which the form enforces. The pager at the bottom is
 * an ordinary pager on purpose: the stepper up top already says "there are two
 * of these", so down here the only job left is turning the page.
 */
const ToolPicker: React.FC<ToolPickerProps> = ({ selected, onToggle, step, onStep }) => {
  const { t } = useTranslation()
  const topRef = React.useRef<HTMLDivElement>(null)

  const active = TOOL_PARTS[step] ?? TOOL_PARTS[0]
  const isLast = step >= TOOL_PARTS.length - 1

  const countIn = (part: ToolPart) =>
    groupsForPart(part).reduce(
      (n, group) =>
        n + group.tools.filter((tool) => selected.has(selectionKey(group.id, tool.id))).length,
      0
    )

  /**
   * Changing step replaces the whole mosaic below. Without this the reader
   * keeps their scroll offset and lands somewhere in the middle of the new
   * step — most visibly from the button at the very bottom, which would
   * otherwise leave them past the end of a list they have not seen the top of.
   */
  const goTo = (index: number) => {
    onStep(index)
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div>
      <div ref={topRef} className="wide-column mb-6 scroll-mt-24">
        <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-0">
          {TOOL_PARTS.map((part, index) => {
            const isActive = index === step
            const isDone = index < step
            const picked = countIn(part)

            return (
              <React.Fragment key={part.id}>
                {index > 0 && (
                  <li
                    aria-hidden
                    className={`hidden h-px flex-1 sm:block ${isDone || isActive ? "bg-accent-strong" : "bg-line-strong"}`}
                  />
                )}
                <li className="sm:shrink-0">
                  <button
                    type="button"
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => goTo(index)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-field border px-4 py-3 text-left transition-colors sm:w-auto ${
                      isActive
                        ? "border-accent-strong bg-accent-soft"
                        : "border-line bg-panel hover:border-line-strong"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                        isActive || isDone
                          ? "bg-accent text-ink-on"
                          : "border border-line-strong text-faint"
                      }`}
                    >
                      {isDone ? <HiCheck className="h-4 w-4" /> : index + 1}
                    </span>

                    <span className="flex flex-col">
                      <span className={`label ${isActive ? "text-fg" : ""}`}>
                        {t("tools.stepLabel", { n: index + 1, total: TOOL_PARTS.length })}
                      </span>
                      <span
                        className={`text-sm font-semibold ${isActive ? "text-fg" : "text-muted"}`}
                      >
                        {t(part.labelKey)}{" "}
                        <span
                          className={`font-medium tabular-nums ${picked > 0 ? "text-fg" : "text-faint"}`}
                        >
                          {picked}/{checkboxesInPart(part)}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              </React.Fragment>
            )
          })}
        </ol>
      </div>

      <div className="columns-[280px] gap-4">
        {groupsForPart(active).map((group) => {
          const picked = group.tools.filter((tool) => selected.has(selectionKey(group.id, tool.id)))

          return (
            <section
              key={group.id}
              className="mb-4 break-inside-avoid rounded-card border border-line bg-panel p-5 shadow-card"
              aria-labelledby={`group-${group.id}`}
            >
              <h3
                id={`group-${group.id}`}
                className="mb-2 flex items-center gap-2 border-b border-line pb-2"
              >
                <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${group.accent}`} />
                <span className="label flex-1">{t(group.labelKey)}</span>
                {picked.length > 0 && (
                  <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-ink-on tabular-nums">
                    {picked.length}
                  </span>
                )}
              </h3>

              <ul className="flex flex-col">
                {group.tools.map((tool) => {
                  const key = selectionKey(group.id, tool.id)
                  const isSelected = selected.has(key)

                  return (
                    <li key={key}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => onToggle(key)}
                        className={`flex w-full cursor-pointer items-start gap-2 rounded-field px-2 py-1 text-left transition-colors ${
                          isSelected ? "bg-accent-soft" : "hover:bg-panel-2"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                            isSelected
                              ? "border-accent-strong bg-accent text-ink-on"
                              : "border-line-strong bg-panel-2"
                          }`}
                        >
                          {isSelected && <HiCheck className="h-3 w-3" />}
                        </span>
                        <span
                          className={`text-sm leading-snug text-fg ${isSelected ? "font-semibold" : ""}`}
                        >
                          {tool.name}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      {/* An ordinary pager. The stepper at the top already carries the
          "there are two of these" message; down here the job is just to turn
          the page, and a plain 1 / 2 with arrows is the control everyone
          already knows how to read. */}
      <nav className="wide-column mt-5 flex flex-col items-center gap-2" aria-label={t("tools.pagination")}>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            aria-label={t("tools.prevPage")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-muted transition-colors enabled:cursor-pointer enabled:hover:border-line-strong enabled:hover:text-fg disabled:opacity-35"
          >
            <HiChevronLeft aria-hidden className="h-4 w-4" />
          </button>

          {TOOL_PARTS.map((part, index) => (
            <button
              key={part.id}
              type="button"
              onClick={() => goTo(index)}
              aria-current={index === step ? "page" : undefined}
              aria-label={t("tools.goToStep", { n: index + 1, part: t(part.labelKey) })}
              className={`h-9 min-w-9 cursor-pointer rounded-full border px-3 text-sm font-semibold tabular-nums transition-colors ${
                index === step
                  ? "border-accent-strong bg-accent text-ink-on"
                  : "border-line bg-panel text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goTo(step + 1)}
            disabled={isLast}
            aria-label={t("tools.nextPage")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-muted transition-colors enabled:cursor-pointer enabled:hover:border-line-strong enabled:hover:text-fg disabled:opacity-35"
          >
            <HiChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>

        {/* Without this, someone who reaches the bottom of step 1 and does not
            turn the page finds no Send button and no reason for its absence.
            The gate has to explain itself or it is just a broken form. */}
        {!isLast && (
          <p className="text-xs text-faint">
            {t("tools.sendOnLastStep", { total: TOOL_PARTS.length })}
          </p>
        )}
      </nav>
    </div>
  )
}

export default ToolPicker
