import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiCheck } from "react-icons/hi2"
import { LEVELS, TOOL_GROUPS, type Level } from "../data/tools"

interface ToolPickerProps {
  selected: Record<string, Level>
  onToggle: (id: string) => void
  onLevel: (id: string, level: Level) => void
}

/**
 * The level pills that unfold under a tool once it is checked.
 *
 * Indented to the tool's text, not to the row — the level is a property OF the
 * tool, and lining it up under the name says so without a connector line.
 */
const LevelRow: React.FC<{
  toolId: string
  toolName: string
  level: Level
  onLevel: (id: string, level: Level) => void
}> = ({ toolId, toolName, level, onLevel }) => {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div
        role="radiogroup"
        aria-label={t("tools.levelFor", { tool: toolName })}
        className="flex flex-wrap gap-1 pt-1.5 pl-[24px]"
      >
        {LEVELS.map((value) => {
          const active = value === level
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onLevel(toolId, value)}
              className={`cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-accent text-ink-on"
                  : "bg-panel-2 text-muted hover:bg-elevated hover:text-fg"
              }`}
            >
              {t(`tools.levels.${value}`)}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

/**
 * One card per group, packed as a REAL mosaic.
 *
 * The intent is `repeat(auto-fill, minmax(280px, 1fr))` with masonry packing.
 * `grid-template-rows: masonry` is still behind a flag in Firefox and not in
 * Chrome, and plain CSS grid is what broke this layout before: a grid row is as
 * tall as its tallest cell, so a 3-tool card beside a 15-tool one opened a hole
 * the height of twelve missing rows.
 *
 * `columns: 280px` (Tailwind `columns-[280px]`) is the same sizing contract —
 * as many columns as fit at 280px or wider, each stretching to fill — and it
 * packs: a card starts wherever the previous one ended. `break-inside-avoid`
 * is what stops a card being split across two columns.
 *
 * Trade-off worth knowing: multi-column flows column-major (down, then across),
 * so the groups read top-to-bottom per column. For a grouped checklist that is
 * the natural reading order, and it is how page 7 of the deck reads too.
 */
const ToolPicker: React.FC<ToolPickerProps> = ({ selected, onToggle, onLevel }) => {
  const { t } = useTranslation()

  return (
    <div className="columns-[280px] gap-4">
      {TOOL_GROUPS.map((group) => (
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
            <span className="label">{t(group.labelKey)}</span>
          </h3>

          <ul className="flex flex-col">
            {group.tools.map((tool) => {
              const level = selected[tool.id]
              const isSelected = Boolean(level)

              return (
                <li key={tool.id}>
                  {/* Selection is carried by a soft lime fill, the same token
                      the rest of the system uses for a chosen item. An outline
                      in accent-strong on top of it would shout — the row is
                      data, not a call to action. */}
                  <div
                    className={`rounded-field px-2 py-1 transition-colors ${
                      isSelected ? "bg-accent-soft" : "hover:bg-panel-2"
                    }`}
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => onToggle(tool.id)}
                      className="flex w-full cursor-pointer items-start gap-2 text-left"
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
                      {/* Tool names are the content of this list, so they carry
                          full ink. Muted here washed the mosaic out. */}
                      <span
                        className={`text-sm leading-snug text-fg ${isSelected ? "font-semibold" : ""}`}
                      >
                        {tool.name}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <LevelRow
                          toolId={tool.id}
                          toolName={tool.name}
                          level={level}
                          onLevel={onLevel}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default ToolPicker
