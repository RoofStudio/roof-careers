/**
 * The tool catalogue — 8 areas, 90 checkboxes.
 *
 * V9 cut this by more than half against V5 (20 areas, 300 checkboxes), which
 * was the right call: a checklist nobody finishes measures patience, not craft.
 * The August 2026 pass cut it again and refocused it on the part of the
 * pipeline this hire actually touches:
 *
 *   - Editing, color, voice, sound, music and marketing are GONE. They were
 *     asking a Designer about ADR software.
 *   - AI workflow / node-based and Production management / planning open the
 *     list, because "which node graph do you actually live in" turned out to
 *     be the sharpest question in the whole form.
 *   - Concept art and storyboard/previs merged; 3D/modeling and
 *     character/rigging merged. Nobody who does one does not do the other,
 *     and splitting them just made the same person tick twice.
 *
 * A TOOL STILL APPEARS IN EVERY AREA IT BELONGS TO, ON PURPOSE.
 * "Runway for VFX" and "Runway for storyboard" are different facts about a
 * person, so a selection is keyed by AREA + TOOL, never by tool alone. In the
 * sheet the two views reconcile: one column per distinct tool, holding the list
 * of areas it was picked in. One filter then answers both who works with it and
 * for what.
 *
 * `id` is what becomes a spreadsheet column, so it must stay stable even if a
 * product renames itself: change the `name`, keep the `id`.
 */

export interface Tool {
  id: string
  name: string
}

export interface ToolGroup {
  id: string
  labelKey: string
  /** Area swatch from the brand palette — decoration, never state. */
  accent: string
  tools: Tool[]
}

const x = (id: string, name: string): Tool => ({ id, name })

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "ai-workflow",
    labelKey: "tools.groups.ai-workflow",
    accent: "bg-viz-green",
    tools: [
      x("comfyui", "ComfyUI"),
      x("invokeai", "InvokeAI"),
      x("swarmui", "SwarmUI"),
      x("automatic1111", "AUTOMATIC1111 / Stable Diffusion WebUI"),
      x("sd-webui-forge", "Stable Diffusion WebUI Forge"),
      x("fooocus", "Fooocus"),
      x("figma-weave", "Figma Weave")
    ]
  },
  {
    id: "production-management",
    labelKey: "tools.groups.production-management",
    accent: "bg-viz-yellow",
    tools: [
      x("filmustage", "Filmustage"),
      x("studiobinder", "StudioBinder"),
      x("celtx", "Celtx"),
      x("movie-magic-scheduling", "Movie Magic Scheduling"),
      x("movie-magic-budgeting", "Movie Magic Budgeting"),
      x("scenechronize", "Scenechronize"),
      x("sethero", "SetHero"),
      x("shot-lister", "Shot Lister")
    ]
  },
  {
    id: "development",
    labelKey: "tools.groups.development",
    accent: "bg-viz-purple",
    tools: [
      x("chatgpt", "ChatGPT"),
      x("claude", "Claude"),
      x("google-gemini", "Google Gemini"),
      x("perplexity", "Perplexity"),
      x("ltx-studio", "LTX Studio")
    ]
  },
  {
    // Concept art and storyboard, merged. `concept` keeps its id so picks
    // already sitting in the sheet under that area still resolve.
    id: "concept",
    labelKey: "tools.groups.concept",
    accent: "bg-viz-beige",
    tools: [
      x("midjourney", "Midjourney"),
      x("chatgpt-gpt-image", "ChatGPT / GPT Image"),
      x("flux", "FLUX"),
      x("adobe-firefly", "Adobe Firefly"),
      x("comfyui", "ComfyUI"),
      x("stable-diffusion", "Stable Diffusion"),
      x("krea", "Krea"),
      x("ideogram", "Ideogram"),
      x("recraft", "Recraft"),
      x("leonardo-ai", "Leonardo AI"),
      x("magnific", "Magnific"),
      x("scenario", "Scenario"),
      x("ltx-studio", "LTX Studio"),
      x("runway", "Runway"),
      x("kling", "Kling"),
      x("google-veo", "Google Veo"),
      x("sora", "Sora"),
      x("luma", "Luma"),
      x("boords", "Boords")
    ]
  },
  {
    // 3D/modeling and character/rigging, merged. `modeling` keeps its id.
    id: "modeling",
    labelKey: "tools.groups.modeling",
    accent: "bg-viz-green",
    tools: [
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
      x("meshy", "Meshy"),
      x("tripo-ai", "Tripo AI"),
      x("hyper3d-rodin", "Hyper3D / Rodin"),
      x("luma-3d", "Luma 3D"),
      x("kaedim", "Kaedim"),
      x("csm", "CSM"),
      x("hunyuan3d", "Hunyuan3D"),
      x("trellis", "Trellis"),
      x("stable-fast-3d", "Stable Fast 3D"),
      x("cascadeur", "Cascadeur"),
      x("deepmotion-animate-3d", "DeepMotion Animate 3D"),
      x("move-ai", "Move AI"),
      x("rokoko", "Rokoko"),
      x("plask", "Plask"),
      x("metahuman-animator", "MetaHuman Animator"),
      x("mixamo", "Mixamo"),
      x("accurig", "AccuRIG"),
      x("wonder-studio-dynamics", "Wonder Studio / Dynamics"),
      x("comfyui", "ComfyUI")
    ]
  },
  {
    id: "mocap",
    labelKey: "tools.groups.mocap",
    accent: "bg-viz-purple",
    tools: [
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
      x("move-ai", "Move AI"),
      x("rokoko", "Rokoko"),
      x("deepmotion-animate-3d", "DeepMotion Animate 3D"),
      x("metahuman-animator", "MetaHuman Animator"),
      x("mediapipe", "MediaPipe"),
      x("openpose", "OpenPose"),
      x("faceware", "Faceware")
    ]
  },
  {
    id: "video",
    labelKey: "tools.groups.video",
    accent: "bg-viz-beige",
    tools: [
      x("runway", "Runway"),
      x("google-veo", "Google Veo"),
      x("kling", "Kling"),
      x("sora", "Sora"),
      x("luma", "Luma"),
      x("pika", "Pika"),
      x("hailuo", "Hailuo"),
      x("vidu", "Vidu"),
      x("seedance", "Seedance"),
      x("wan", "Wan"),
      x("hunyuanvideo", "HunyuanVideo"),
      x("ltx-video", "LTX Video"),
      x("adobe-firefly-video", "Adobe Firefly Video")
    ]
  },
  {
    id: "vfx",
    labelKey: "tools.groups.vfx",
    accent: "bg-viz-yellow",
    tools: [
      x("runway", "Runway"),
      x("nuke", "Nuke"),
      x("adobe-after-effects", "Adobe After Effects"),
      x("davinci-resolve", "DaVinci Resolve"),
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
      x("wonder-studio", "Wonder Studio"),
      x("wonder-dynamics", "Wonder Dynamics"),
      x("comfyui", "ComfyUI"),
      x("mocha-pro", "Mocha Pro"),
      x("silhouette", "Silhouette")
    ]
  }
]

/**
 * The catalogue split in two, because 90 checkboxes in one mosaic is a wall
 * and people bounce off walls.
 *
 * The cut is not "half the list". Part 1 is everything up to and including the
 * image — workflow, planning, research, concept and boards. Part 2 is
 * everything from the model onward — 3D, capture, video, comp. Someone who
 * only does one of those two jobs can answer their half and skip the other
 * without reading it, which is the actual saving.
 *
 * BOTH PARTS STAY REACHABLE AT ALL TIMES. The tabs are not a wizard: a
 * candidate who never clicks part 2 would submit believing they had seen the
 * whole list, and we would read that as "does not use Nuke".
 */
export interface ToolPart {
  id: string
  labelKey: string
  /** Group ids, in the order they should appear. */
  groups: string[]
}

export const TOOL_PARTS: ToolPart[] = [
  {
    id: "ai-concept",
    labelKey: "tools.parts.ai-concept",
    groups: ["ai-workflow", "production-management", "development", "concept"]
  },
  {
    id: "production",
    labelKey: "tools.parts.production",
    groups: ["modeling", "mocap", "video", "vfx"]
  }
]

/** A single checkbox: the same tool in two areas is two of these. */
export const selectionKey = (groupId: string, toolId: string) => `${groupId}:${toolId}`

export const parseSelectionKey = (key: string) => {
  const at = key.indexOf(":")
  return { groupId: key.slice(0, at), toolId: key.slice(at + 1) }
}

/** Distinct tools, by id — fewer than the checkbox count, by design. */
export const TOOL_BY_ID: Record<string, Tool> = Object.fromEntries(
  TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => [tool.id, tool]))
)

export const GROUP_BY_ID: Record<string, ToolGroup> = Object.fromEntries(
  TOOL_GROUPS.map((group) => [group.id, group])
)

/** Checkboxes, not distinct tools — this is what the counter compares against. */
export const TOTAL_CHECKBOXES = TOOL_GROUPS.reduce((n, group) => n + group.tools.length, 0)

export const TOTAL_TOOLS = Object.keys(TOOL_BY_ID).length

/** The groups of one part, resolved and in order. */
export const groupsForPart = (part: ToolPart): ToolGroup[] =>
  part.groups.map((id) => GROUP_BY_ID[id]).filter(Boolean)

export const checkboxesInPart = (part: ToolPart) =>
  groupsForPart(part).reduce((n, group) => n + group.tools.length, 0)

/**
 * Every group belongs to exactly one part. A group missing from TOOL_PARTS
 * would simply never render — no error, no empty state, just tools nobody can
 * tick — so the mismatch is caught here, at module load, in every environment
 * that imports the catalogue.
 */
const assigned = TOOL_PARTS.flatMap((part) => part.groups)
if (assigned.length !== TOOL_GROUPS.length || new Set(assigned).size !== assigned.length) {
  throw new Error(
    `TOOL_PARTS must list each of the ${TOOL_GROUPS.length} groups exactly once, got ${assigned.length}`
  )
}
for (const id of assigned) {
  if (!GROUP_BY_ID[id]) throw new Error(`TOOL_PARTS references unknown group "${id}"`)
}
