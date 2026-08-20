import { run } from "./harness.mjs"

const PAYLOAD = {
  profile: {
    fullName: "Ana Ribeiro",
    email: "ana@exemplo.com",
    phone: "+55 11 99999-0000",
    location: "São Paulo / Brasil",
    portfolio: "https://behance.net/ana",
    links: "instagram.com/ana"
  },
  roles: ["director", "art-director", "animator"],
  published: ["short-film", "festival"],
  publishedLink: "https://vimeo.com/curta",
  tools: [
    { id: "midjourney", name: "Midjourney", level: "advanced", group: "concept", ai: true },
    { id: "comfyui", name: "ComfyUI", level: "intermediate", group: "workflow", ai: true },
    { id: "blender", name: "Blender", level: "basic", group: "modeling", ai: false },
    { id: "houdini", name: "Houdini", level: "advanced", group: "modeling", ai: false },
    { id: "maya", name: "Maya", level: "intermediate", group: "modeling", ai: false },
    { id: "cascadeur", name: "Cascadeur", level: "advanced", group: "rigAnim", ai: true }
  ],
  otherTools: "Krea",
  meta: {
    submittedAt: "2026-08-20T14:00:00.000Z",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    userAgent: "Mozilla/5.0 test",
    formVersion: "2"
  },
  guard: { hp: "", elapsedMs: 20000, turnstileToken: "" }
}

const post = (sandbox, payload) =>
  sandbox.doPost({ postData: { contents: JSON.stringify(payload) } })

const results = []
const check = (name, cond, detail = "") =>
  results.push({ name, pass: !!cond, detail: cond ? "" : detail })

const asObject = (headers, row) => Object.fromEntries(headers.map((h, i) => [h, row[i]]))

/* ── 1. Virgin sheet: setupSheet builds the whole schema ────────────────── */
{
  const { sandbox, sheet } = run([])
  const msg = sandbox.setupSheet()
  const headers = sheet._grid[0]

  check("1a all columns created", headers.length === sandbox.COLUMNS.length,
    `got ${headers.length} of ${sandbox.COLUMNS.length}`)
  check("1b header order matches schema",
    JSON.stringify(headers) === JSON.stringify(sandbox.HEADERS))
  check("1c one column per tool", sandbox.TOOL_ROSTER.every((t) => headers.includes(`Tool: ${t.name}`)),
    "a tool is missing its own column")
  check("1d one column per role", sandbox.ROLE_ROSTER.every((r) => headers.includes(`Role: ${r.label}`)))
  check("1e one column per published type",
    sandbox.PUBLISHED_ROSTER.every((p) => headers.includes(`Seen: ${p.label}`)))
  check("1f headers are unique", new Set(headers).size === headers.length,
    "a prefix collision would silently overwrite a column")
  check("1g every column got a width",
    Object.keys(sheet._calls.widths).length === sandbox.COLUMNS.length)
  check("1h header row frozen", sheet._calls.frozen.rows === 1)
  check("1i frozen through Full Name (col 2, so the wide block stays readable)",
    sheet._calls.frozen.cols === 2, `cols=${sheet._calls.frozen.cols}`)
  check("1j Rating has a dropdown and a numeric format",
    !!sheet._calls.validations[headers.indexOf("Rating") + 1]?.list &&
      sheet._calls.formats[headers.indexOf("Rating") + 1] === "0")
  check("1k Status has a dropdown",
    !!sheet._calls.validations[headers.indexOf("Status") + 1]?.list)
  check("1l sheet was widened past the default 26 columns",
    sheet._calls.insertedColumns > 0, "insertColumnsAfter never called")
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
  check("2b name", row["Full Name"] === "Ana Ribeiro", String(row["Full Name"]))
  check("2c accents survive", row["Location"] === "São Paulo / Brasil", String(row["Location"]))
  check("2d roles readable", row["Roles"] === "Direction, Art Direction, Animation", String(row["Roles"]))
  check("2e roles count", row["Roles Count"] === 3, String(row["Roles Count"]))
  check("2f published readable", row["Published In"] === "Short film, Festival", String(row["Published In"]))
  check("2g published link", row["Published Link"] === "https://vimeo.com/curta")
  check("2h tools count", row["Tools Count"] === 6, String(row["Tools Count"]))
  check("2i AI tools counted separately from craft tools",
    row["AI Tools Count"] === 3, String(row["AI Tools Count"]))
  check("2j advanced split", row["Advanced"] === "Midjourney, Houdini, Cascadeur", String(row["Advanced"]))
  check("2k other tools", row["Other Tools"] === "Krea")
  check("2l status seeded", row["Status"] === "Novo")
  check("2m rating left for the team", row["Rating"] === "", JSON.stringify(row["Rating"]))
  check("2n notes left empty", row["Notes"] === "")
  check("2o received at is a real timestamp",
    Object.prototype.toString.call(row["Received At"]) === "[object Date]" &&
      Math.abs(row["Received At"].getTime() - Date.now()) < 60_000)
  check("2p no value bled past the last column", sheet._grid[1].length === headers.length)
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
  check("3b a selected tool holds its LEVEL, so one filter answers who + how deep",
    row["Tool: Midjourney"] === "advanced", String(row["Tool: Midjourney"]))
  check("3c second selected tool", row["Tool: ComfyUI"] === "intermediate")
  check("3d Cascadeur (the tool Binho asked for) is filterable",
    row["Tool: Cascadeur"] === "advanced", String(row["Tool: Cascadeur"]))
  check("3e 'has directed' is one filter click", row["Role: Direction"] === "Yes")
  check("3f a role not ticked is blank", row["Role: Design"] === "")
  check("3g 'has a short film' is one filter click", row["Seen: Short film"] === "Yes")
  check("3h a published type not ticked is blank", row["Seen: Game"] === "")
}

/* ── 4. Pipeline is derived, never asked ────────────────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()
  post(sandbox, PAYLOAD)
  const row = asObject(sheet._grid[0], sheet._grid[1])

  // 3 modeling, 1 concept, 1 workflow, 1 rigAnim -> modeling leads.
  check("4a top stage leads the pipeline",
    row["Pipeline"].startsWith("3D — modeling & assets (3)"), String(row["Pipeline"]))
  check("4b caps at three stages", row["Pipeline"].split(" · ").length <= 3, String(row["Pipeline"]))

  // A diffusion-only person must not read as a 3D person.
  const { sandbox: s2, sheet: sh2 } = run([])
  s2.setupSheet()
  post(s2, {
    ...PAYLOAD,
    tools: [
      { id: "comfyui", name: "ComfyUI", level: "advanced", group: "workflow", ai: true },
      { id: "lora", name: "LoRA", level: "advanced", group: "workflow", ai: true },
      { id: "flux", name: "FLUX", level: "advanced", group: "concept", ai: true }
    ]
  })
  const diffusion = asObject(sh2._grid[0], sh2._grid[1])
  check("4c a diffusion profile reads as workflow-led",
    diffusion["Pipeline"].startsWith("Workflow, control & models (2)"), String(diffusion["Pipeline"]))
  check("4d and is 100% AI tools", diffusion["AI Tools Count"] === 3)

  // No tools at all must not crash or invent a pipeline.
  const { sandbox: s3, sheet: sh3 } = run([])
  s3.setupSheet()
  post(s3, { ...PAYLOAD, tools: [], otherTools: "algo" })
  check("4e no tools -> empty pipeline, no crash",
    asObject(sh3._grid[0], sh3._grid[1])["Pipeline"] === "")
}

/* ── 5. Columns reordered by hand in Sheets ─────────────────────────────── */
{
  const { sandbox: probe } = run([])
  const shuffled = [...probe.HEADERS].reverse() // worst case: fully inverted
  const { sandbox, sheet } = run([shuffled])
  post(sandbox, PAYLOAD)

  const row = asObject(sheet._grid[0], sheet._grid[1])
  check("5a reordered: name still correct", row["Full Name"] === "Ana Ribeiro")
  check("5b reordered: per-tool column still correct", row["Tool: Midjourney"] === "advanced")
  check("5c reordered: header row untouched",
    JSON.stringify(sheet._grid[0]) === JSON.stringify(shuffled))
}

/* ── 6. A v1 sheet upgrading to v2 ──────────────────────────────────────── */
{
  const legacy = [
    "Received At", "Status", "Full Name", "Email", "Phone / WhatsApp", "Location",
    "Field of Work", "Portfolio / Demo Reel", "Additional Links", "Tools Count",
    "Advanced", "Intermediate", "Basic", "All Tools (with level)", "Other Tools",
    "Language", "Timezone", "Submitted At (client)", "Form Version", "User Agent", "Notes"
  ]
  const oldRow = legacy.map((h, i) => `old-${i}`)
  const { sandbox, sheet } = run([legacy, oldRow])

  post(sandbox, PAYLOAD)
  const headers = sheet._grid[0]

  check("6a v2 columns appended", headers.includes("Rating") && headers.includes("Pipeline") &&
    headers.includes("Tool: Cascadeur"))
  check("6b v1 columns kept their position",
    JSON.stringify(headers.slice(0, legacy.length)) === JSON.stringify(legacy))
  check("6c the retired 'Field of Work' column is preserved, not deleted",
    headers.includes("Field of Work"), "removing a column would destroy v1 data")
  check("6d existing data row untouched", JSON.stringify(sheet._grid[1]) === JSON.stringify(oldRow))
  check("6e new row lands correctly", asObject(headers, sheet._grid[2])["Full Name"] === "Ana Ribeiro")
  check("6f unknown-to-schema column gets blank, never garbage",
    asObject(headers, sheet._grid[2])["Field of Work"] === "")
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
