/**
 * The tool list from the ROUGH deck (page 7), grouped exactly as designed.
 *
 * Tool names are proper nouns — they are NOT translated. Only the group
 * headings live in the locale files, keyed by `labelKey`.
 *
 * `id` is what lands in the spreadsheet column, so it must stay stable even if
 * a product renames itself: rename the `name`, keep the `id`.
 */

export interface ToolGroup {
  id: string
  labelKey: string
  /** Category swatch from the viz palette — decoration, never state. */
  accent: string
  tools: { id: string; name: string }[]
}

const tool = (id: string, name: string) => ({ id, name })

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "workflow",
    labelKey: "tools.groups.workflow",
    accent: "bg-viz-sky",
    tools: [
      tool("comfyui", "ComfyUI"),
      tool("invokeai", "InvokeAI"),
      tool("swarmui", "SwarmUI"),
      tool("automatic1111", "AUTOMATIC1111 / Stable Diffusion WebUI"),
      tool("sd-webui-forge", "Stable Diffusion WebUI Forge"),
      tool("fooocus", "Fooocus"),
      tool("figma-weave", "Figma Weave"),
      tool("n8n", "n8n")
    ]
  },
  {
    id: "generation",
    labelKey: "tools.groups.generation",
    accent: "bg-viz-orchid",
    tools: [
      tool("runway", "Runway"),
      tool("runway-act-two", "Runway Act-Two"),
      tool("kling", "Kling"),
      tool("google-veo", "Google Veo"),
      tool("luma-dream-machine", "Luma Dream Machine"),
      tool("adobe-firefly", "Adobe Firefly"),
      tool("midjourney", "Midjourney"),
      tool("flux", "FLUX"),
      tool("chatgpt-gpt-image", "ChatGPT / GPT Image"),
      tool("stable-diffusion", "Stable Diffusion"),
      tool("pika", "Pika"),
      tool("hailuo-ai", "Hailuo AI"),
      tool("leonardo-ai", "Leonardo AI"),
      tool("ideogram", "Ideogram"),
      tool("viggle", "Viggle")
    ]
  },
  {
    id: "control",
    labelKey: "tools.groups.control",
    accent: "bg-viz-lilac",
    tools: [tool("controlnet", "ControlNet"), tool("lora", "LoRA"), tool("openpose", "OpenPose")]
  },
  {
    id: "api",
    labelKey: "tools.groups.api",
    accent: "bg-viz-mint",
    tools: [
      tool("replicate", "Replicate"),
      tool("fal-ai", "fal.ai"),
      tool("hugging-face", "Hugging Face")
    ]
  },
  {
    id: "animation",
    labelKey: "tools.groups.animation",
    accent: "bg-viz-peach",
    tools: [
      tool("after-effects", "After Effects"),
      tool("blender", "Blender"),
      tool("cinema-4d", "Cinema 4D"),
      tool("houdini", "Houdini"),
      tool("maya", "Maya"),
      tool("unreal-engine", "Unreal Engine"),
      tool("character-animator", "Adobe Character Animator")
    ]
  },
  {
    id: "editing",
    labelKey: "tools.groups.editing",
    accent: "bg-viz-amber",
    tools: [
      tool("premiere-pro", "Premiere Pro"),
      tool("davinci-resolve", "DaVinci Resolve"),
      tool("final-cut-pro", "Final Cut Pro")
    ]
  },
  {
    id: "upscaling",
    labelKey: "tools.groups.upscaling",
    accent: "bg-viz-rose",
    tools: [tool("topaz-video-ai", "Topaz Video AI"), tool("topaz-photo-ai", "Topaz Photo AI")]
  },
  {
    id: "audio",
    labelKey: "tools.groups.audio",
    accent: "bg-viz-plum",
    tools: [tool("elevenlabs", "ElevenLabs"), tool("suno", "Suno")]
  },
  {
    id: "videoProduction",
    labelKey: "tools.groups.videoProduction",
    accent: "bg-viz-sky",
    tools: [tool("eve-aive", "EVE (Aive)")]
  }
]

/** Flat lookup: tool id -> display name, for building the sheet row. */
export const TOOL_NAMES: Record<string, string> = Object.fromEntries(
  TOOL_GROUPS.flatMap((g) => g.tools.map((t) => [t.id, t.name]))
)

export const TOTAL_TOOLS = TOOL_GROUPS.reduce((n, g) => n + g.tools.length, 0)

/**
 * Proficiency ladder. Stored as the id, shown translated.
 * Three rungs, not five: a candidate who has to choose between "advanced" and
 * "very advanced" is answering a question about themselves, not about the tool.
 */
export const LEVELS = ["basic", "intermediate", "advanced"] as const
export type Level = (typeof LEVELS)[number]
