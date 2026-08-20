import React from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiArrowDown, HiSparkles } from "react-icons/hi2"
import Button from "../components/Button"

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: "easeOut" as const }
})

/**
 * The impact beat, per Binho's note: the invitation lands before any copy
 * about the role. Everything else on the page is downstream of this line.
 */
const Hero: React.FC = () => {
  const { t } = useTranslation()

  const scrollToForm = () =>
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <section className="text-column relative flex min-h-[78vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <motion.div
        {...rise(0)}
        className="flex items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-1.5 shadow-soft"
      >
        <HiSparkles aria-hidden className="h-3.5 w-3.5 text-brand-accent" />
        <span className="label">{t("hero.kicker")}</span>
      </motion.div>

      <motion.h1
        {...rise(0.1)}
        className="hero-text-gradient text-5xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-6xl md:text-7xl"
      >
        {t("hero.headline")}
      </motion.h1>

      <motion.p {...rise(0.2)} className="max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg">
        {t("hero.lead")}
      </motion.p>

      <motion.p {...rise(0.28)} className="note text-xl text-fg sm:text-2xl">
        {t("hero.question")}
      </motion.p>

      <motion.div {...rise(0.36)} className="flex flex-col items-center gap-3">
        <Button size="lg" onClick={scrollToForm} iconRight={<HiArrowDown className="h-4 w-4" />}>
          {t("hero.cta")}
        </Button>
        <span className="text-xs text-faint">{t("hero.time")}</span>
      </motion.div>
    </section>
  )
}

export default Hero
