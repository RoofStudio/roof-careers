import { run } from "./harness.mjs"

const PAYLOAD = {
  profile: {
    fullName: "Ana Ribeiro",
    email: "ana@exemplo.com",
    phone: "+55 11 99999-0000",
    location: "São Paulo / Brasil",
    role: "Direção de Arte",
    portfolio: "https://behance.net/ana",
    links: "instagram.com/ana"
  },
  tools: [
    { id: "midjourney", name: "Midjourney", level: "advanced" },
    { id: "comfyui", name: "ComfyUI", level: "intermediate" },
    { id: "blender", name: "Blender", level: "basic" },
    { id: "runway", name: "Runway", level: "advanced" }
  ],
  otherTools: "Krea",
  meta: {
    submittedAt: "2026-08-20T14:00:00.000Z",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    userAgent: "Mozilla/5.0 test",
    formVersion: "1"
  },
  guard: { hp: "", elapsedMs: 20000, turnstileToken: "" }
}

const post = (sandbox, payload) =>
  sandbox.doPost({ postData: { contents: JSON.stringify(payload) } })

const results = []
const check = (name, cond, detail = "") =>
  results.push({ name, pass: !!cond, detail: cond ? "" : detail })

const asObject = (headers, row) =>
  Object.fromEntries(headers.map((h, i) => [h, row[i]]))

/* ── 1. Virgin sheet: setupSheet builds the whole schema ────────────────── */
{
  const { sandbox, sheet } = run([])
  const msg = sandbox.setupSheet()
  const headers = sheet._grid[0]

  check("1a virgin: all columns created", headers.length === sandbox.COLUMNS.length,
    `got ${headers.length} of ${sandbox.COLUMNS.length}`)
  check("1b virgin: header order matches schema",
    JSON.stringify(headers) === JSON.stringify(sandbox.HEADERS))
  check("1c virgin: every column got a width",
    Object.keys(sheet._calls.widths).length === sandbox.COLUMNS.length,
    JSON.stringify(sheet._calls.widths))
  check("1d virgin: header row frozen", sheet._calls.frozen.rows === 1)
  check("1e virgin: frozen through Full Name",
    sheet._calls.frozen.cols === headers.indexOf("Full Name") + 1,
    `cols=${sheet._calls.frozen.cols}`)
  check("1f virgin: Received At is date-formatted",
    sheet._calls.formats[headers.indexOf("Received At") + 1] === "yyyy-mm-dd hh:mm:ss")
  check("1g virgin: Status has a dropdown",
    !!sheet._calls.validations[headers.indexOf("Status") + 1]?.list)
  check("1h virgin: banding starts at row 2, header excluded",
    sheet._calls.banding?.startRow === 2 && sheet._calls.banding?.showHeader === false,
    JSON.stringify(sheet._calls.banding))
  check("1i virgin: setup reports ok", /ready with \d+ columns/.test(msg), msg)
}

/* ── 2. A submission lands under the right headers ──────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()
  post(sandbox, PAYLOAD)

  const headers = sheet._grid[0]
  const row = asObject(headers, sheet._grid[1])

  check("2a row appended", sheet._grid.length === 2, `rows=${sheet._grid.length}`)
  check("2b name", row["Full Name"] === "Ana Ribeiro", String(row["Full Name"]))
  check("2c email", row["Email"] === "ana@exemplo.com")
  check("2d accents survive", row["Location"] === "São Paulo / Brasil", String(row["Location"]))
  check("2e tools count is a number", row["Tools Count"] === 4, String(row["Tools Count"]))
  check("2f advanced split", row["Advanced"] === "Midjourney, Runway", String(row["Advanced"]))
  check("2g intermediate split", row["Intermediate"] === "ComfyUI", String(row["Intermediate"]))
  check("2h basic split", row["Basic"] === "Blender", String(row["Basic"]))
  check("2i all tools with level",
    row["All Tools (with level)"] ===
      "Midjourney (advanced); ComfyUI (intermediate); Blender (basic); Runway (advanced)",
    String(row["All Tools (with level)"]))
  check("2j other tools", row["Other Tools"] === "Krea")
  check("2k status seeded", row["Status"] === "Novo", String(row["Status"]))
  check("2l notes left empty", row["Notes"] === "", JSON.stringify(row["Notes"]))
  // `instanceof Date` is realm-scoped and the value is built inside the VM, so
  // identify it structurally instead.
  check("2m received at is a real timestamp",
    Object.prototype.toString.call(row["Received At"]) === "[object Date]" &&
      Math.abs(row["Received At"].getTime() - Date.now()) < 60_000,
    String(row["Received At"]))
  check("2n no value bled past the last column",
    sheet._grid[1].length === headers.length,
    `row=${sheet._grid[1].length} headers=${headers.length}`)
}

/* ── 3. Columns reordered by hand in Sheets ─────────────────────────────── */
{
  const { sandbox: probe } = run([])
  const shuffled = [...probe.HEADERS].reverse()          // worst case: fully inverted
  const { sandbox, sheet } = run([shuffled])
  post(sandbox, PAYLOAD)

  const row = asObject(sheet._grid[0], sheet._grid[1])
  check("3a reordered: name still correct", row["Full Name"] === "Ana Ribeiro", String(row["Full Name"]))
  check("3b reordered: email still correct", row["Email"] === "ana@exemplo.com", String(row["Email"]))
  check("3c reordered: count still correct", row["Tools Count"] === 4, String(row["Tools Count"]))
  check("3d reordered: header row untouched",
    JSON.stringify(sheet._grid[0]) === JSON.stringify(shuffled))
}

/* ── 4. An older sheet missing the newer columns ────────────────────────── */
{
  const legacy = [
    "Received At", "Submitted At (client)", "Full Name", "Email", "Phone / WhatsApp",
    "Location", "Field of Work", "Portfolio / Demo Reel", "Additional Links",
    "Tools Count", "Advanced", "Intermediate", "Basic", "All Tools (with level)",
    "Other Tools", "Language", "Timezone", "Form Version", "User Agent"
  ]
  const oldRow = legacy.map((h, i) => `old-${i}`)
  const { sandbox, sheet } = run([legacy, oldRow])

  post(sandbox, PAYLOAD)
  const headers = sheet._grid[0]

  check("4a legacy: missing columns appended", headers.includes("Status") && headers.includes("Notes"),
    JSON.stringify(headers.slice(-3)))
  check("4b legacy: originals kept their position",
    JSON.stringify(headers.slice(0, legacy.length)) === JSON.stringify(legacy))
  check("4c legacy: existing data row untouched",
    JSON.stringify(sheet._grid[1]) === JSON.stringify(oldRow))
  check("4d legacy: new row lands correctly",
    asObject(headers, sheet._grid[2])["Full Name"] === "Ana Ribeiro")
}

/* ── 5. Guards ──────────────────────────────────────────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()

  post(sandbox, { ...PAYLOAD, guard: { hp: "bot", elapsedMs: 20000 } })
  check("5a honeypot writes nothing", sheet._grid.length === 1, `rows=${sheet._grid.length}`)

  post(sandbox, { ...PAYLOAD, guard: { hp: "", elapsedMs: 500 } })
  check("5b too-fast writes nothing", sheet._grid.length === 1, `rows=${sheet._grid.length}`)

  post(sandbox, { ...PAYLOAD, profile: { ...PAYLOAD.profile, email: "" } })
  check("5c missing email rejected", sheet._grid.length === 1, `rows=${sheet._grid.length}`)

  const res = post(sandbox, PAYLOAD)
  check("5d valid submission accepted", sheet._grid.length === 2, `rows=${sheet._grid.length}`)
  check("5e responds ok:true", res._text === '{"ok":true}', res._text)
}

/* ── 6. setupSheet is idempotent ────────────────────────────────────────── */
{
  const { sandbox, sheet } = run([])
  sandbox.setupSheet()
  post(sandbox, PAYLOAD)
  const after1 = JSON.stringify(sheet._grid)
  sandbox.setupSheet()
  sandbox.setupSheet()
  check("6a re-running setup changes no data", JSON.stringify(sheet._grid) === after1)
}

const failed = results.filter((r) => !r.pass)
results.forEach((r) => console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  -> " + r.detail : ""}`))
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
