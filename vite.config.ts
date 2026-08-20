import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

/**
 * `base` decides where the built asset URLs point.
 *
 *   GitHub Pages at <user>.github.io/roof-careers  -> "/roof-careers/"  (default)
 *   custom domain (CNAME) or local preview         -> "/"
 *
 * The deploy workflow passes BASE_PATH so the same source builds for both.
 */
export default defineConfig({
  base: process.env.BASE_PATH ?? "/roof-careers/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist", sourcemap: false }
})
