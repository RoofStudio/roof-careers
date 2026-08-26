import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import BrandBackground from "./components/BrandBackground"
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
    <>
      <BrandBackground />

      {/* Everything the reader touches sits ABOVE the background layer. The
          two are siblings rather than nested so the canvas can be `fixed`
          without a card's shadow or the sticky bar accidentally landing
          under it. */}
      <div className="relative z-10 flex min-h-screen flex-col">
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
            which is the last thing a candidate sees. */}
        <div className="wide-column flex justify-center pt-4 pb-10 sm:pt-8">
          <RoofWordmark decorative className="w-full max-w-[52rem]" />
        </div>

        <footer className="border-t border-line/60 px-5 py-6 text-center sm:px-8">
          <p className="text-xs text-faint">
            © {new Date().getFullYear()} {t("footer.rights")}
          </p>
        </footer>
      </div>
    </>
  )
}

export default App
