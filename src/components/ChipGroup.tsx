import React from "react"
import { useTranslation } from "react-i18next"
import { HiCheck } from "react-icons/hi2"
import type { Choice } from "../data/profile"

interface ChipGroupProps {
  id: string
  title: string
  /**
   * Position in the section, rendered as "1." before the title. Numbering a
   * list of questions tells the candidate how much is left — the single most
   * effective thing a long form can do to stop people abandoning it halfway.
   */
  number?: number
  hint?: string
  choices: Choice[]
  selected: string[]
  onToggle: (id: string) => void
  /** Long sentence choices stack; short labels flow inline. */
  layout?: "inline" | "stack"
}

/**
 * A question, answered by ticking any number of boxes.
 *
 * THERE IS NO SINGLE-SELECT MODE, and that is the point. Every question in
 * this form used to force one answer, which meant a Designer who also animates
 * had to pick a lie. Radios are gone: the shape of the checkbox is now the
 * whole instruction, so nobody has to read a hint to learn they may tick two.
 */
const ChipGroup: React.FC<ChipGroupProps> = ({
  id,
  title,
  number,
  hint,
  choices,
  selected,
  onToggle,
  layout = "inline"
}) => {
  const { t } = useTranslation()

  return (
    <fieldset className="border-0 p-0">
      <legend id={`${id}-legend`} className="mb-1 flex gap-2 text-sm font-semibold text-fg">
        {number !== undefined && (
          <span className="shrink-0 tabular-nums text-brand-accent">{number}.</span>
        )}
        <span>{title}</span>
      </legend>
      {hint && <p className={`mb-3 text-xs text-faint ${number !== undefined ? "pl-5" : ""}`}>{hint}</p>}

      <div
        role="group"
        aria-labelledby={`${id}-legend`}
        className={`${layout === "stack" ? "flex flex-col gap-2" : "flex flex-wrap gap-2"} ${
          number !== undefined ? "pl-5" : ""
        }`}
      >
        {choices.map((choice) => {
          const active = selected.includes(choice.id)
          return (
            <button
              key={choice.id}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => onToggle(choice.id)}
              className={`inline-flex cursor-pointer items-center gap-2 border px-3.5 py-1.5 text-left text-sm font-medium transition-colors ${
                // Stacked options are full sentences, so they read as rows;
                // inline ones are short labels and read as pills.
                layout === "stack" ? "rounded-field" : "rounded-full"
              } ${
                active
                  ? "border-accent-strong bg-accent-soft font-semibold text-fg"
                  : "border-rule/25 text-muted hover:border-rule/60 hover:text-fg"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                  active
                    ? "border-accent-strong bg-accent text-ink-on"
                    : "border-rule/40"
                }`}
              >
                {active && <HiCheck className="h-3 w-3" />}
              </span>
              {t(choice.labelKey)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default ChipGroup
