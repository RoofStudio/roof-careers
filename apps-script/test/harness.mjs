import fs from "node:fs"
import vm from "node:vm"

const CODE = fs.readFileSync(new URL("../Code.gs", import.meta.url), "utf8")

/** A grid-backed fake of the tiny slice of the Sheets API this script touches. */
function makeSheet(initialRows = []) {
  const MAX_ROWS = 1000
  const grid = initialRows.map((r) => [...r])
  const calls = { widths: {}, formats: {}, aligns: {}, validations: {}, frozen: {} }

  // A real sheet can never hold data past its own width, so seeded rows set
  // the floor. 26 is what Google gives a brand-new spreadsheet.
  let maxColumns = Math.max(26, ...grid.map((r) => r.length), 0)

  const cell = (r, c) => (grid[r] && grid[r][c] !== undefined ? grid[r][c] : "")

  // Google throws when a range runs past the sheet's real width. The fake used
  // to allow it, which hid a crash that only appeared on a live spreadsheet.
  const range = (row, col, numRows, numCols) => {
    if (col + numCols - 1 > maxColumns) {
      throw new Error(
        `range exceeds sheet width: needs col ${col + numCols - 1}, sheet has ${maxColumns}`
      )
    }
    return rangeApi(row, col, numRows, numCols)
  }

  const rangeApi = (row, col, numRows, numCols) => ({
    getValues: () => {
      const out = []
      for (let r = 0; r < numRows; r++) {
        const line = []
        for (let c = 0; c < numCols; c++) line.push(cell(row - 1 + r, col - 1 + c))
        out.push(line)
      }
      return out
    },
    setValues: (values) => {
      values.forEach((line, r) => {
        const gr = row - 1 + r
        grid[gr] ||= []
        line.forEach((v, c) => (grid[gr][col - 1 + c] = v))
      })
      return rangeApi(row, col, numRows, numCols)
    },
    setFontWeight: () => rangeApi(row, col, numRows, numCols),
    setBackground: () => rangeApi(row, col, numRows, numCols),
    setFontColor: () => rangeApi(row, col, numRows, numCols),
    setVerticalAlignment: () => rangeApi(row, col, numRows, numCols),
    setWrap: () => rangeApi(row, col, numRows, numCols),
    setNumberFormat: (f) => ((calls.formats[col] = f), range(row, col, numRows, numCols)),
    setHorizontalAlignment: (a) => ((calls.aligns[col] = a), range(row, col, numRows, numCols)),
    setDataValidation: (v) => ((calls.validations[col] = v), range(row, col, numRows, numCols)),
    createFilter: () => ({}),
    applyRowBanding: (theme, showHeader, showFooter) => {
      calls.banding = { theme, showHeader, showFooter, startRow: row }
      return {}
    }
  })

  return {
    _grid: grid,
    _calls: calls,
    getLastRow: () => grid.length,
    getLastColumn: () => grid.reduce((n, r) => Math.max(n, r.length), 0),
    getMaxRows: () => MAX_ROWS,
    getMaxColumns: () => maxColumns,
    insertColumnsAfter: (_after, howMany) => {
      calls.insertedColumns = (calls.insertedColumns || 0) + howMany
      maxColumns += howMany
    },
    getRange: range,
    appendRow: (row) => grid.push([...row]),
    setRowHeight: () => {},
    setFrozenRows: (n) => (calls.frozen.rows = n),
    setFrozenColumns: (n) => (calls.frozen.cols = n),
    setColumnWidth: (c, w) => (calls.widths[c] = w),
    getFilter: () => null,
    getBandings: () => []
  }
}

export function run(initialRows, scriptProps = {}) {
  const sheet = makeSheet(initialRows)

  const sandbox = {
    console,
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (k) => scriptProps[k] ?? null })
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: () => sheet,
        insertSheet: () => sheet,
        getUrl: () => "https://docs.google.com/fake"
      }),
      newDataValidation: () => {
        const b = {
          _list: null,
          requireValueInList(list) {
            b._list = list
            return b
          },
          setAllowInvalid: () => b,
          build: () => ({ list: b._list })
        }
        return b
      },
      BandingTheme: { LIGHT_GREY: "LIGHT_GREY" },
      flush: () => {}
    },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text) => ({ _text: text, setMimeType: () => ({ _text: text }) })
    },
    MailApp: { sendEmail: () => {} },
    UrlFetchApp: { fetch: () => ({ getContentText: () => '{"success":true}' }) }
  }

  vm.createContext(sandbox)
  vm.runInContext(CODE, sandbox)
  return { sandbox, sheet }
}
