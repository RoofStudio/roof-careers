import React, { useEffect, useRef } from "react"

/**
 * THE STUDIO'S OWN BACKGROUND, PORTED.
 *
 * roofstudio.tv does not paint a CSS gradient. It runs three `<canvas>`
 * elements — `.bg-1`, `.bg-2`, `.bg-3` — each drawing ONE soft blob that
 * drifts forever: ten control points on a ring, each wandering on noise,
 * joined by a cardinal spline, filled flat and blurred. That drift is what
 * gets recognised as "the animation on the site"; a static gradient samples
 * the same hexes and still reads as a different product, because on the
 * studio's site the colour never stops moving.
 *
 * Every constant below is the studio's, read off its own bundle:
 *
 *              colour     centre        radius   spread  speed    tension/segs
 *   .bg-1      #c9973a    .30w × .50h   .48·min   ±100   .0048    .50 / 50
 *   .bg-2      #dfb1df    .46w × .50h   .36·min    ±90   .0024    .48 / 40
 *   .bg-3      #ffd6b8    .46w × .50h   .36·min   ±100   .0028    .50 / 40
 *
 * Only two things are deliberately NOT copied:
 *
 * ONE CANVAS, NOT THREE. The studio gives each page section its own canvas
 * because each section shows a different blob. This page is one long scroll
 * with one background, so three full-viewport canvases would be three
 * clear-and-repaint passes per frame for one picture.
 *
 * THE BLUR IS IN CSS, NOT IN `ctx.filter`. The studio sets
 * `ctx.filter = "blur(20px)"` and then patches Safari — which had no canvas
 * filter — with a CSS blur. Blurring the element instead is one rule, works
 * everywhere, and costs nothing per frame.
 *
 * The canvas OVERHANGS the viewport on every side. A blob is cut off hard at
 * the canvas edge, and a hard cut fed through a blur reads as a bright seam
 * down the side of the screen. The studio hides those seams by making each
 * canvas 130vw and pushing it off-screen; this does the same.
 */

/** The ring the ten control points rest on, in radius units. Not a circle. */
const BLOB_OUTLINE: readonly (readonly [number, number])[] = [
  [-0.55, -0.85],
  [0.05, -1],
  [1.65, -0.7],
  [1.75, -0.1],
  [1.95, 0.35],
  [1.4, 0.72],
  [1, 0.35],
  [-0.45, 0.8],
  [-0.9, 0.4],
  [-1, -0.25]
]

interface BlobSpec {
  /** A brand literal, as the studio paints it. */
  color: string
  /** Resting centre, as a fraction of the CANVAS — which overhangs the viewport. */
  cx: number
  cy: number
  /** Radius as a fraction of the canvas's short side. */
  radius: number
  /** How far a control point may wander from its rest, in px. */
  spread: number
  /** Noise units per frame. Lower is slower. */
  speed: number
  tension: number
  segments: number
  rotate: number
}

/**
 * Yellow up in the top-left, purple down the right, peach along the bottom —
 * the studio's own arrangement, and the one the printed pieces use. Two hues
 * carry any given part of the screen; the site never runs three at once.
 */
const BLOBS: readonly BlobSpec[] = [
  {
    color: "#c9973a",
    cx: 0.3,
    cy: 0.2,
    radius: 0.42,
    spread: 100,
    speed: 0.0048,
    tension: 0.5,
    segments: 50,
    rotate: -10
  },
  {
    color: "#dfb1df",
    cx: 0.82,
    cy: 0.44,
    radius: 0.34,
    spread: 90,
    speed: 0.0024,
    tension: 0.48,
    segments: 40,
    rotate: 0
  },
  {
    color: "#ffd6b8",
    cx: 0.32,
    cy: 0.88,
    radius: 0.34,
    spread: 100,
    speed: 0.0028,
    tension: 0.5,
    segments: 40,
    rotate: -15
  }
]

/** Fraction of the viewport the canvas hangs past each edge. */
const OVERHANG = 0.18

/**
 * A smooth wander in [-1, 1].
 *
 * The studio imports simplex noise for this and then only ever samples the
 * diagonal — `noise2D(t, t)` — which is a one-dimensional slice of it. Hashed
 * value noise with a smoothstep between whole numbers gives the same motion
 * with no dependency: smoothstep is flat at both ends, so the curve has no
 * corner where two intervals meet, and the blob never twitches.
 */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123
  return s - Math.floor(s)
}

const wander = (t: number) => {
  const i = Math.floor(t)
  const f = t - i
  const smooth = f * f * (3 - 2 * f)
  return (hash(i) * (1 - smooth) + hash(i + 1) * smooth) * 2 - 1
}

interface Point {
  ox: number
  oy: number
  x: number
  y: number
  phaseX: number
  phaseY: number
}

/**
 * A cardinal spline through a CLOSED loop of points.
 *
 * Each segment is a cubic Hermite between two points, with the tangent at a
 * point set to the chord across its neighbours, scaled by `tension` — at 0.5
 * that is Catmull-Rom exactly, which is what the studio uses. Without it the
 * ten points join as a visible decagon.
 */
const traceClosedSpline = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  tension: number,
  segments: number
) => {
  const n = points.length
  const at = (i: number) => points[((i % n) + n) % n]

  ctx.moveTo(at(0).x, at(0).y)

  for (let i = 0; i < n; i += 1) {
    const p0 = at(i)
    const p1 = at(i + 1)
    const m0x = (at(i + 1).x - at(i - 1).x) * tension
    const m0y = (at(i + 1).y - at(i - 1).y) * tension
    const m1x = (at(i + 2).x - at(i).x) * tension
    const m1y = (at(i + 2).y - at(i).y) * tension

    for (let s = 1; s <= segments; s += 1) {
      const t = s / segments
      const t2 = t * t
      const t3 = t2 * t
      const h00 = 2 * t3 - 3 * t2 + 1
      const h01 = 3 * t2 - 2 * t3
      const h10 = t3 - 2 * t2 + t
      const h11 = t3 - t2

      ctx.lineTo(
        h00 * p0.x + h01 * p1.x + h10 * m0x + h11 * m1x,
        h00 * p0.y + h01 * p1.y + h10 * m0y + h11 * m1y
      )
    }
  }
}

const BrandBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    let shapes: Point[][] = []
    let frame: number | null = null

    /**
     * Device pixel ratio is deliberately ignored. The picture is three flat
     * fills under a 2rem blur — there is no edge for a retina pixel to
     * sharpen, and honouring DPR would quadruple the fill area on exactly the
     * laptops this page is read on. The studio sizes its canvases to
     * `window.innerWidth` for the same reason.
     */
    const measure = () => {
      width = Math.ceil(window.innerWidth * (1 + OVERHANG * 2))
      height = Math.ceil(window.innerHeight * (1 + OVERHANG * 2))
      canvas.width = width
      canvas.height = height
    }

    const build = () => {
      const short = Math.min(width, height)
      shapes = BLOBS.map((blob) =>
        BLOB_OUTLINE.map(([ux, uy]) => ({
          ox: ux * blob.radius * short,
          oy: uy * blob.radius * short,
          x: 0,
          y: 0,
          // Independent starting phases, so no two points move together.
          phaseX: Math.random() * 1000,
          phaseY: Math.random() * 1000
        }))
      )
    }

    const advance = () => {
      BLOBS.forEach((blob, index) => {
        for (const point of shapes[index]) {
          point.x = point.ox + wander(point.phaseX) * blob.spread
          point.y = point.oy + wander(point.phaseY) * blob.spread
          point.phaseX += blob.speed
          point.phaseY += blob.speed
        }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      BLOBS.forEach((blob, index) => {
        ctx.save()
        ctx.translate(blob.cx * width, blob.cy * height)
        ctx.rotate((blob.rotate * Math.PI) / 180)
        ctx.beginPath()
        traceClosedSpline(ctx, shapes[index], blob.tension, blob.segments)
        ctx.closePath()
        ctx.fillStyle = blob.color
        ctx.fill()
        ctx.restore()
      })
    }

    const tick = () => {
      advance()
      draw()
      frame = requestAnimationFrame(tick)
    }

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
    }

    const start = () => {
      if (frame === null && !reduceMotion) frame = requestAnimationFrame(tick)
    }

    /** A background nobody is looking at must not keep a fan running. */
    const onVisibility = () => (document.hidden ? stop() : start())

    /**
     * Re-rolling the phases on resize would make the whole picture jump. Only
     * the geometry is recomputed; the wander carries on from where it was.
     */
    const onResize = () => {
      const before = Math.min(width, height)
      measure()
      const after = Math.min(width, height)

      if (after !== before) {
        BLOBS.forEach((blob, index) => {
          shapes[index].forEach((point, i) => {
            point.ox = BLOB_OUTLINE[i][0] * blob.radius * after
            point.oy = BLOB_OUTLINE[i][1] * blob.radius * after
          })
        })
      }

      // Resizing the canvas clears it, so a frozen picture has to be redrawn.
      if (reduceMotion) {
        advance()
        draw()
      }
    }

    measure()
    build()
    advance()
    draw()

    if (!reduceMotion) {
      start()
      document.addEventListener("visibilitychange", onVisibility)
    }
    window.addEventListener("resize", onResize)

    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div aria-hidden className="brand-bg">
      <canvas ref={canvasRef} className="brand-bg-canvas" />
    </div>
  )
}

export default BrandBackground
