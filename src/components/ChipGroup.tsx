import React from "react"
import { useTranslation } from "react-i18next"
import { HiCheck } from "react-icons/hi2"
import type { Chip } from "../data/profile"

interface ChipGroupProps {
  /** Used for the group's accessible name and to key the chip ids. */
  id: string
  title: string
  hint?: string
  chips: Chip[]
  selected: string[]
  onToggle: (id: string) => void
}

/**
 * Multi-select chips — the cheapest possible question.
 *
 * One tap per answer, no typing, no scale to interpret. Deliberately not a
 * checkbox list: chips flow inline, so nine of them read as one short line of
 * choices rather than nine rows of form.
 */
const ChipGroup: React.FC<ChipGroupProps> = ({ id, title, hint, chips, selected, onToggle }) => {
  const { t } = useTranslation()

  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-1 text-sm font-semibold text-fg">{title}</legend>
      {hint && <p className="mb-3 text-xs text-faint">{hint}</p>}

      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-legend`}>
        {chips.map((chip) => {
          const active = selected.includes(chip.id)
          return (
            <button
              key={chip.id}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => onToggle(chip.id)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-accent-strong bg-accent-soft font-semibold text-fg"
                  : "border-line bg-panel-2 text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {active && <HiCheck aria-hidden className="h-3.5 w-3.5 text-accent-strong" />}
              {t(chip.labelKey)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default ChipGroup
