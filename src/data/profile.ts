/**
 * The profile questions, from FORM_ROUGH_V9.
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

const choice = (id: string, key: string): Choice => ({ id, labelKey: `profile.${key}.${id}` })

/** Q1 — the headline answer, and the first filter anyone will reach for. */
export const PRIMARY_EXPERTISE: Choice[] = ["art-director", "designer", "animator", "other"].map(
  (id) => choice(id, "expertise")
)

/** Q2 — how much of the creative call is theirs. */
export const RESPONSIBILITY: Choice[] = ["execute", "develop", "lead", "drive"].map((id) =>
  choice(id, "responsibility")
)

/** Q3 — the same axis seen from the day-to-day rather than from the job title. */
export const WORK_MODE: Choice[] = [
  "defined-direction",
  "autonomy",
  "area-lead",
  "creative-lead"
].map((id) => choice(id, "workMode"))

/** Q4 — how far down the pipeline they stay. Separates concept from finishing. */
export const PROJECT_REACH: Choice[] = [
  "concept-development",
  "concept-production",
  "concept-final",
  "end-to-end"
].map((id) => choice(id, "reach"))

/** Q5 — the difficulty they take on, not the volume. */
export const VISUAL_CHALLENGE: Choice[] = [
  "execution",
  "complex-solutions",
  "visual-languages",
  "leading-complex"
].map((id) => choice(id, "challenge"))

/** Q6 — where AI actually sits in the process, from a tool to a pipeline. */
export const AI_INTEGRATION: Choice[] = ["development", "production", "pipeline"].map((id) =>
  choice(id, "aiIntegration")
)

/**
 * Q7 — multi select. These are modes, not rungs: someone can combine tools AND
 * build custom workflows, and forcing a single answer would throw away the
 * overlap that actually distinguishes people.
 */
export const AI_WORKFLOW: Choice[] = ["combine", "customized", "node-based", "per-project"].map(
  (id) => choice(id, "aiWorkflow")
)

/** Q8 — what they are best at, in their own words but from a fixed list. */
export const CORE_STRENGTH: Choice[] = [
  "concepts-directions",
  "complex-challenges",
  "languages-worlds",
  "execution-refinement"
].map((id) => choice(id, "strength"))

/** Q9 — ownership of the final quality, which is where craft shows or does not. */
export const FINISHING: Choice[] = ["oversee", "develop-refine", "responsible", "elevate"].map(
  (id) => choice(id, "finishing")
)

/**
 * Multi select. V9 collapsed V5's 25 granular stages into 7 areas — the fine
 * grain was asking a candidate to fill in a production schedule.
 */
export const PIPELINE_AREAS: Choice[] = [
  "direction-concept",
  "design-2d",
  "3d-animation",
  "pre-production",
  "vfx-post",
  "color-finishing",
  "production"
].map((id) => choice(id, "pipeline"))

/** Multi select, and the only question that opens a link per option. */
export const PROJECT_TYPES: Choice[] = [
  "feature-film",
  "short-film",
  "commercial",
  "music-video",
  "animation-film",
  "series",
  "branded-content",
  "digital-campaign",
  "experimental",
  "generative-film"
].map((id) => choice(id, "projectType"))
