import React from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { HiArrowDown } from "react-icons/hi2"
import Button from "../components/Button"

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: "easeOut" as const }
})

/**
 * The impact beat, per Binho's note: the invitation lands before any copy
 * about the role. Everything else on the page is downstream of this line.
 *
 * CREATIVE TALENT used to be an 11px pill with a sparkle in it — a caption,
 * competing with the theme toggle. It is now the first thing on the page and
 * it is built like signage: a green-1 slab, brown-1 uppercase Ambit at the
 * family's real 600, tracked wide. Those are the studio's own two colors at
 * their highest contrast (13.7:1), so the loudest element on the page is also
 * the most legible one, which is the only way loud is allowed to work.
 *
 * The slab is `w-fit` and centred rather than full-bleed: a band running the
 * whole measure would read as a page header and swallow the headline under it.
 *
 * The headline under it is SOLID brown-1, not gradient-filled type. The studio
 * site sets every headline it has — the ROOF wordmark, "OUR WORK" — in flat
 * brown over a coloured field. The gradient is the ground; it never climbs
 * into the letterforms.
 */
const Hero: React.FC = () => {
  const { t } = useTranslation()

  const scrollToForm = () =>
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <section className="text-column relative flex min-h-[78vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <motion.p
        {...rise(0)}
        className="banner-type w-fit max-w-full bg-accent px-[0.7em] py-[0.42em] text-ink-on shadow-soft"
        style={{ fontSize: "clamp(1.05rem, 5vw, 2.75rem)" }}
      >
        {t("hero.kicker")}
      </motion.p>

      <motion.h1
        {...rise(0.1)}
        className="text-5xl leading-[1.05] font-semibold tracking-[-0.02em] text-balance text-fg sm:text-6xl md:text-7xl"
      >
        {t("hero.headline")}
      </motion.h1>

      <motion.p
        {...rise(0.2)}
        className="max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg"
      >
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
