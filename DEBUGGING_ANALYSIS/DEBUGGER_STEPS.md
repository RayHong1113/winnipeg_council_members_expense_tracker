# Debugging Analysis Report

## Logical Breakpoint 1: API Request and Response Retrieval

- **Breakpoint Explanation**: Paused at `const response = await fetch(encodedURL);` inside `getMembersExpenses()` right before sending the encoded SoQL query to the City of Winnipeg Open Data API.
- **What is changed**: the value of the variable `response` changes from `<value unavailable>` into a `Response` object (`ok: true`, `status: 200`, `statusText: "OK"`, `type: "cors"`).
- **Whether matches my expectation**:
  - Yes, it matches my expectation because `fetch(encodedURL)` sends the GET request to the Winnipeg SODA2 endpoint using the encoded `$order` and `$limit` parameters (`sortBy: "journal_date DESC"`, `limit: "100"`) and resolves with a `200 OK` response.

## Logical Breakpoint 2: Destructuring Parsed JSON Data

- **Breakpoint Explanation**: Paused at `const { council_member, ward_office, journal_date, expense_type, amount } = member;` inside `displayData()` after the JSON response is parsed, right before extracting fields from the first `member` object (`index: 0`).
- **What is changed**: after stepping over line 53 to line 55, the destructured variables change from `<value unavailable>` into the extracted values from `member`: `council_member` becomes `"Scott Gillingham"`, `ward_office` becomes `"Mayor's Office"`, `journal_date` becomes `"2026-09-30T00:00:00.000"`, `expense_type` becomes `"Mayor's Expenses"`, and `amount` becomes `"8748.17"` (while `formattedDate` and `formattedAmount` remain `<value unavailable>` because lines 55 and 58 have not executed yet).
- **Whether matches my expectation**:
  - Yes, it matches my expectation because object destructuring extracts the five properties from the parsed `member` object into local variables, preparing them to be formatted on the following lines.

## Logical Breakpoint 3: Dynamically Updating the DOM

- **Breakpoint Explanation**: Paused at `tbody.appendChild(newTr);` inside `displayData()` after building the `<tr>` and its five `<td>` elements, right before inserting the row into `<tbody id="list">`.
- **What is changed**: `newTr.rowIndex` changes from `-1` (not yet attached to the table) into `1`, and the first formatted expense row (`Scott Gillingham`, `Mayor's Office`, `9/30/2026`, `Mayor's Expenses`, `$8748.17`) appears inside the HTML table on the page.
- **Whether matches my expectation**:
  - Yes, it matches my expectation because `tbody.appendChild(newTr)` inserts the newly created row into the DOM so the fetched data becomes visible to the user.

## In-Depth Critical State Investigation: State Transition of `response` After `fetch()`

- **Critical State Investigated**: Transition of `response` from `<value unavailable>` to a `Response` object (`ok: true`, `status: 200`, `statusText: "OK"`) at line 26 of `script.js`.
- **Logic Significance**:
  This state confirms that the query parameters (`sortBy` and `limit`, plus `$where` when a search term is provided) were properly combined into `apiUrl`, encoded using `encodeURI()`, and accepted by the City of Winnipeg Open Data API before attempting to parse JSON.
- **Runtime Correctness**:
  The program behaved as expected. After stepping over `await fetch(encodedURL)`, `response.ok` was `true` and `response.status` was `200`, so execution paused cleanly at the `if (!response.ok)` guard before parsing the body.
- **Next Steps Connection**:
  Because `response.ok` is `true`, `getMembersExpenses()` skips the error throw, proceeds to `return await response.json()`, and returns the parsed array to `listMembersExpenses()`, which then calls `displayData()` to update `#statusMessage` and render each formatted row into the table.
