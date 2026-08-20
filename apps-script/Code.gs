/**
 * roof-careers — Google Apps Script Web App
 * ==========================================
 *
 * Receives one application from the public site and appends a row to a Google
 * Sheet. Deployed as "Execute as: me / Who has access: Anyone".
 *
 * EVERY response lands in the SAME spreadsheet, on the SAME tab, one row each —
 * that single table is the view of everyone who applied. There is no branching
 * by language, by role, or by anything else.
 *
 * SECURITY MODEL — read this before changing anything
 * ---------------------------------------------------
 * The /exec URL is PUBLIC. It ships inside the site's JavaScript bundle and
 * anyone can find it. That is fine, and it is not a credential: it grants
 * exactly the capability this file implements and nothing else.
 *
 *   1. This script never RETURNS sheet contents. It reads row 1 (the header
 *      names) to place values in the right columns, and that is all — no
 *      applicant data is ever read back, and no response body carries anything
 *      but {ok:true|false}. Never add an endpoint that returns rows. As long as
 *      that holds, the worst a stranger with the URL can do is add junk rows.
 *   2. The real Google credentials never leave Google. The script runs as YOU,
 *      server-side. The browser holds no token, no key, no service account.
 *   3. The Turnstile SECRET lives in Script Properties, not in the bundle.
 *      Only the sitekey is public, which is how Turnstile is designed.
 *
 * SETUP
 * -----
 *   1. Open the target spreadsheet -> Extensions -> Apps Script.
 *   2. Paste this file over Code.gs.
 *   3. Project Settings -> Script Properties, add (all optional):
 *        SPREADSHEET_ID    pins the destination sheet explicitly
 *        SHEET_NAME        tab name, default "Applications"
 *        TURNSTILE_SECRET  Cloudflare Turnstile secret key
 *        NOTIFY_EMAIL      address to ping on each new application
 *   4. Run `setupSheet` once and approve the permission prompt. It builds the
 *      whole tab: columns, widths, formats, header style, filter, banding.
 *   5. Deploy -> New deployment -> Web app
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Copy the /exec URL into VITE_APPS_SCRIPT_URL on the site.
 *
 * After ANY edit to this file you must create a NEW deployment version,
 * otherwise the live URL keeps serving the old code.
 */

/* ────────────────────────────────────────────────────────────────────────
   THE SCHEMA — one definition, not two lists to keep in sync

   Header text, column width, number format and the value extractor live
   together on one object. Adding, removing or reordering a column is a single
   edit here; there is no second array that can silently drift out of step and
   start writing every value one column to the left.

   `header` doubles as the identity of the column: rows are placed by matching
   these names against row 1 of the sheet, so a column dragged around by hand
   in Sheets keeps receiving the right data.
   ──────────────────────────────────────────────────────────────────────── */

/** Formats a subset of the tools list as "Name, Name, Name". */
function toolsAtLevel(payload, level) {
  return (payload.tools || [])
    .filter(function (tool) {
      return tool.level === level
    })
    .map(function (tool) {
      return tool.name
    })
    .join(", ")
}

function profileField(name) {
  return function (payload) {
    return String((payload.profile || {})[name] || "")
  }
}

function metaField(name) {
  return function (payload) {
    return String((payload.meta || {})[name] || "")
  }
}

var TRIAGE_STATUSES = ["Novo", "Em análise", "Contatado", "Shortlist", "Arquivado"]

var COLUMNS = [
  {
    header: "Received At",
    width: 145,
    format: "yyyy-mm-dd hh:mm:ss",
    value: function () {
      return new Date()
    }
  },
  {
    // Seeded as "Novo" on arrival, then owned by the team. A dropdown rather
    // than free text so the pipeline stays typo-free and actually filterable.
    header: "Status",
    width: 110,
    validation: TRIAGE_STATUSES,
    value: function () {
      return TRIAGE_STATUSES[0]
    }
  },
  { header: "Full Name", width: 190, value: profileField("fullName") },
  { header: "Email", width: 210, value: profileField("email") },
  { header: "Phone / WhatsApp", width: 150, value: profileField("phone") },
  { header: "Location", width: 160, value: profileField("location") },
  { header: "Field of Work", width: 160, value: profileField("role") },
  { header: "Portfolio / Demo Reel", width: 260, value: profileField("portfolio") },
  { header: "Additional Links", width: 240, value: profileField("links") },
  {
    header: "Tools Count",
    width: 95,
    format: "0",
    align: "center",
    value: function (payload) {
      return (payload.tools || []).length
    }
  },
  {
    header: "Advanced",
    width: 260,
    value: function (payload) {
      return toolsAtLevel(payload, "advanced")
    }
  },
  {
    header: "Intermediate",
    width: 260,
    value: function (payload) {
      return toolsAtLevel(payload, "intermediate")
    }
  },
  {
    header: "Basic",
    width: 260,
    value: function (payload) {
      return toolsAtLevel(payload, "basic")
    }
  },
  {
    header: "All Tools (with level)",
    width: 320,
    value: function (payload) {
      return (payload.tools || [])
        .map(function (tool) {
          return tool.name + " (" + tool.level + ")"
        })
        .join("; ")
    }
  },
  {
    header: "Other Tools",
    width: 200,
    value: function (payload) {
      return String(payload.otherTools || "")
    }
  },
  { header: "Language", width: 80, align: "center", value: metaField("language") },
  { header: "Timezone", width: 150, value: metaField("timezone") },
  {
    header: "Submitted At (client)",
    width: 165,
    value: metaField("submittedAt")
  },
  { header: "Form Version", width: 95, align: "center", value: metaField("formVersion") },
  { header: "User Agent", width: 240, value: metaField("userAgent") },
  {
    // Free space for the team. No extractor: the form has nothing to say here.
    header: "Notes",
    width: 280,
    value: null
  }
]

var HEADERS = COLUMNS.map(function (column) {
  return column.header
})

/** Roof brown with white ink — the header reads as the brand, not as a default. */
var HEADER_BG = "#322127"
var HEADER_FG = "#ffffff"

var SHEET_NAME = PropertiesService.getScriptProperties().getProperty("SHEET_NAME") || "Applications"

/** Anything faster than this was not typed by a person. */
var MIN_ELAPSED_MS = 4000

/* ────────────────────────────────────────────────────────────────────────
   Entry points
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Health check only. Returns a fixed object and NEVER touches the sheet —
 * this endpoint is public, so it must not become a way to read applications.
 */
function doGet() {
  return json({ ok: true, service: "roof-careers" })
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: "empty body" })
    }

    var payload = JSON.parse(e.postData.contents)
    var guard = payload.guard || {}

    // Honeypot: a human never fills a field they cannot see. Answer `ok` so
    // the bot has no signal to iterate against, and write nothing.
    if (guard.hp) {
      return json({ ok: true })
    }

    if (typeof guard.elapsedMs === "number" && guard.elapsedMs < MIN_ELAPSED_MS) {
      return json({ ok: false, error: "too fast" })
    }

    var turnstileSecret =
      PropertiesService.getScriptProperties().getProperty("TURNSTILE_SECRET") || ""
    if (turnstileSecret && !verifyTurnstile(turnstileSecret, guard.turnstileToken)) {
      return json({ ok: false, error: "failed verification" })
    }

    var profile = payload.profile || {}
    if (!String(profile.fullName || "").trim() || !String(profile.email || "").trim()) {
      return json({ ok: false, error: "missing required fields" })
    }

    appendRow(payload)
    notify(payload)

    return json({ ok: true })
  } catch (err) {
    console.error(err)
    return json({ ok: false, error: "server error" })
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Sheet
   ──────────────────────────────────────────────────────────────────────── */

/**
 * ONE spreadsheet, ONE tab, for every single response — that is the whole
 * point: a single view of everyone who applied. Nothing here ever creates a
 * second destination.
 *
 * `SPREADSHEET_ID` pins it explicitly. Without it we fall back to the bound
 * spreadsheet, which only exists when the script was created from
 * Extensions -> Apps Script. A standalone project has no bound sheet and
 * would fail silently at `getActiveSpreadsheet()` — so we fail loudly instead.
 */
function getSpreadsheet() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")
  var spreadsheet = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet()

  if (!spreadsheet) {
    throw new Error("No spreadsheet bound to this script. Set the SPREADSHEET_ID script property.")
  }
  return spreadsheet
}

function getSheet() {
  var spreadsheet = getSpreadsheet()
  var sheet = spreadsheet.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME)
  }
  return sheet
}

/** The header row as it actually is right now, trimmed of trailing blanks. */
function readHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) return []

  var width = Math.max(sheet.getLastColumn(), 1)
  var values = sheet.getRange(1, 1, 1, width).getValues()[0]

  while (values.length && String(values[values.length - 1]).trim() === "") {
    values.pop()
  }
  return values.map(function (value) {
    return String(value).trim()
  })
}

/**
 * Brings the sheet up to the current schema WITHOUT touching existing data.
 *
 * Columns already present keep their position, so a column someone dragged
 * around by hand — or data already under it — is never scrambled. Only genuinely
 * missing columns are appended on the right. Nothing is ever deleted: removing a
 * column is a decision with data loss attached, and it belongs to a human.
 */
function syncHeaders(sheet) {
  var existing = readHeaderRow(sheet)

  if (!existing.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    return HEADERS.slice()
  }

  var missing = HEADERS.filter(function (header) {
    return existing.indexOf(header) === -1
  })

  if (missing.length) {
    sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing])
    existing = existing.concat(missing)
  }
  return existing
}

/**
 * Run this by hand, once, after pasting the script — and again any time the
 * schema here changes. Idempotent: it repairs an existing tab in place and
 * never rewrites a row of data.
 */
function setupSheet() {
  var sheet = getSheet()
  var headers = syncHeaders(sheet)
  var width = headers.length
  var maxRows = sheet.getMaxRows()

  // Header row: brand colors, bold, frozen, and tall enough to breathe.
  var headerRange = sheet.getRange(1, 1, 1, width)
  headerRange
    .setFontWeight("bold")
    .setBackground(HEADER_BG)
    .setFontColor(HEADER_FG)
    .setVerticalAlignment("middle")
    .setWrap(false)
  sheet.setRowHeight(1, 32)
  sheet.setFrozenRows(1)

  // Freeze through the name so a wide table stays readable when scrolled right.
  var nameIndex = headers.indexOf("Full Name")
  sheet.setFrozenColumns(nameIndex >= 0 ? nameIndex + 1 : 1)

  // Per-column width, number format, alignment and validation — driven by the
  // schema, matched by header name so a manually reordered sheet still works.
  COLUMNS.forEach(function (column) {
    var index = headers.indexOf(column.header)
    if (index === -1) return
    var position = index + 1

    sheet.setColumnWidth(position, column.width)

    if (maxRows < 2) return
    var body = sheet.getRange(2, position, maxRows - 1, 1)

    // CLIP, not WRAP: one application must stay one screen-height row. The full
    // value is still there — click the cell to read it.
    body.setWrap(false)
    if (column.format) body.setNumberFormat(column.format)
    if (column.align) body.setHorizontalAlignment(column.align)

    if (column.validation) {
      body.setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireValueInList(column.validation, true)
          .setAllowInvalid(false)
          .build()
      )
    }
  })

  // Rebuild the filter and banding rather than stacking duplicates on re-run.
  var existingFilter = sheet.getFilter()
  if (existingFilter) existingFilter.remove()

  sheet.getBandings().forEach(function (banding) {
    banding.remove()
  })

  if (maxRows > 1) {
    sheet.getRange(1, 1, maxRows, width).createFilter()

    // Banding on the DATA rows only, with showHeader false. Include row 1 and
    // the theme paints its own header color straight over the Roof brown.
    sheet
      .getRange(2, 1, maxRows - 1, width)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)
  }

  SpreadsheetApp.flush()
  return "ok — '" + SHEET_NAME + "' ready with " + width + " columns"
}

function appendRow(payload) {
  // Two people submitting in the same second would otherwise race for the same
  // row. The lock costs nothing at this volume.
  var lock = LockService.getScriptLock()
  lock.waitLock(15000)

  try {
    var sheet = getSheet()
    var headers = syncHeaders(sheet)

    // Values are placed BY HEADER NAME, never by position. Reorder the columns
    // in Sheets and the data still lands where it belongs; a header we do not
    // know (someone's own column) is left untouched.
    var byHeader = {}
    COLUMNS.forEach(function (column) {
      if (column.value) byHeader[column.header] = column.value(payload)
    })

    var row = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(byHeader, header) ? byHeader[header] : ""
    })

    sheet.appendRow(row)
  } finally {
    lock.releaseLock()
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────── */

function verifyTurnstile(secret, token) {
  if (!token) return false

  try {
    var response = UrlFetchApp.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "post",
      payload: { secret: secret, response: token },
      muteHttpExceptions: true
    })
    var result = JSON.parse(response.getContentText())
    return result.success === true
  } catch (err) {
    console.error(err)
    // Cloudflare being unreachable must not cost us a real candidate.
    return true
  }
}

/** Optional heads-up mail. Silent no-op when NOTIFY_EMAIL is not set. */
function notify(payload) {
  var to = PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL")
  if (!to) return

  var profile = payload.profile || {}
  var tools = payload.tools || []

  try {
    MailApp.sendEmail({
      to: to,
      subject: "Nova inscrição — " + (profile.fullName || "sem nome"),
      body: [
        profile.fullName,
        profile.email,
        profile.phone,
        profile.location,
        profile.role,
        "",
        "Portfólio: " + (profile.portfolio || "—"),
        "Links: " + (profile.links || "—"),
        "",
        tools.length + " ferramentas",
        tools
          .map(function (tool) {
            return "• " + tool.name + " (" + tool.level + ")"
          })
          .join("\n"),
        payload.otherTools ? "\nOutras: " + payload.otherTools : "",
        "",
        getSpreadsheet().getUrl()
      ].join("\n")
    })
  } catch (err) {
    // A mail failure must never lose the row that was already written.
    console.error(err)
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  )
}
