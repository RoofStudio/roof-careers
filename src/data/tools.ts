/**
 * The tool catalogue, from FORM_ROUGH_V9 — 14 areas, 128 checkboxes, 92
 * distinct tools.
 *
 * V9 cut this by more than half against V5 (20 areas, 300 checkboxes), which
 * was the right call: a checklist nobody finishes measures patience, not craft.
 *
 * A TOOL STILL APPEARS IN EVERY AREA IT BELONGS TO, ON PURPOSE.
 * "Runway for VFX" and "Runway for storyboard" are different facts about a
 * person, so a selection is keyed by AREA + TOOL, never by tool alone. In the
 * sheet the two views reconcile: one column per distinct tool, holding the list
 * of areas it was picked in. One filter answers both who works with it and for
 * what.
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
  /** Area swatch from the viz palette — decoration, never state. */
  accent: string
  tools: Tool[]
}

const x = (id: string, name: string): Tool => ({ id, name })

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "development",
    labelKey: "tools.groups.development",
    accent: "bg-viz-lilac",
    tools: [
      x("chatgpt", "ChatGPT"),
      x("claude", "Claude"),
      x("google-gemini", "Google Gemini"),
      x("perplexity", "Perplexity"),
      x("ltx-studio", "LTX Studio")
    ]
  },
  {
    id: "concept",
    labelKey: "tools.groups.concept",
    accent: "bg-viz-orchid",
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
      x("scenario", "Scenario")
    ]
  },
  {
    id: "storyboard",
    labelKey: "tools.groups.storyboard",
    accent: "bg-viz-lilac",
    tools: [
      x("ltx-studio", "LTX Studio"),
      x("runway", "Runway"),
      x("kling", "Kling"),
      x("google-veo", "Google Veo"),
      x("sora", "Sora"),
      x("luma", "Luma"),
      x("krea", "Krea"),
      x("boords", "Boords")
    ]
  },
  {
    id: "modeling",
    labelKey: "tools.groups.modeling",
    accent: "bg-viz-sky",
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
      x("stable-fast-3d", "Stable Fast 3D")
    ]
  },
  {
    id: "character",
    labelKey: "tools.groups.character",
    accent: "bg-viz-mint",
    tools: [
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
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
    accent: "bg-viz-peach",
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
    accent: "bg-viz-orchid",
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
    accent: "bg-viz-plum",
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
  },
  {
    id: "editing",
    labelKey: "tools.groups.editing",
    accent: "bg-viz-amber",
    tools: [
      x("adobe-premiere-pro", "Adobe Premiere Pro"),
      x("davinci-resolve", "DaVinci Resolve"),
      x("runway", "Runway"),
      x("descript", "Descript"),
      x("capcut", "CapCut"),
      x("autopod", "Autopod"),
      x("opusclip", "OpusClip")
    ]
  },
  {
    id: "color",
    labelKey: "tools.groups.color",
    accent: "bg-viz-amber",
    tools: [
      x("davinci-resolve", "DaVinci Resolve"),
      x("colourlab-ai", "Colourlab AI"),
      x("topaz-video-photo-ai", "Topaz Video / Photo AI"),
      x("magnific", "Magnific"),
      x("dehancer", "Dehancer"),
      x("neat-video", "Neat Video")
    ]
  },
  {
    id: "voice",
    labelKey: "tools.groups.voice",
    accent: "bg-viz-rose",
    tools: [
      x("elevenlabs", "ElevenLabs"),
      x("openai", "OpenAI"),
      x("google-ai", "Google AI"),
      x("resemble-ai", "Resemble AI"),
      x("heygen", "HeyGen"),
      x("descript", "Descript"),
      x("fish-audio", "Fish Audio"),
      x("cartesia", "Cartesia"),
      x("rask-ai", "Rask AI"),
      x("adobe-podcast", "Adobe Podcast")
    ]
  },
  {
    id: "sound",
    labelKey: "tools.groups.sound",
    accent: "bg-viz-plum",
    tools: [
      x("adobe-podcast", "Adobe Podcast"),
      x("elevenlabs", "ElevenLabs"),
      x("adobe-enhance-speech", "Adobe Enhance Speech"),
      x("auphonic", "Auphonic"),
      x("izotope-rx", "iZotope RX"),
      x("supertone", "Supertone"),
      x("krisp", "Krisp")
    ]
  },
  {
    id: "music",
    labelKey: "tools.groups.music",
    accent: "bg-viz-lilac",
    tools: [
      x("suno", "Suno"),
      x("udio", "Udio"),
      x("elevenlabs-music", "ElevenLabs Music"),
      x("stable-audio", "Stable Audio"),
      x("aiva", "AIVA"),
      x("soundraw", "Soundraw"),
      x("beatoven-ai", "Beatoven.ai")
    ]
  },
  {
    id: "marketing",
    labelKey: "tools.groups.marketing",
    accent: "bg-viz-amber",
    tools: [
      x("chatgpt", "ChatGPT"),
      x("claude", "Claude"),
      x("midjourney", "Midjourney"),
      x("gpt-image", "GPT Image"),
      x("adobe-firefly", "Adobe Firefly"),
      x("runway", "Runway"),
      x("google-veo", "Google Veo"),
      x("kling", "Kling"),
      x("luma", "Luma"),
      x("heygen", "HeyGen"),
      x("elevenlabs", "ElevenLabs"),
      x("descript", "Descript"),
      x("capcut", "CapCut"),
      x("canva-ai", "Canva AI")
    ]
  }
]

/** A single checkbox: the same tool in two areas is two of these. */
export const selectionKey = (groupId: string, toolId: string) => `${groupId}:${toolId}`

export const parseSelectionKey = (key: string) => {
  const at = key.indexOf(":")
  return { groupId: key.slice(0, at), toolId: key.slice(at + 1) }
}

/** Distinct tools, by id — 92 of them, versus 128 checkboxes. */
export const TOOL_BY_ID: Record<string, Tool> = Object.fromEntries(
  TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => [tool.id, tool]))
)

export const GROUP_BY_ID: Record<string, ToolGroup> = Object.fromEntries(
  TOOL_GROUPS.map((group) => [group.id, group])
)

/** Checkboxes, not distinct tools — this is what the counter compares against. */
export const TOTAL_CHECKBOXES = TOOL_GROUPS.reduce((n, group) => n + group.tools.length, 0)

export const TOTAL_TOOLS = Object.keys(TOOL_BY_ID).length
