# Pharos 2.0 — HTML prototype

A clickable, coded version of the **Pharos 2.0 Prototype** Figma file (Round 7), built with Angular 21 and
[NG-ZORRO](https://ng.ant.design) (Ant Design for Angular). It covers My Case Queue, all three test cases with
their four tabs, and every modal and drawer from the Figma flows.

All names, IDs, addresses and contact details are fictional.

## Run it

```bash
npm install
npm start          # http://localhost:4200
```

`npm run build` writes a static site to `dist/pharos-prototype/browser`. The app uses hash URLs
(`/#/case/…`), so it works from any static host. For GitHub Pages use `npm run build:pages`.

Requires Node 20.19+ or 22.12+.

## What's in it

| Screen | Behaviour |
| --- | --- |
| **My Case Queue** | Stat cards and case table. Case risk uses the same tag colours as the case header. Amounts and counts come from each case's attached transactions, so they change when you add or remove transactions. |
| **Case header** | Sticky. Run Media Query, Narrative Builder, Case Actions (7 items; they show a "not in this prototype" toast). Status tag changes to *Ready to File* / *Closed* once the narrative is approved. Fixed footer with version and last saved. |
| **Overview** | Case Summary, System Flags, Rules in Effect (all collapsed), Related Cases, Primary Subject with Screening and address warning tooltip, Other Subjects (click a row or Expand to open the modal). |
| **Transactions** | Three charts built from the transactions attached to the case. Interdict / Add to Case / Remove From Case / Export Report. Search, Show (all / case / non-case), Jump to column. Sort and filter on every column, applied-filter chips with Clear all. Attached rows are yellow, pinned to the top and marked with a pin. Warning icons explain fields where one person has more than one value. 10 rows per page. |
| **Attachments** | Case Attachments with sort and a working Add Attachment modal (pick or drop a file; nothing is uploaded). Related Case Attachments. Every file opens File Preview. |
| **Case Log** | Timeline of everything that happened, including actions you take in the prototype. Case Notes adds a note and shows a toast. |
| **Narrative Builder** | Six steps plus the Narrative Summary. Answers are pre-filled from the case and editable; the Step 6 statement of reason feeds the summary. Approve updates the status tag and the log. |

Changes you make (adding transactions, notes, attachments, approving) last until you reload the page.

### How "attached to the case" works

In Figma the yellow pinned rows were the rule-flagged transactions, while the charts used the full case set. To
make Add/Remove meaningful, the coded version treats the **case transaction set** as "attached": 5 rows in
Case 1, 18 in Case 2 and all 31 in Case 3. That keeps the charts and totals identical to Figma
($5,700.00 · $13,753.30 · $8,602.00). Rows the rules flagged keep the gold *Flagged* status tag.

## Project layout

```
src/app/
  layout/app-bar.component.ts        global nav, notifications, user menu
  queue/queue.component.ts           My Case Queue
  case/case-shell.component.ts       case header, tabs, footer, overlays
  case/overview|transactions|attachments|case-log.component.ts
  case/narrative-builder.component.ts, media-modal, other-subjects-modal, file-preview-modal
  state/case-store.service.ts        working copy of every case (signals)
  data/cases.data.ts                 generated case data
  data/narratives.data.ts            Narrative Summary text from Figma
tools/
  source/                            raw data from the coded prototype and the Figma tables
  build-data.js                      merges them into src/app/data/cases.data.ts (npm run data)
```
