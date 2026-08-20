import React from "react"
import { useTranslation } from "react-i18next"
import { HiCheck } from "react-icons/hi2"
import { TOOL_GROUPS, selectionKey } from "../data/tools"

interface ToolPickerProps {
  /** Keys are `${groupId}:${toolId}` — the same tool in two areas is two picks. */
  selected: Set<string>
  onToggle: (key: string) => void
}

/**
 * 300 checkboxes across 20 production areas, packed as a real mosaic.
 *
 * `columns: 280px` is `repeat(auto-fill, minmax(280px, 1fr))` with masonry
 * packing — as many columns as fit at 280px or wider, each stretching to fill,
 * and a card starting wherever the previous one ended. Plain CSS grid would
 * make every row as tall as its tallest card, opening holes the height of the
 * missing rows; `grid-template-rows: masonry` is still behind a flag.
 *
 * The same tool appears in every area it belongs to (Runway is here 8 times),
 * because "Runway for VFX" and "Runway for storyboard" are different answers.
 */
const ToolPicker: React.FC<ToolPickerProps> = ({ selected, onToggle }) => {
  const { t } = useTranslation()

  return (
    <div className="columns-[280px] gap-4">
      {TOOL_GROUPS.map((group) => {
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
                <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-ink-on tabular-nums">
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
  )
}

export default ToolPicker
