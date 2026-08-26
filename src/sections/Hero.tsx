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
 * The impact beat: the invitation lands before any copy about the role.
 *
 * THE TWO FACES SPLIT THE WAY THE STUDIO SPLITS THEM. On roofstudio.tv every
 * block is a pair — "OUR WORK" in Ambit caps, then "Built from Scratch, Seen
 * Worldwide" underneath in GT Alpina Light Italic. That is the pattern here:
 * CREATIVE TALENT and the button are Ambit, and everything that actually
 * speaks — the headline, the lead, the question — is the italic serif.
 *
 * CREATIVE TALENT is the brandbook's text gradient (§2.3): a Deep Coffee
 * block with Golden Ochre → Base Sand → Warm Pink running through the
 * letterforms. It is `w-fit` and centred rather than full-bleed — a band
 * running the whole measure would read as a page header and swallow the
 * headline under it.
 *
 * THE HEADLINE'S TWO LINES ARE DATA, NOT LUCK. It used to be one string in a
 * `max-w-[15ch]` box, and the box decided where to break it — which came out
 * as three lines with "Roof" and "Studio" on either side of one of them. The
 * name of the studio does not get split, so the break lives in the locale
 * file where a translator can see it, the width cap is gone, and the clamp
 * floor is set where the longer of the two lines still fits a 360px phone.
 */
const Hero: React.FC = () => {
  const { t } = useTranslation()

  const scrollToForm = () =>
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <section className="wide-column relative flex min-h-[85vh] flex-col items-center justify-center gap-8 py-24 text-center">
      {/* Two elements, and it has to be two: the Deep Coffee block is the
          parent because `background-clip: text` on the inner span would clip
          the block's own colour to the glyphs as well. The size lives on the
          parent so its `em` padding tracks the type. */}
      <motion.div
        {...rise(0)}
        className="w-fit max-w-full bg-fg px-[0.5em] py-[0.28em]"
        style={{ fontSize: "clamp(1.5rem, 4.6vw, 3.75rem)" }}
      >
        <p className="banner-type text-gradient">{t("hero.kicker")}</p>
      </motion.div>

      <motion.h1
        {...rise(0.1)}
        className="voice-display"
        style={{ fontSize: "clamp(1.85rem, 6.4vw, 7rem)" }}
      >
        <span className="block">{t("hero.headline.line1")}</span>
        <span className="block">{t("hero.headline.line2")}</span>
      </motion.h1>

      <motion.p
        {...rise(0.2)}
        className="voice max-w-[38ch] text-balance text-muted"
        style={{ fontSize: "clamp(1.15rem, 2.5vw, 2.125rem)" }}
      >
        {t("hero.lead")}
      </motion.p>

      <motion.p
        {...rise(0.28)}
        className="voice text-fg"
        style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.85rem)" }}
      >
        {t("hero.question")}
      </motion.p>

      <motion.div {...rise(0.36)} className="flex flex-col items-center gap-3">
        <Button size="lg" onClick={scrollToForm} iconRight={<HiArrowDown className="h-4 w-4" />}>
          {t("hero.cta")}
        </Button>
        <span className="text-sm text-faint">{t("hero.time")}</span>
      </motion.div>
    </section>
  )
}

export default Hero
