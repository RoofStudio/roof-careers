import React from "react"
import { useTranslation } from "react-i18next"
import wordmark from "../assets/roof-wordmark.png"

/** The file's own proportion. Guessing it draws the mark inside dead space. */
export const WORDMARK_RATIO = "892 / 319"
export const WORDMARK_SRC = wordmark

interface RoofWordmarkProps {
  className?: string
  decorative?: boolean
}

/**
 * A marca ROOF — the pattern from roof-intelligence.
 *
 * `roof-wordmark.png` is the OFFICIAL filled artwork (the file shipped as
 * `roof-logo-brown.png` in roof-onboarding-app). Do not reach for that repo's
 * `roof-logo.png`: it is a different, outline drawing — 248×319 of contour, not
 * the mark — and it is what this page was wrongly painting behind the content.
 *
 * Only the ALPHA channel is used, as a mask, painted with `--brand-logo`. The
 * official brown and white files have identical alpha, so one asset serves both
 * themes: brown (#322127) on light, white (#f9f9f9) on dark. Two files would
 * only be two chances to forget one.
 *
 * `--brand-logo` is a BRAND token, deliberately separate from `--fg`: the logo
 * does not follow the interface's ink, it has its own color.
 */
const RoofWordmark: React.FC<RoofWordmarkProps> = ({ className = "w-24", decorative = false }) => {
  const { t } = useTranslation()

  return (
    <span
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : t("brand.logoAlt")}
      className={`inline-block shrink-0 bg-brand-logo ${className}`}
      style={{
        aspectRatio: WORDMARK_RATIO,
        WebkitMaskImage: `url(${wordmark})`,
        maskImage: `url(${wordmark})`,
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain"
      }}
    />
  )
}

export default RoofWordmark
