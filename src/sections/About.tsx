import React from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiSparkles } from "react-icons/hi2"

const PARAGRAPHS = ["about.p1", "about.p2", "about.p3", "about.p4", "about.p5"] as const

/** The role, in the deck's words. Copy only — the ask lives in the form below. */
const About: React.FC = () => {
  const { t } = useTranslation()

  return (
    <section className="text-column pb-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-card border border-line bg-panel p-7 shadow-card sm:p-10"
      >
        <p className="label mb-4">{t("about.label")}</p>

        <h2 className="display text-2xl sm:text-3xl">{t("about.title")}</h2>
        <p className="mt-1.5 text-sm font-medium tracking-wide text-brand-accent">
          {t("about.subtitle")}
        </p>

        <div className="mt-7 flex flex-col gap-5">
          {PARAGRAPHS.map((key) => (
            <p key={key} className="text-[0.95rem] leading-relaxed text-muted sm:text-base">
              {t(key)}
            </p>
          ))}
        </div>

        <p className="mt-8 flex items-center gap-2 border-t border-line pt-6 text-lg text-fg">
          <span className="note text-xl">{t("about.closing")}</span>
          <HiSparkles aria-hidden className="h-4 w-4 shrink-0 text-viz-amber" />
        </p>
      </motion.div>
    </section>
  )
}

export default About
