/**
 * The tool catalogue, from FORMULARIO ROUGH V5 — 20 categories, 301 checkboxes,
 * 205 distinct tools.
 *
 * A TOOL APPEARS IN EVERY CATEGORY IT BELONGS TO, ON PURPOSE.
 * Runway shows up 8 times, Autodesk Flow Studio 7. That is not redundancy to be
 * cleaned up — "Runway for VFX" and "Runway for storyboard" are different facts
 * about a person, and the difference is exactly what makes the answer useful.
 * A selection is therefore keyed by CATEGORY + TOOL, never by tool alone.
 *
 * In the sheet the two views are reconciled: one column per distinct tool
 * (205, not 301), holding the list of categories the person picked it in. One
 * filter then answers both "who works with Stable Diffusion" and "for what".
 *
 * V5 dropped per-tool proficiency: at 301 checkboxes, asking for a level on
 * each one is not a form anybody finishes. Depth is asked once, in the
 * experience questions in `profile.ts`, which is also more honest — a scale
 * repeated 301 times gets answered by reflex, not by thought.
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
  /** Category swatch from the viz palette — decoration, never state. */
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
      x("sudowrite", "Sudowrite"),
      x("final-draft", "Final Draft"),
      x("scriptbook", "ScriptBook"),
      x("storyfit", "StoryFit"),
      x("celtx", "Celtx"),
      x("filmustage", "Filmustage"),
      x("ltx-studio", "LTX Studio"),
      x("storyflow", "Storyflow"),
      x("dramatron", "Dramatron"),
      x("novelcrafter", "NovelCrafter"),
      x("jasper", "Jasper"),
      x("copy-ai", "Copy.ai")
    ]
  },
  {
    id: "planning",
    labelKey: "tools.groups.planning",
    accent: "bg-viz-sky",
    tools: [
      x("filmustage", "Filmustage"),
      x("studiobinder", "StudioBinder"),
      x("celtx", "Celtx"),
      x("movie-magic-scheduling", "Movie Magic Scheduling"),
      x("movie-magic-budgeting", "Movie Magic Budgeting"),
      x("scenechronize", "Scenechronize"),
      x("sethero", "SetHero"),
      x("shot-lister", "Shot Lister"),
      x("decupa", "Decupa")
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
      x("stable-diffusion", "Stable Diffusion"),
      x("leonardo-ai", "Leonardo AI"),
      x("ideogram", "Ideogram"),
      x("krea", "Krea"),
      x("recraft", "Recraft"),
      x("magnific", "Magnific"),
      x("freepik-ai", "Freepik AI"),
      x("playground", "Playground"),
      x("scenario", "Scenario"),
      x("openart", "OpenArt"),
      x("dreamstudio", "DreamStudio"),
      x("comfyui", "ComfyUI"),
      x("fooocus", "Fooocus"),
      x("tensor-art", "Tensor.Art"),
      x("seaart", "SeaArt"),
      x("mage-space", "Mage.Space"),
      x("artbreeder", "Artbreeder"),
      x("nightcafe", "NightCafe")
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
      x("luma", "Luma"),
      x("hailuo", "Hailuo"),
      x("pika", "Pika"),
      x("sora", "Sora"),
      x("adobe-firefly", "Adobe Firefly"),
      x("krea", "Krea"),
      x("boords", "Boords"),
      x("storyboarder", "Storyboarder"),
      x("storyboardhero", "StoryboardHero"),
      x("storyboard-ai", "StoryBoard AI"),
      x("storyboarder-ai", "Storyboarder.ai"),
      x("drawstory", "Drawstory"),
      x("storyliner", "Storyliner"),
      x("frameforge", "FrameForge"),
      x("decupa", "Decupa")
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
      x("spline-ai", "Spline AI"),
      x("masterpiece-x", "Masterpiece X"),
      x("csm", "CSM"),
      x("3dfy-ai", "3DFY.ai"),
      x("kaedim", "Kaedim"),
      x("alpha3d", "Alpha3D"),
      x("scenario", "Scenario"),
      x("polycam", "Polycam"),
      x("realitycapture", "RealityCapture"),
      x("nvidia-get3d", "NVIDIA GET3D"),
      x("point-e", "Point-E"),
      x("shap-e", "Shap-E"),
      x("trellis", "Trellis"),
      x("hunyuan3d", "Hunyuan3D"),
      x("stable-fast-3d", "Stable Fast 3D")
    ]
  },
  {
    id: "character",
    labelKey: "tools.groups.character",
    accent: "bg-viz-mint",
    tools: [
      x("metahuman", "MetaHuman"),
      x("metahuman-animator", "MetaHuman Animator"),
      x("reallusion-character-creator", "Reallusion Character Creator"),
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
      x("meshy", "Meshy"),
      x("tripo-ai", "Tripo AI"),
      x("wonder-studio", "Wonder Studio"),
      x("wonder-dynamics", "Wonder Dynamics"),
      x("kinetix", "Kinetix"),
      x("inworld", "Inworld"),
      x("soul-machines", "Soul Machines"),
      x("synthesia", "Synthesia"),
      x("heygen", "HeyGen"),
      x("d-id", "D-ID"),
      x("character-ai", "Character.AI")
    ]
  },
  {
    id: "rigging",
    labelKey: "tools.groups.rigging",
    accent: "bg-viz-mint",
    tools: [
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
      x("accurig", "AccuRIG"),
      x("mixamo", "Mixamo"),
      x("cascadeur", "Cascadeur"),
      x("rigify", "Rigify"),
      x("auto-rig-pro", "Auto-Rig Pro"),
      x("deepmotion", "DeepMotion"),
      x("reallusion", "Reallusion"),
      x("character-creator", "Character Creator"),
      x("meshy", "Meshy"),
      x("tripo-ai", "Tripo AI")
    ]
  },
  {
    id: "animation",
    labelKey: "tools.groups.animation",
    accent: "bg-viz-peach",
    tools: [
      x("cascadeur", "Cascadeur"),
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
      x("deepmotion-animate-3d", "DeepMotion Animate 3D"),
      x("move-ai", "Move AI"),
      x("rokoko", "Rokoko"),
      x("plask", "Plask"),
      x("radical", "RADiCAL"),
      x("kinetix", "Kinetix"),
      x("wonder-studio", "Wonder Studio"),
      x("wonder-dynamics", "Wonder Dynamics"),
      x("metahuman-animator", "MetaHuman Animator"),
      x("mixamo", "Mixamo"),
      x("accurig", "AccuRIG"),
      x("reallusion", "Reallusion"),
      x("viggle", "Viggle"),
      x("runway", "Runway"),
      x("kling", "Kling"),
      x("animatediff", "AnimateDiff"),
      x("magicanimate", "MagicAnimate"),
      x("liveportrait", "LivePortrait"),
      x("comfyui", "ComfyUI"),
      x("blender-ai-workflows", "Blender AI Workflows"),
      x("maya-ai-workflows", "Maya AI Workflows"),
      x("unreal-engine-ai-workflows", "Unreal Engine AI Workflows")
    ]
  },
  {
    id: "mocap",
    labelKey: "tools.groups.mocap",
    accent: "bg-viz-peach",
    tools: [
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
      x("move-ai", "Move AI"),
      x("rokoko-vision", "Rokoko Vision"),
      x("rokoko-studio", "Rokoko Studio"),
      x("deepmotion-animate-3d", "DeepMotion Animate 3D"),
      x("plask", "Plask"),
      x("radical", "RADiCAL"),
      x("metahuman-animator", "MetaHuman Animator"),
      x("kinetix", "Kinetix"),
      x("viggle", "Viggle"),
      x("mediapipe", "MediaPipe"),
      x("openpose", "OpenPose"),
      x("mocap-for-all", "Mocap For All"),
      x("arkit-iphone-capture", "ARKit / iPhone Capture"),
      x("faceware", "Faceware"),
      x("rokoko-face-capture", "Rokoko Face Capture")
    ]
  },
  {
    id: "video",
    labelKey: "tools.groups.video",
    accent: "bg-viz-orchid",
    tools: [
      x("google-veo", "Google Veo"),
      x("kling", "Kling"),
      x("runway", "Runway"),
      x("luma", "Luma"),
      x("hailuo", "Hailuo"),
      x("pika", "Pika"),
      x("sora", "Sora"),
      x("adobe-firefly-video", "Adobe Firefly Video"),
      x("seedance", "Seedance"),
      x("vidu", "Vidu"),
      x("pixverse", "PixVerse"),
      x("hunyuanvideo", "HunyuanVideo"),
      x("ltx-video", "LTX Video"),
      x("wan", "Wan"),
      x("krea-video", "Krea Video"),
      x("haiper", "Haiper"),
      x("genmo", "Genmo"),
      x("stable-video-diffusion", "Stable Video Diffusion"),
      x("cogvideo", "CogVideo"),
      x("mochi", "Mochi")
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
      x("stable-diffusion", "Stable Diffusion"),
      x("flux", "FLUX"),
      x("krea", "Krea"),
      x("topaz-video-ai", "Topaz Video AI"),
      x("magnific", "Magnific"),
      x("mocha-pro", "Mocha Pro"),
      x("silhouette", "Silhouette")
    ]
  },
  {
    id: "roto",
    labelKey: "tools.groups.roto",
    accent: "bg-viz-plum",
    tools: [
      x("runway", "Runway"),
      x("adobe-after-effects-roto-brush", "Adobe After Effects / Roto Brush"),
      x("nuke", "Nuke"),
      x("davinci-resolve-magic-mask", "DaVinci Resolve / Magic Mask"),
      x("silhouette", "Silhouette"),
      x("mocha-pro", "Mocha Pro"),
      x("autodesk-flow-studio", "Autodesk Flow Studio"),
      x("wonder-studio", "Wonder Studio"),
      x("comfyui", "ComfyUI")
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
      x("filmora", "Filmora"),
      x("autopod", "Autopod"),
      x("opusclip", "OpusClip"),
      x("wisecut", "Wisecut"),
      x("gling", "Gling"),
      x("timebolt", "TimeBolt"),
      x("firecut", "FireCut"),
      x("submagic", "Submagic")
    ]
  },
  {
    id: "color",
    labelKey: "tools.groups.color",
    accent: "bg-viz-amber",
    tools: [
      x("davinci-resolve", "DaVinci Resolve"),
      x("colourlab-ai", "Colourlab AI"),
      x("adobe-premiere-pro", "Adobe Premiere Pro"),
      x("topaz-video-ai", "Topaz Video AI"),
      x("neat-video", "Neat Video"),
      x("filmconvert", "FilmConvert"),
      x("dehancer", "Dehancer"),
      x("runway", "Runway")
    ]
  },
  {
    id: "upscaling",
    labelKey: "tools.groups.upscaling",
    accent: "bg-viz-rose",
    tools: [
      x("topaz-video-ai", "Topaz Video AI"),
      x("topaz-photo-ai", "Topaz Photo AI"),
      x("magnific", "Magnific"),
      x("real-esrgan", "Real-ESRGAN"),
      x("video2x", "Video2X"),
      x("davinci-resolve-super-scale", "DaVinci Resolve Super Scale"),
      x("adobe-firefly", "Adobe Firefly"),
      x("hitpaw", "HitPaw"),
      x("avclabs", "AVCLabs"),
      x("tensorpix", "TensorPix")
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
      x("murf", "Murf"),
      x("playht", "PlayHT"),
      x("resemble-ai", "Resemble AI"),
      x("speechify", "Speechify"),
      x("descript", "Descript"),
      x("heygen", "HeyGen"),
      x("synthesia", "Synthesia"),
      x("fish-audio", "Fish Audio"),
      x("cartesia", "Cartesia"),
      x("wellsaid", "WellSaid"),
      x("lovo", "LOVO"),
      x("altered-studio", "Altered Studio"),
      x("voice-ai", "Voice.ai"),
      x("adobe-podcast", "Adobe Podcast"),
      x("rask-ai", "Rask AI"),
      x("papercup", "Papercup"),
      x("dubverse", "Dubverse")
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
      x("descript", "Descript"),
      x("auphonic", "Auphonic"),
      x("izotope-rx", "iZotope RX"),
      x("supertone", "Supertone"),
      x("krisp", "Krisp"),
      x("resemble-ai", "Resemble AI"),
      x("voice-ai", "Voice.ai"),
      x("landr", "LANDR"),
      x("soundraw", "Soundraw")
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
      x("boomy", "Boomy"),
      x("beatoven-ai", "Beatoven.ai"),
      x("mubert", "Mubert"),
      x("loudly", "Loudly"),
      x("musicfy", "Musicfy"),
      x("cassetteai", "CassetteAI")
    ]
  },
  {
    id: "localization",
    labelKey: "tools.groups.localization",
    accent: "bg-viz-mint",
    tools: [
      x("whisper", "Whisper"),
      x("elevenlabs", "ElevenLabs"),
      x("descript", "Descript"),
      x("adobe-premiere-pro", "Adobe Premiere Pro"),
      x("capcut", "CapCut"),
      x("heygen", "HeyGen"),
      x("rask-ai", "Rask AI"),
      x("deepl", "DeepL"),
      x("google-translate", "Google Translate"),
      x("papercup", "Papercup"),
      x("dubverse", "Dubverse"),
      x("synthesia", "Synthesia")
    ]
  },
  {
    id: "marketing",
    labelKey: "tools.groups.marketing",
    accent: "bg-viz-amber",
    tools: [
      x("chatgpt", "ChatGPT"),
      x("claude", "Claude"),
      x("gemini", "Gemini"),
      x("midjourney", "Midjourney"),
      x("gpt-image", "GPT Image"),
      x("adobe-firefly", "Adobe Firefly"),
      x("runway", "Runway"),
      x("kling", "Kling"),
      x("google-veo", "Google Veo"),
      x("luma", "Luma"),
      x("heygen", "HeyGen"),
      x("elevenlabs", "ElevenLabs"),
      x("descript", "Descript"),
      x("opusclip", "OpusClip"),
      x("capcut", "CapCut"),
      x("canva-ai", "Canva AI"),
      x("adobe-express", "Adobe Express")
    ]
  }
]

/** A single checkbox: the same tool in two categories is two of these. */
export const selectionKey = (groupId: string, toolId: string) => `${groupId}:${toolId}`

export const parseSelectionKey = (key: string) => {
  const at = key.indexOf(":")
  return { groupId: key.slice(0, at), toolId: key.slice(at + 1) }
}

/** Distinct tools, by id — 205 of them, versus 301 checkboxes. */
export const TOOL_BY_ID: Record<string, Tool> = Object.fromEntries(
  TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => [tool.id, tool]))
)

export const GROUP_BY_ID: Record<string, ToolGroup> = Object.fromEntries(
  TOOL_GROUPS.map((group) => [group.id, group])
)

/** Checkboxes, not distinct tools — this is what the counter compares against. */
export const TOTAL_CHECKBOXES = TOOL_GROUPS.reduce((n, group) => n + group.tools.length, 0)

export const TOTAL_TOOLS = Object.keys(TOOL_BY_ID).length
