import React from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiArrowDown } from "react-icons/hi2"
import Button from "../components/Button"

// Three, not four. `p2` and `p4` both opened with "We're looking for" and
// were the same paragraph twice; they are one now.
const PARAGRAPHS = ["about.p1", "about.p2", "about.p3"] as const

/**
 * The role, in the deck's words — and, at its foot, the only way in.
 *
 * THE PAGE'S LAYOUT IS THE STUDIO'S: a narrow label column on the left, the
 * content on the right, a hairline across the top and nothing boxed. It is
 * how roofstudio.tv sets AWARDS, how it sets a project's credits, and how
 * every block on this page is set from here down.
 *
 * The copy is GT Alpina Light Italic — the running voice — with only the
 * label and the title left in Ambit. "Craft first." closes the block as the
 * signature line, which is exactly where the copy puts it.
 */
const About: React.FC = () => {
  const { t } = useTranslation()

  /**
   * From here the next step really is the form: the invitation has been made
   * by the paragraphs above, so there is nothing left to read in between.
   */
  const scrollToForm = () =>
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <section id="about" className="wide-column scroll-mt-24 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-8 border-t border-rule/25 pt-10 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-14"
      >
        <div>
          <p className="label">{t("about.label")}</p>
          <h2
            className="banner-type mt-3 text-fg"
            style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.75rem)" }}
          >
            {t("about.title")}
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {PARAGRAPHS.map((key) => (
            <p key={key} className="voice max-w-[58ch] text-xl text-muted sm:text-2xl">
              {t(key)}
            </p>
          ))}

          <p
            className="voice mt-4 text-fg"
            style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.75rem)" }}
          >
            {t("about.closing")}
          </p>

          {/* THE ONLY BUTTON ON THE WAY IN, and it belongs here rather than on
              the hero: up there it was a door out of the argument, and anyone
              who took it never read a word of what they were applying to.
              Below the copy it is the answer to "Craft first.", not a way
              around it.

              IT SITS ON THE RIGHT EDGE, WHICH IS AN ALIGNMENT AND NOT A
              FLOAT. The paragraphs stop at their 58ch measure, but this
              column runs to where the hairline above ends — so `items-end`
              lands the block on the same vertical the section opened on, and
              the corner reads as built rather than as a button that drifted.
              On a phone the grid collapses to one column and it is simply
              flush right under the copy. */}
          <div className="mt-6 flex flex-col items-end gap-3">
            <Button
              size="lg"
              onClick={scrollToForm}
              iconRight={<HiArrowDown className="h-4 w-4" />}
            >
              {t("about.cta")}
            </Button>
            <span className="text-sm text-faint">{t("about.time")}</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default About
