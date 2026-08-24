import React from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

const PARAGRAPHS = ["about.p1", "about.p2", "about.p3", "about.p4"] as const

/**
 * The role, in the deck's words. Copy only — the ask lives in the form below.
 *
 * "CREATIVE TALENT" is the section title now rather than a 14px subtitle under
 * "Craft first", and "Craft first." closes the card as the signature line —
 * which is exactly where the copy puts it. It used to run as the heading AND
 * as a caption, so the reader met the tagline before the argument for it.
 */
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

        <h2
          className="banner-type text-fg"
          style={{ fontSize: "clamp(1.4rem, 4.4vw, 2.4rem)" }}
        >
          {t("about.title")}
        </h2>

        <div className="mt-7 flex flex-col gap-5">
          {PARAGRAPHS.map((key) => (
            <p key={key} className="text-[0.95rem] leading-relaxed text-muted sm:text-base">
              {t(key)}
            </p>
          ))}
        </div>

        <p className="note mt-8 border-t border-line pt-6 text-2xl text-fg sm:text-3xl">
          {t("about.closing")}
        </p>
      </motion.div>
    </section>
  )
}

export default About
