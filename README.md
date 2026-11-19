# roof-careers

A single-page landing site Roof Studio uses to recruit creative talent. A
candidate reads the invitation, fills in their profile, ticks which roles and
pipeline stages they work in, the project types they have led, and the tools
that are part of their process. Each application becomes one row in a Google
Sheet.

**The framing is deliberate: the page talks about craft, not about AI.** The
brief was "attract Creative Talents, not AI Creative Talents". No title or
label on the page carries "AI" — the word appears only inside the invitation
copy and in the questions that are specifically about tools and workflows,
where it is precise rather than a badge.

The content comes from the FORM ROUGH V9 questionnaire, in the trimmed August
2026 version (schema / form version **7**): 8 production areas, 90 tool
checkboxes, **74 distinct tools**, three profile questions, 7 pipeline stages
and 6 project types.

**No question is single-answer.** Every list accepts multiple selections — a
Designer who also animates should not have to pick a lie. That shapes the
spreadsheet: see [One column per click](#spreadsheet-columns) below.

Static site (Vite + React + TypeScript + Tailwind v4), published on GitHub
Pages. The palette and typefaces are Roof Studio's own (brandbook / the colors
`roofstudio.tv` declares on its `:root`), with the **Ambit** and **GT-Alpina**
faces self-hosted in `public/fonts/` — no Google Fonts, no third-party font
requests. Comments in `src/styles/index.css` say which brand color each
derived token comes from.

- **PT-BR / EN** with a toggle in the top bar (also `?lang=en` / `?lang=pt-BR`
  in the URL). Language is detected from the query string, then
  `localStorage`, then the browser; any `pt-*` browser lands on Portuguese,
  everything else on English.
- **One light theme** (Base Sand / Soft Peach ground, Deep Coffee ink). There
  is no dark mode or theme toggle.
- **No backend of its own**: a Google Apps Script Web App writes to the sheet.

---

## Tech stack

| Area | Tools |
| --- | --- |
| Site | Vite 6, React 18, TypeScript 5.6, Tailwind CSS 4 (`@tailwindcss/vite`) |
| UI | framer-motion, react-icons |
| i18n | i18next, react-i18next, i18next-browser-languagedetector |
| Backend | Google Apps Script Web App (`apps-script/Code.gs`) writing to Google Sheets |
| Anti-spam | Honeypot, minimum fill time, optional Cloudflare Turnstile |
| Hosting / CI | GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) |
| Tooling | ESLint, Prettier, Node scripts for roster sync and sheet tests |

---

## Security: why this is safe to publish in a public repo

The right question to ask. The short answer is that **no Google credential
ever reaches the browser**.

The only thing in the public bundle is the Web App's **`/exec` URL**. It is
not a secret and not a key: it grants no access to your account, to the sheet
or to any other data. It is an endpoint that can do exactly one thing — what
is written in [`apps-script/Code.gs`](apps-script/Code.gs).

Three rules hold this up:

1. **The script only writes, it never returns data.** It reads row 1 (the
   header names) to place values in the right columns, and that is all. No
   code path returns sheet rows; `doGet` is a health check that only reports
   schema constants. *Never add one that does.* As long as this holds, the
   worst a stranger with the URL can do is add junk rows — never read what
   candidates submitted.
2. **Credentials stay at Google.** The script runs *as you*, on Google's
   servers. The browser holds no token, key or service account.
3. **The Turnstile secret lives in Script Properties**, server-side. Only the
   *sitekey* is public — that is how Turnstile is designed.

The real risk, then, is not leakage: it is **spam**. There are three layers
against it, in increasing strength:

| Layer | Where | What happens |
| --- | --- | --- |
| Honeypot (hidden field) | sent by the client, judged by the script | The row is still written but marked `honeypot` in the `Flags` column, and no notification email is sent. (Password managers sometimes fill hidden fields, so rows are flagged rather than dropped.) |
| Minimum fill time (4 s) | client timestamp, checked by the script | Rejected with `too fast` |
| Cloudflare Turnstile (optional) | sitekey in the client, secret in the script | Rejected with `failed verification` |

What does **not** work, and is therefore not here: a secret token embedded in
the bundle, and `Origin`/`Referer` checks — both are trivial to bypass and
would only give a false sense of protection.

The script also:

- re-checks the required fields server-side (`fullName`, `email`, `phone`,
  `location`, `portfolio`, and at least one tool or an "other tools" entry),
  mirroring `validate()` in `ApplicationForm.tsx`;
- prefixes values starting with `=`, `+`, `-`, `@`, tab or CR with an
  apostrophe so Sheets never evaluates candidate input as a formula;
- de-duplicates retries by the client-generated `Submission Id`, under a
  script lock, so a resent form never produces two rows.

---

## Setup

### 1. Spreadsheet + Apps Script

1. Create (or open) the spreadsheet that will receive applications.
2. **Extensions → Apps Script**. Delete the contents and paste
   [`apps-script/Code.gs`](apps-script/Code.gs).
3. **Project Settings → Script Properties**, add whichever you need (all
   optional):

   | Property | Effect |
   | --- | --- |
   | `SPREADSHEET_ID` | Pins the destination spreadsheet by ID (the part between `/d/` and `/edit` in its URL). Without it the script uses the bound spreadsheet, and fails loudly if there is none. |
   | `SHEET_NAME` | Tab name (default: `Applications`) |
   | `TURNSTILE_SECRET` | Turns on Cloudflare Turnstile verification |
   | `NOTIFY_EMAIL` | Sends an email for each new (unflagged) application |

   > **One spreadsheet, one tab.** Every response becomes a row in the same
   > table — that is the single view of everyone who applied. Nothing in the
   > script branches by language, role or anything else. If the script was
   > created from the spreadsheet's own menu it is already bound to it;
   > `SPREADSHEET_ID` just makes that explicit and mistake-proof.

4. Run the **`setupSheet`** function once and approve the permissions. It
   creates the tab and builds the header and formatting.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the `/exec` URL.

> Every time you edit `Code.gs` you must create a **new deployment version** —
> otherwise the URL keeps serving the old code. A `GET` on the `/exec` URL
> returns `{ ok, service, schema, columns, tools, areas }`, which tells you
> which schema version a deployment is actually running.

### 2. Local development

Prerequisites: Node.js and npm (CI uses Node 20 for the build). The
`sync:tools` and `test:sheet` scripts import `.ts` files directly, so they
need a Node version with built-in TypeScript type stripping.

```bash
npm install
```

Create a `.env.local` from `.env.example`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_APPS_SCRIPT_URL` | yes | The Web App `/exec` URL from step 1. Without it, submitting throws an error. |
| `VITE_TURNSTILE_SITEKEY` | no | Cloudflare Turnstile sitekey. Leave empty to disable the widget. |

```bash
npm run dev
```

Opens at `http://localhost:5173/roof-careers/` (Vite's `base` is the GitHub
Pages path; see below).

### 3. GitHub Pages

The [`deploy.yml`](.github/workflows/deploy.yml) workflow builds and publishes
on every push to `main` (and can be run manually). It runs `npm ci`,
`npm run build`, copies `dist/index.html` to `dist/404.html`, and deploys
`dist/` to Pages.

In the repository:

1. **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions**:
   - *Secret* `VITE_APPS_SCRIPT_URL` — the URL from step 1. (It ships in the
     bundle anyway; it is a secret only so it is not hard-coded in source.)
   - *Variable* `BASE_PATH` — only for a custom domain: `/`. Without it the
     build uses `/roof-careers/`.
   - *Variable* `VITE_TURNSTILE_SITEKEY` — only if you use Turnstile.

`index.html` also contains a small self-heal script: GitHub Pages can serve a
cached `index.html` that points at hashed assets deleted by the latest deploy,
so the page detects that and reloads once (guarded by `sessionStorage`).

### 4. Turnstile (optional — turn it on when spam shows up)

1. Create a widget in [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
2. `VITE_TURNSTILE_SITEKEY` → repository variable (public, that's fine).
3. `TURNSTILE_SECRET` → Apps Script Script Properties (**never** in the repo).

Without a sitekey the widget simply does not render and everything else keeps
working.

---

## npm scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `.ts` / `.tsx` |
| `npm run format` | Prettier over `src/` |
| `npm run sync:tools` | Rewrite the `GENERATED` block of `apps-script/Code.gs` from the site's data |
| `npm run test:sheet` | `sync:tools --check` (fails if `Code.gs` is out of date), then the Apps Script schema tests |

---

## Structure

```
src/
  assets/roof-wordmark.png   the OFFICIAL Roof mark (filled artwork), used only as an alpha mask
  components/                TopBar, Button, Field, ChipGroup, ToolPicker, RoofWordmark
  data/tools.ts              tool catalogue, grouped by area and split into two parts — source of truth
  data/profile.ts            profile question option ids — source of truth
  i18n/                      pt-BR + en; all visible text lives here
  lib/submit.ts              builds the payload and POSTs it (FORM_VERSION lives here)
  lib/turnstile.ts           loads and mounts the widget (no-op without a sitekey)
  sections/                  Hero → About → ApplicationForm → Thanks
  styles/index.css           Roof brand tokens, fonts, layout
apps-script/
  Code.gs                    the Web App that writes to the sheet
  test/                      sandbox harness with stubbed Google APIs + schema tests
scripts/sync-tools.mjs       copies the rosters from src/data into Code.gs
public/fonts/                self-hosted Ambit and GT-Alpina
```

### Editing copy

Everything is in `src/i18n/locales/`. There are no loose strings in the
components — if you edit one language, edit the other.

### Editing the tool list

`src/data/tools.ts` — 8 production areas, starting with AI workflow /
node-based and Production management / planning, split into two parts in the
picker. Editing, color, voice, sound, music and marketing were removed: they
were asking a Designer about ADR software.

**The same tool appears in every area it belongs to, on purpose.** Runway is
there 3 times, ComfyUI 4. This is not duplication to clean up: "Runway for
VFX" and "Runway for storyboard" are different facts about a person, and that
difference is exactly what makes the answer useful. So a selection is
identified by **area + tool** (`${groupId}:${toolId}`), never by tool alone.

In the sheet the two views reconcile: **one column per distinct tool** (74,
not 90), holding the list of areas the person ticked it in. One filter
answers both "who works with Stable Diffusion" *and* "for what".

A tool's `id` becomes a spreadsheet column, so it must stay stable: if a
product renames itself, change its `name`, keep its `id`.

V9 dropped the per-tool proficiency level. Asking for a level on every tool
is not a form anyone finishes — and a scale repeated dozens of times gets
answered by reflex, not reflection.

### Editing the profile questions

`src/data/profile.ts` — every question is multiple choice; none has a free
text field. The brief was to find out whether a person has directed, has a
short film, and what their pipeline is "without asking explicitly and without
letting the person write about it".

| Roster | Question |
| --- | --- |
| `PRIMARY_EXPERTISE` | Q1 — primary practice (Art Director, Designer, Animator, Other) |
| `AI_WORKFLOW` | Q2 — how they build workflows |
| `CORE_STRENGTH` | Q3 — what they are best at |
| `PIPELINE_AREAS` | Pipeline stages they work in (7) |
| `PROJECT_TYPES` | Project types where they held a creative **leadership** role (6); each reveals its own credits-link field when ticked |

The form also asks for two optional links: an AI project they led and one
they executed.

V9 had nine profile ladders. Responsibility, work mode, visual challenge and
finishing were the same seniority question wearing four hats, and project
reach and AI integration were already answered by the pipeline and workflow
questions — so they were cut. Option ids become spreadsheet columns, so keep
them stable; labels live in the locale files.

### After changing either of them

```bash
npm run sync:tools
```

This rewrites the `GENERATED` block in `apps-script/Code.gs` with every
roster (labels come from `en.json` — sheet headers are English by design).
The script needs them to create one column per answer. `npm run test:sheet`
runs `--check` first and **fails** if the two sides have diverged. Then
redeploy the Apps Script (new version) and re-run `setupSheet`.

If the payload shape changes, bump `FORM_VERSION` in `src/lib/submit.ts`
and `SCHEMA_VERSION` in `Code.gs` together.

---

## Spreadsheet columns

`setupSheet` builds the whole tab: creates the columns and applies width,
number format, alignment, validation, a header in Roof brown (`#322127`),
frozen header row and frozen columns through `Full Name`, a filter and
banded rows. Re-run it whenever the schema changes — it is idempotent and
**never rewrites a data row**.

There are **137 columns**, in two halves with different jobs.

**The readable half (32 columns, on the left)** — what you look at when
reading *one* candidate:

`Received At · Full Name · Status · Rating · Primary Practice · Email ·
Phone / WhatsApp · Location · Portfolio / Demo Reel · Site · Behance · Vimeo ·
Instagram · LinkedIn · Other Link · AI Workflow · Core Strength ·
Led Projects · Pipeline Areas · AI Project (led) · AI Project (executed) ·
Tools Count · All Tools · Other Tools · Language · Timezone ·
Submitted At (client) · Form Version · Submission Id · Flags · User Agent ·
Notes`

Each contact link has its own column, so it can be filtered and clicked.

**The filtering block (105 columns, on the right)** — one column per click:

| Prefix | Count | Value |
| --- | --- | --- |
| `Practice:` | 4 | `Yes` or blank — primary practice |
| `Workflow:` | 4 | `Yes` or blank — how they build workflows |
| `Strength:` | 4 | `Yes` or blank — what they are best at |
| `Pipeline:` | 7 | `Yes` or blank — pipeline stages |
| `Led:` | 6 | `Yes` or blank — led a project of this type |
| `Link:` | 6 | the credits link for that project type, next to it |
| `Tool:` | 74 | **the areas** in which they use the tool |

**Every question gets this block, and it is not decoration.** When questions
were single-answer, the readable column was already a filter: pick a value
in the dropdown and you were done. Multi-select broke that — `Art Director,
Animator` and `Animator, Art Director` are two different filter values, and
neither is "everyone who animates". A `Yes`/blank column per option is the
only shape that survives the change.

Tool columns hold the list of areas, not a tick. A single filter on
`Tool: Runway` answers who uses it **and** for what — and the form's 90
checkboxes cost 74 columns instead of 90.

`Status` (dropdown: `Novo`, `Em análise`, `Contatado`, `Shortlist`,
`Arquivado` — i.e. New, Under review, Contacted, Shortlist, Archived),
`Rating` (1–5, numeric and sortable) and `Notes` are not filled by the form —
they belong to the team.

`Full Name` is the second column on purpose: the frozen panes stop there, so
the name stays visible while you scroll through the wide block.

### How the schema stays honest

Header, width, format and value extractor live on the **same object**, in
`COLUMNS`. Values are placed **by column name**, never by index:

- dragging a column around in Sheets breaks nothing;
- a column of your own that the script does not know about is preserved;
- running `setupSheet` on an older sheet **appends** the missing columns on
  the right, without touching existing ones or the data under them.

Nothing is deleted automatically: removing a column means losing data, and
that decision belongs to a human.

```bash
npm run test:sheet
```

Runs `Code.gs` in a sandbox with the Google APIs stubbed
(`apps-script/test/harness.mjs`) and checks the schema end to end — fresh
sheet, hand-reordered columns, older sheets being upgraded, the same tool
ticked in several areas, unknown ids, empty selections, the honeypot,
too-fast submissions, duplicates and idempotency. Apps Script has no local
test runner; this is the substitute.

> The sandbox refuses `getRange` beyond the sheet's width, as Google does.
> That is how a real bug surfaced: a new sheet has 26 columns, and writing
> all the headers at once throws — `setupSheet` would have failed on its
> first real run.

---

## The brand mark

`src/assets/roof-wordmark.png` (892×319) is the **official** artwork — the
same file roof-onboarding-app ships as `roof-logo-brown.png`. Do not use that
repo's `roof-logo.png`: it is a different, outline drawing, not the mark.

Only the **alpha channel** is used, as a CSS mask painted with the
`--brand-logo` token (Deep Coffee). `--brand-logo` is deliberately separate
from the text color: the logo has its own color and does not follow the
interface ink. The same asset draws the large closing mark at the bottom of
the page, with padding equal to the brandbook's safety margin.

## Layout width

The page uses one container, `.wide-column` in `src/styles/index.css`
(`width: min(94vw, 78rem)`), for the top bar, every section and the tool
mosaic. Content inside caps its own measure where needed; no block sets the
page width on its own.
