/**
 * The two chip questions that carry the signals the team needs to filter on —
 * without ever asking for them directly, and without a single line of prose.
 *
 * The brief was: find out whether someone has directed, whether they have a
 * short film, what their pipeline looks like — "sem perguntar explicitamente e
 * sem deixar a pessoa escrever sobre isso. Para não ficar longo."
 *
 * So:
 *   ROLES     asks about the WORK, never the person. "Are you a director?" is a
 *             question about identity and people either inflate or shrink from
 *             it. "Which roles have you delivered a project in?" is a question
 *             about facts. Ticking `director` answers "has this person
 *             directed" without the word ever being aimed at them. How MANY
 *             they tick separates the generalist from the specialist for free.
 *
 *   PUBLISHED asks WHERE the work was seen rather than yes/no, so "do they have
 *             a short?" becomes a filterable column instead of a line of text
 *             someone has to read. Ticking any of these reveals a single link
 *             field; ticking none leaves the form exactly as short as it was.
 *
 * The pipeline is not here on purpose — it is read off the tool selection in
 * `tools.ts`, which costs no question at all.
 *
 * `id` is the spreadsheet column, so it must stay stable. Every id gets its own
 * column: filtering "who has directed" has to be one click, not a text search.
 */

export interface Chip {
  id: string
  labelKey: string
}

export const ROLES: Chip[] = [
  { id: "director", labelKey: "profile.roles.director" },
  { id: "art-director", labelKey: "profile.roles.artDirector" },
  { id: "animator", labelKey: "profile.roles.animator" },
  { id: "designer", labelKey: "profile.roles.designer" },
  { id: "storyboard", labelKey: "profile.roles.storyboard" },
  { id: "modeling", labelKey: "profile.roles.modeling" },
  { id: "lookdev", labelKey: "profile.roles.lookdev" },
  { id: "compositor", labelKey: "profile.roles.compositor" },
  { id: "editor", labelKey: "profile.roles.editor" }
]

export const PUBLISHED_WORK: Chip[] = [
  { id: "short-film", labelKey: "profile.published.shortFilm" },
  { id: "festival", labelKey: "profile.published.festival" },
  { id: "commercial", labelKey: "profile.published.commercial" },
  { id: "music-video", labelKey: "profile.published.musicVideo" },
  { id: "series", labelKey: "profile.published.series" },
  { id: "game", labelKey: "profile.published.game" },
  { id: "installation", labelKey: "profile.published.installation" }
]
