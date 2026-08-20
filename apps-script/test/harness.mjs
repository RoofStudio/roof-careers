import fs from "node:fs"
import vm from "node:vm"

const CODE = fs.readFileSync(new URL("../Code.gs", import.meta.url), "utf8")

/** A grid-backed fake of the tiny slice of the Sheets API this script touches. */
function makeSheet(initialRows = []) {
  const MAX_ROWS = 1000
  const grid = initialRows.map((r) => [...r])
  const calls = { widths: {}, formats: {}, aligns: {}, validations: {}, frozen: {} }

  const cell = (r, c) => (grid[r] && grid[r][c] !== undefined ? grid[r][c] : "")

  const range = (row, col, numRows, numCols) => ({
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
      return range(row, col, numRows, numCols)
    },
    setFontWeight: () => range(row, col, numRows, numCols),
    setBackground: () => range(row, col, numRows, numCols),
    setFontColor: () => range(row, col, numRows, numCols),
    setVerticalAlignment: () => range(row, col, numRows, numCols),
    setWrap: () => range(row, col, numRows, numCols),
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
