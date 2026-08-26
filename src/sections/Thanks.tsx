import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiArrowUpRight } from "react-icons/hi2"

const SITE_URL = "https://roofstudio.tv"

/**
 * Replaces the whole page after a successful submit — there is nothing left
 * to do.
 *
 * The green check badge is gone. Powerful Green is the brand's emphasis
 * colour, and it is already doing that job on the button below; a lime disc
 * floating above the headline was a UI-kit success icon, not a Roof one. The
 * headline says it instead, in caps, which is what the brandbook asks of a
 * headline anyway.
 */
const Thanks: React.FC = () => {
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <section className="wide-column flex min-h-[70vh] flex-col justify-center py-24">
      <div className="grid gap-8 border-t border-rule/25 pt-10 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-14">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="label md:pt-1"
        >
          {t("about.label")}
        </motion.p>

        <div className="flex max-w-[46rem] flex-col items-start gap-7">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="headline max-w-[18ch] text-balance"
            style={{ fontSize: "clamp(2rem, 5.2vw, 4.5rem)" }}
          >
            {t("thanks.title")}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="flex flex-col gap-3"
          >
            <p className="voice text-3xl text-fg">{t("thanks.question")}</p>
            <p className="voice max-w-[52ch] text-xl text-muted">{t("thanks.body")}</p>
          </motion.div>

          <motion.a
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.45 }}
            href={SITE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2.5 rounded-full bg-fg px-9 py-4 text-lg font-semibold tracking-[-0.02em] text-ink-on-dark uppercase transition-colors hover:bg-muted"
          >
            {t("thanks.cta")}
            <HiArrowUpRight aria-hidden className="h-4 w-4" />
          </motion.a>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="voice text-xl"
          >
            {t("thanks.bye")}
          </motion.p>
        </div>
      </div>
    </section>
  )
}

export default Thanks
