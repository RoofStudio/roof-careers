import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiArrowUpRight, HiCheckBadge } from "react-icons/hi2"

const SITE_URL = "https://roofstudio.tv"

/** Replaces the whole page after a successful submit — there is nothing left to do. */
const Thanks: React.FC = () => {
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <section className="text-column flex min-h-[75vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-ink-on shadow-lift"
      >
        <HiCheckBadge aria-hidden className="h-9 w-9" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="max-w-[24ch] text-3xl leading-tight font-extrabold tracking-[-0.02em] text-balance text-fg sm:text-4xl"
      >
        {t("thanks.title")}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.45 }}
        className="flex flex-col items-center gap-3"
      >
        <p className="note text-xl text-fg">{t("thanks.question")}</p>
        <p className="max-w-md leading-relaxed text-muted">{t("thanks.body")}</p>
      </motion.div>

      <motion.a
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45 }}
        href={SITE_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-ink-on shadow-soft transition-colors hover:bg-accent-strong"
      >
        {t("thanks.cta")}
        <HiArrowUpRight aria-hidden className="h-4 w-4" />
      </motion.a>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="note text-lg"
      >
        {t("thanks.bye")}
      </motion.p>
    </section>
  )
}

export default Thanks
