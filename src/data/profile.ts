/**
 * The profile questions, from FORMULARIO ROUGH V5.
 *
 * Every one of them is a click. There is no free-text field in here by design:
 * the brief was to learn whether someone has directed, whether they have a
 * short film and what their pipeline looks like "sem perguntar explicitamente e
 * sem deixar a pessoa escrever sobre isso".
 *
 * `PROJECT_TYPES` is the sharpest of them. It asks in which kinds of project
 * the person held a LEADING creative role, so "have they directed?" is answered
 * as a fact about the work rather than a question about the person — and each
 * type reveals its own credits link only once ticked, so the form grows only
 * for people who have something to put there.
 *
 * `id` becomes a spreadsheet column, so ids must stay stable. Labels live in
 * the locale files; only the ids are here.
 */

export interface Choice {
  id: string
  labelKey: string
}

const choice = (id: string, key: string): Choice => ({ id, labelKey: `profile.${key}.${id}` })

/** Single select — the headline answer, and the first filter anyone will use. */
export const PRIMARY_EXPERTISE: Choice[] = [
  "art-director",
  "designer",
  "animator",
  "other"
].map((id) => choice(id, "expertise"))

/** Multi select. Breadth here separates the generalist from the specialist. */
export const PRACTICE_AREAS: Choice[] = [
  "art-direction",
  "creative-direction",
  "graphic-design",
  "motion-design",
  "2d-animation",
  "3d-animation",
  "character-animation",
  "character-design",
  "concept-art",
  "visual-development",
  "storyboard",
  "previs",
  "3d-modeling",
  "3d-generalist",
  "rigging",
  "motion-capture",
  "facial-animation",
  "vfx",
  "compositing",
  "look-development",
  "environment-design",
  "lighting",
  "virtual-production",
  "editing",
  "color-finishing",
  "generative-art"
].map((id) => choice(id, "practice"))

/**
 * Multi select — how they actually assemble tools, not how good they claim to
 * be. This and `AI_RELATIONSHIP` are the only two AI questions left: V5 had a
 * third ("how would you describe your experience with AI tools", a
 * beginner→expert ladder) which measured almost exactly what the relationship
 * question measures, one right after the other. Asking the same thing twice
 * does not double the signal, it just costs the candidate a question.
 */
export const AI_WORKFLOW: Choice[] = [
  "as-is",
  "combine",
  "customized",
  "node-based",
  "per-project",
  "technical-pipelines"
].map((id) => choice(id, "aiWorkflow"))

/** Single select — attitude, which is what tells you who to talk to first. */
export const AI_RELATIONSHIP: Choice[] = [
  "professional",
  "creative-development",
  "starting",
  "exploring",
  "curious"
].map((id) => choice(id, "aiRelationship"))

/**
 * Multi select, and the only question that opens a text field — one credits
 * link per project type, revealed on tick.
 */
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

/** Multi select. The pipeline, stated rather than inferred. */
export const PIPELINE_STAGES: Choice[] = [
  "concept-development",
  "art-direction",
  "design",
  "visual-development",
  "storyboard",
  "previs",
  "production-live-action",
  "2d-animation",
  "3d-animation",
  "character-development",
  "3d-modeling",
  "texturing",
  "rigging",
  "motion-capture",
  "layout",
  "lighting",
  "vfx",
  "compositing",
  "rotoscoping",
  "editing",
  "color-finishing",
  "sound-music",
  "localization",
  "restoration-upscaling",
  "final-delivery"
].map((id) => choice(id, "stage"))
