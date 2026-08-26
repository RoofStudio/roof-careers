import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import RoofWordmark from "./components/RoofWordmark"
import TopBar from "./components/TopBar"
import Hero from "./sections/Hero"
import About from "./sections/About"
import ApplicationForm from "./sections/ApplicationForm"
import Thanks from "./sections/Thanks"

const App: React.FC = () => {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      {/* A plain swap, not an AnimatePresence crossfade: `mode="wait"` keeps
          the outgoing subtree mounted until its exit animation reports done,
          and this subtree is large enough (nested AnimatePresence inside the
          tool picker, whileInView sections) that a missed completion would
          strand the candidate on a spinning submit button. Thanks brings its
          own entrance animation, so nothing is lost. */}
      <main className="flex-1">
        {submitted ? (
          <Thanks />
        ) : (
          <>
            <Hero />
            <About />
            <ApplicationForm onSuccess={() => setSubmitted(true)} />
          </>
        )}
      </main>

      {/* THE CLOSING MARK, and it is built the way the studio's posters are
          built: ROOF runs the width of the piece along the bottom edge, flat
          brand ink over the coloured ground, with the fine print under it.

          Decorative on purpose — the mark in the top bar is the one that
          announces the brand to a screen reader, and announcing it twice
          would just be "Roof Studio, Roof Studio" at the end of the page.

          It lives outside `<main>` so it also closes the thank-you screen,
          which is the last thing a candidate sees.

          THE PADDING IS THE BRANDBOOK'S SAFETY MARGIN (§1.4), not a spacing
          choice. `x` is the width of the R's vertical stem, and the mark
          owes itself that much clear space on every side. Measured off the
          artwork, the stem is 45 of its 892px — 5.05% of however wide the
          mark is drawn. Percentage padding resolves against this row's
          width, which is never NARROWER than the mark, so 5.05% here is
          always at least one x. It used to be pb-10: 40px of clearance
          under a mark that was asking for 42. */}
      <div className="wide-column flex justify-center">
        <div className="w-full max-w-[52rem] py-[5.05%]">
          <RoofWordmark decorative className="w-full" />
        </div>
      </div>

      <footer className="border-t border-rule/15 px-5 py-8 text-center sm:px-8">
        <p className="text-sm text-faint">
          © {new Date().getFullYear()} {t("footer.rights")}
        </p>
      </footer>
    </div>
  )
}

export default App
