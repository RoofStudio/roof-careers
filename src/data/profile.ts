/**
 * The profile questions, from FORM_ROUGH_V9 as trimmed in the August 2026 pass.
 *
 * Every one of them is a click. The brief was to learn how senior someone is,
 * how far they carry a project and whether they have directed — "sem perguntar
 * explicitamente e sem deixar a pessoa escrever sobre isso".
 *
 * V9 replaced V5's flat list of 26 practice areas with nine ladders. A ladder
 * asks about the WORK ("how far do you typically follow a project?") rather
 * than about the person ("are you senior?"), which is the only version of that
 * question people answer honestly.
 *
 * SIX OF THOSE NINE ARE GONE. Responsibility, work mode, visual challenge and
 * finishing all asked the same thing from four angles, and by the fourth the
 * candidate can see the ruler being held up. Project reach and AI integration
 * followed them: reach is already answered by the pipeline areas someone ticks,
 * and AI integration by the workflow question two rows below it.
 *
 * Three questions left, and each one is the only place it is asked.
 *
 * EVERY LIST IS MULTI-SELECT. There is no single-answer question left in the
 * form: a designer who also animates was previously forced to pick a lie, and
 * the overlap is the most useful thing on the page.
 *
 * `PROJECT_TYPES` stays the sharpest of them: it asks where the person held a
 * creative or artistic LEADERSHIP role, so "have they directed?" is answered as
 * a fact about the work, and each type reveals its own link only once ticked.
 *
 * `id` becomes a spreadsheet column, so ids must stay stable. Labels live in
 * the locale files; only the ids are here.
 */

export interface Choice {
  id: string
  labelKey: string
}

/** Q1 — the headline answer, and the first filter anyone will reach for. */
export const PRIMARY_EXPERTISE: Choice[] = ["art-director", "designer", "animator", "other"].map(
  (id) => ({ id, labelKey: `profile.expertise.${id}` })
)

/**
 * Q2 — modes, not rungs: someone can combine tools AND build custom workflows,
 * and forcing a single answer would throw away the overlap that actually
 * distinguishes people.
 */
export const AI_WORKFLOW: Choice[] = ["combine", "customized", "node-based", "per-project"].map(
  (id) => ({ id, labelKey: `profile.aiWorkflow.${id}` })
)

/** Q3 — what they are best at, in their own words but from a fixed list. */
export const CORE_STRENGTH: Choice[] = [
  "concepts-directions",
  "complex-challenges",
  "languages-worlds",
  "execution-refinement"
].map((id) => ({ id, labelKey: `profile.strength.${id}` }))

/**
 * The pipeline as the studio actually splits it — direction at the top,
 * 2D and 3D as separate crafts rather than one "animation" bucket, and
 * finishing folded into post.
 *
 * `pre-production`, `3d-animation` and `production` keep the ids they had in
 * V9 so answers already in the sheet still line up under those columns.
 */
export const PIPELINE_AREAS: Choice[] = [
  "direction",
  "pre-production",
  "2d-animation",
  "3d-animation",
  "vfx",
  "post-finishing",
  "production"
].map((id) => ({ id, labelKey: `profile.pipeline.${id}` }))

/** Multi select, and the only question that opens a link per option. */
export const PROJECT_TYPES: Choice[] = [
  "feature-film",
  "short-film",
  "commercial",
  "music-video",
  "series",
  "generative-film"
].map((id) => ({ id, labelKey: `profile.projectType.${id}` }))
