/**
 * The tools someone works with, grouped BY PIPELINE STAGE — not by "AI vs the
 * rest".
 *
 * That ordering is deliberate and does three jobs at once:
 *
 *   1. The page stops asking "are you an AI person?" and starts asking "what is
 *      your craft?". A great director who uses no AI at all can still fill this
 *      in and make sense — under the old grouping they had nothing to check and
 *      left.
 *   2. The PIPELINE falls out of the pattern for free. Houdini + Nuke + Karma
 *      reads as VFX; Blender + Cascadeur + After Effects reads as character
 *      animation; ComfyUI + FLUX + LoRA reads as diffusion. Nobody had to be
 *      asked, and nobody had to type.
 *   3. Tools that generate motion, geometry or performance — not images — get a
 *      natural home instead of being an appendix.
 *
 * The AI signal is not lost: every tool carries `ai`, so the sheet still
 * answers "who uses Stable Diffusion" and "how AI-fluent is this person".
 *
 * `id` is what lands in the spreadsheet column, so it must stay stable even if
 * a product renames itself: rename the `name`, keep the `id`.
 */

export interface Tool {
  id: string
  name: string
  /**
   * True for ML-first tools — the ones that exist because of a model.
   * Gray areas are resolved conservatively (photogrammetry and realtime
   * tracking count as capture, not AI), so "AI Tools Count" stays meaningful
   * rather than becoming a number that flatters everyone.
   */
  ai: boolean
}

export interface ToolGroup {
  id: string
  labelKey: string
  /** Stage swatch from the viz palette — decoration, never state. */
  accent: string
  tools: Tool[]
}

/** `t` = ML-first, `c` = craft tool. Two letters keeps the table readable. */
const t = (id: string, name: string): Tool => ({ id, name, ai: true })
const c = (id: string, name: string): Tool => ({ id, name, ai: false })

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "concept",
    labelKey: "tools.groups.concept",
    accent: "bg-viz-orchid",
    tools: [
      c("photoshop", "Photoshop"),
      c("illustrator", "Illustrator"),
      c("procreate", "Procreate"),
      c("figma", "Figma"),
      t("midjourney", "Midjourney"),
      t("flux", "FLUX"),
      t("stable-diffusion", "Stable Diffusion"),
      t("chatgpt-gpt-image", "ChatGPT / GPT Image"),
      t("adobe-firefly", "Adobe Firefly"),
      t("leonardo-ai", "Leonardo AI"),
      t("ideogram", "Ideogram"),
      t("krea", "Krea"),
      t("magnific", "Magnific")
    ]
  },
  {
    id: "video",
    labelKey: "tools.groups.video",
    accent: "bg-viz-lilac",
    tools: [
      t("runway", "Runway"),
      t("kling", "Kling"),
      t("google-veo", "Google Veo"),
      t("sora", "Sora"),
      t("luma-dream-machine", "Luma Dream Machine"),
      t("pika", "Pika"),
      t("hailuo-ai", "Hailuo AI"),
      t("viggle", "Viggle"),
      t("eve-aive", "EVE (Aive)")
    ]
  },
  {
    id: "modeling",
    labelKey: "tools.groups.modeling",
    accent: "bg-viz-sky",
    tools: [
      c("blender", "Blender"),
      c("maya", "Maya"),
      c("cinema-4d", "Cinema 4D"),
      c("houdini", "Houdini"),
      c("zbrush", "ZBrush"),
      c("substance-3d", "Substance 3D"),
      c("marvelous-designer", "Marvelous Designer"),
      t("meshy", "Meshy"),
      t("tripo", "Tripo"),
      t("rodin", "Rodin (Hyper3D)"),
      t("luma-genie", "Luma Genie")
    ]
  },
  {
    id: "rigAnim",
    labelKey: "tools.groups.rigAnim",
    accent: "bg-viz-mint",
    tools: [
      t("cascadeur", "Cascadeur"),
      t("autodesk-flow-studio", "Autodesk Flow Studio"),
      t("move-ai", "Move.ai"),
      t("rokoko-vision", "Rokoko Vision"),
      t("deepmotion", "DeepMotion"),
      t("plask", "Plask"),
      c("mixamo", "Mixamo / AccuRig"),
      c("character-animator", "Adobe Character Animator")
    ]
  },
  {
    id: "performance",
    labelKey: "tools.groups.performance",
    accent: "bg-viz-rose",
    tools: [
      t("runway-act-two", "Runway Act-Two"),
      t("hedra", "Hedra"),
      t("liveportrait", "LivePortrait"),
      t("audio2face", "NVIDIA Audio2Face"),
      t("respeecher", "Respeecher")
    ]
  },
  {
    id: "scan",
    labelKey: "tools.groups.scan",
    accent: "bg-viz-peach",
    tools: [
      c("polycam", "Polycam"),
      c("kiri-engine", "KIRI Engine"),
      c("postshot", "Postshot (Gaussian Splatting)")
    ]
  },
  {
    id: "lookdev",
    labelKey: "tools.groups.lookdev",
    accent: "bg-viz-amber",
    tools: [
      c("unreal-engine", "Unreal Engine"),
      c("redshift", "Redshift"),
      c("octane", "Octane"),
      c("arnold", "Arnold"),
      c("v-ray", "V-Ray"),
      c("karma", "Karma")
    ]
  },
  {
    id: "comp",
    labelKey: "tools.groups.comp",
    accent: "bg-viz-plum",
    tools: [
      c("after-effects", "After Effects"),
      c("nuke", "Nuke"),
      c("fusion", "Fusion"),
      c("flame", "Flame"),
      c("davinci-resolve", "DaVinci Resolve"),
      c("premiere-pro", "Premiere Pro"),
      c("final-cut-pro", "Final Cut Pro"),
      t("topaz-video-ai", "Topaz Video AI"),
      t("topaz-photo-ai", "Topaz Photo AI")
    ]
  },
  {
    id: "anim2d",
    labelKey: "tools.groups.anim2d",
    accent: "bg-viz-orchid",
    tools: [
      c("toon-boom-harmony", "Toon Boom Harmony"),
      c("tvpaint", "TVPaint"),
      c("adobe-animate", "Adobe Animate"),
      c("rive", "Rive"),
      c("cavalry", "Cavalry")
    ]
  },
  {
    id: "audio",
    labelKey: "tools.groups.audio",
    accent: "bg-viz-lilac",
    tools: [t("elevenlabs", "ElevenLabs"), t("suno", "Suno"), t("udio", "Udio")]
  },
  {
    id: "workflow",
    labelKey: "tools.groups.workflow",
    accent: "bg-viz-sky",
    tools: [
      t("comfyui", "ComfyUI"),
      t("invokeai", "InvokeAI"),
      t("swarmui", "SwarmUI"),
      t("automatic1111", "AUTOMATIC1111 / SD WebUI"),
      t("sd-webui-forge", "Stable Diffusion WebUI Forge"),
      t("fooocus", "Fooocus"),
      t("controlnet", "ControlNet"),
      t("lora", "LoRA"),
      t("openpose", "OpenPose"),
      t("replicate", "Replicate"),
      t("fal-ai", "fal.ai"),
      t("hugging-face", "Hugging Face"),
      t("figma-weave", "Figma Weave"),
      c("n8n", "n8n")
    ]
  }
]

export const ALL_TOOLS: (Tool & { group: string })[] = TOOL_GROUPS.flatMap((g) =>
  g.tools.map((tool) => ({ ...tool, group: g.id }))
)

/** Flat lookup by id, for building the sheet row. */
export const TOOL_BY_ID: Record<string, Tool & { group: string }> = Object.fromEntries(
  ALL_TOOLS.map((tool) => [tool.id, tool])
)

export const TOTAL_TOOLS = ALL_TOOLS.length

/**
 * Proficiency ladder. Stored as the id, shown translated.
 * Three rungs, not five: a candidate who has to choose between "advanced" and
 * "very advanced" is answering a question about themselves, not about the tool.
 */
export const LEVELS = ["basic", "intermediate", "advanced"] as const
export type Level = (typeof LEVELS)[number]
