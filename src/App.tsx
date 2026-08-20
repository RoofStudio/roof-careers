import React, { useState } from "react"
import { useTranslation } from "react-i18next"
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

      <footer className="border-t border-line/60 px-5 py-6 text-center sm:px-8">
        <p className="text-xs text-faint">
          © {new Date().getFullYear()} {t("footer.rights")}
        </p>
      </footer>
    </div>
  )
}

export default App
