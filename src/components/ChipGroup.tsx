import React from "react"
import { useTranslation } from "react-i18next"
import { HiCheck } from "react-icons/hi2"
import type { Choice } from "../data/profile"

interface ChipGroupProps {
  id: string
  title: string
  hint?: string
  choices: Choice[]
  /** Array for multi, string for single. */
  selected: string[] | string
  onToggle: (id: string) => void
  /** `single` renders radios: picking one clears the other. */
  mode?: "multi" | "single"
  /** Long sentence choices stack; short labels flow inline. */
  layout?: "inline" | "stack"
}

const ChipGroup: React.FC<ChipGroupProps> = ({
  id,
  title,
  hint,
  choices,
  selected,
  onToggle,
  mode = "multi",
  layout = "inline"
}) => {
  const { t } = useTranslation()
  const isActive = (choiceId: string) =>
    Array.isArray(selected) ? selected.includes(choiceId) : selected === choiceId

  const role = mode === "single" ? "radio" : "checkbox"

  return (
    <fieldset className="border-0 p-0">
      <legend id={`${id}-legend`} className="mb-1 text-sm font-semibold text-fg">
        {title}
      </legend>
      {hint && <p className="mb-3 text-xs text-faint">{hint}</p>}

      <div
        role={mode === "single" ? "radiogroup" : "group"}
        aria-labelledby={`${id}-legend`}
        className={layout === "stack" ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}
      >
        {choices.map((choice) => {
          const active = isActive(choice.id)
          return (
            <button
              key={choice.id}
              type="button"
              role={role}
              aria-checked={active}
              onClick={() => onToggle(choice.id)}
              className={`inline-flex cursor-pointer items-center gap-2 border px-3.5 py-1.5 text-left text-sm font-medium transition-colors ${
                // Stacked options are full sentences, so they read as rows;
                // inline ones are short labels and read as pills.
                layout === "stack" ? "rounded-field" : "rounded-full"
              } ${
                active
                  ? "border-accent-strong bg-accent-soft font-semibold text-fg"
                  : "border-line bg-panel-2 text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
                  mode === "single" ? "rounded-full" : "rounded-[4px]"
                } ${
                  active ? "border-accent-strong bg-accent text-ink-on" : "border-line-strong bg-panel"
                }`}
              >
                {active &&
                  (mode === "single" ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-on" />
                  ) : (
                    <HiCheck className="h-3 w-3" />
                  ))}
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
