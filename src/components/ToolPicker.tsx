import React from "react"
import { useTranslation } from "react-i18next"
import { HiCheck } from "react-icons/hi2"
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
}

/**
 * 90 checkboxes across 8 production areas, packed as a real mosaic and shown
 * ALL AT ONCE, grouped under the two headings the catalogue already had.
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
 * THIS USED TO BE TWO PAGES, AND THE PAGES WERE THE PROBLEM.
 * Half the list was one click away and the click was easy to miss — the
 * second page cost a scroll AND a decision, and someone who never made that
 * decision was recorded as using no 3D tools when they had simply never been
 * shown the 3D list. Everything that existed to patch that hole — the
 * stepper, the pager, the "send is on step 2" note, the latch that withheld
 * the Send button until the last step had been reached — is gone with it. A
 * blank answer and an unseen question are only indistinguishable when
 * something is hidden; nothing is hidden now.
 *
 * The two headings stay, because grouping was never the thing that hurt: they
 * break 90 checkboxes into two arguments the reader can hold, and the count
 * beside each one is what tells someone at a glance that they have answered
 * one half and not the other.
 */
const ToolPicker: React.FC<ToolPickerProps> = ({ selected, onToggle }) => {
  const { t } = useTranslation()

  const countIn = (part: ToolPart) =>
    groupsForPart(part).reduce(
      (n, group) =>
        n + group.tools.filter((tool) => selected.has(selectionKey(group.id, tool.id))).length,
      0
    )

  return (
    <div className="flex flex-col gap-10">
      {TOOL_PARTS.map((part) => {
        const picked = countIn(part)

        return (
          <section key={part.id} aria-labelledby={`part-${part.id}`}>
            {/* A rule with a name on it. Not a tab and not a step — there is
                nowhere to go, so the heading may not look like a control. */}
            <div className="mb-4 flex items-center gap-3">
              <h3 id={`part-${part.id}`} className="label shrink-0 text-fg">
                {t(part.labelKey)}
              </h3>
              <span aria-hidden className="h-px flex-1 bg-line-strong" />
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums transition-colors ${
                  picked > 0
                    ? "border-accent-strong bg-accent-soft text-fg"
                    : "border-line bg-panel text-muted"
                }`}
              >
                {picked}/{checkboxesInPart(part)}
              </span>
            </div>

            <div className="columns-[280px] gap-4">
              {groupsForPart(part).map((group) => {
                const pickedHere = group.tools.filter((tool) =>
                  selected.has(selectionKey(group.id, tool.id))
                )

                return (
                  <section
                    key={group.id}
                    className="mb-4 break-inside-avoid rounded-card border border-line bg-panel p-5 shadow-card"
                    aria-labelledby={`group-${group.id}`}
                  >
                    <h4
                      id={`group-${group.id}`}
                      className="mb-2 flex items-center gap-2 border-b border-line pb-2"
                    >
                      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${group.accent}`} />
                      <span className="label flex-1">{t(group.labelKey)}</span>
                      {pickedHere.length > 0 && (
                        <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-ink-on tabular-nums">
                          {pickedHere.length}
                        </span>
                      )}
                    </h4>

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
          </section>
        )
      })}
    </div>
  )
}

export default ToolPicker
