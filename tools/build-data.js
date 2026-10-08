// Merges the coded-prototype case data (cases.json) with the Figma Pharos 2.0
// specifics (transaction tables, screening, related files, tier, versions) and
// writes src/app/data/cases.data.ts.
const fs = require('fs');
const path = require('path');
const src = require('./source/cases.json');
const OUT = process.argv[2];

const SCREEN_DEF = { sanctions: ['Clear', 'No list matches'], pep: ['Clear', 'No match in PEP lists'], interdiction: ['Clear', 'No active interdictions'], media: ['Clear', 'No adverse findings'] };
const scr = (o = {}) => ({ ...SCREEN_DEF, ...o });

// Other subjects as shown in the Figma Other Subjects modals.
const SUBJ = {
  'Dilshod Karimzoda': { gid: '3000000000123519027', dob: '1984-06-19', since: '2023-11-02', risk: 'Medium', umn: 'Not enrolled', occupation: 'Driver', phone: '+992 907 675 067', email: 'Not provided', address: 'A. Navoi St 14, Dushanbe 734002', short: 'ID-519027', loc: 'Tajik', cc: 'TJ', tag: 'Interdicted', screening: scr({ interdiction: ['Active', 'Receiver block since 2025-12-10 · SAR 56731894'] }) },
  'Rustam Sharipov': { gid: '2000000000282548109', dob: '1959-10-17', since: '2021-05-09', risk: 'Low', umn: 'Not enrolled', occupation: 'Retired', phone: '+992 988 262 042', email: '"receiver" (invalid)', address: 'Mirzo Rizo St, Block 4, Dushanbe', short: 'ID-548109', loc: 'Tajik', cc: 'TJ', tag: 'Screening clear', addressWarn: 'Subject has multiple addresses on file.', screening: scr() },
  'Madina Nazarova': { gid: '3000000000124168528', dob: '1987-05-21', since: '2022-02-17', risk: 'Medium', umn: 'Not enrolled', occupation: 'Teacher', phone: '+992 987 839 696', email: 'Not provided', address: 'Ayni St 7, Dushanbe 734024', short: 'ID-168528', loc: 'Tajik', cc: 'TJ', tag: 'Screening clear', screening: scr() },
  'Hector Villanueva': { gid: '30000000003211488271', dob: '1989-04-11', since: '2021-01-01', risk: 'High', umn: 'UMN-661042', occupation: 'Warehouse supervisor', phone: '+1 305 555 0110', email: 'Not provided', address: '2250 SW 8th St, Miami, FL 33135', short: 'ID-488271', loc: 'US · FL', cc: 'US', tag: 'Adverse media', screening: scr({ media: ['1 hit', '2024 local news report on a check-cashing scheme (unverified)'] }) },
  'Luis Salinas': { gid: '30000000003221488271', dob: '1991-02-03', since: '2022-02-02', risk: 'Medium', umn: 'UMN-661049', occupation: 'Unknown', phone: '+1 956 555 0111', email: 'Not provided', address: '1419 Iturbide St, Laredo, TX 78040', short: 'ID-488271', loc: 'US · TX', cc: 'US', tag: 'Interdicted', screening: scr({ interdiction: ['Active', 'Send block since 2026-08-02 · shared receiver'] }) },
  'Marco Ibarra': { gid: '30000000003231488271', dob: '2005-01-22', since: '2023-03-03', risk: 'Low', umn: 'UMN-661056', occupation: 'Student', phone: '+1 610 555 0112', email: 'Not provided', address: '815 Hamilton St, Allentown, PA 18101', short: 'ID-488271', loc: 'US · PA', cc: 'US', tag: 'PEP', screening: scr({ pep: ['Positive', 'Foreign PEP · relative of a state official (MX)'] }) },
  'Brianna Cole': { gid: '30000000003241488271', dob: '1985-06-14', since: '2024-04-04', risk: 'Low', umn: 'Not enrolled', occupation: 'Nurse', phone: '+1 801 555 0113', email: 'Not provided', address: '2475 Washington Blvd, Ogden, UT 84401', short: 'ID-488271', loc: 'US · UT', cc: 'US', tag: 'Screening clear', screening: scr() },
  'Karen Doyle': { gid: '30000000003251488271', dob: '1971-12-05', since: '2025-05-05', risk: 'Low', umn: 'Not enrolled', occupation: 'Unknown', phone: '+1 813 555 0114', email: 'Not provided', address: '3302 W Bay Dr, Tampa, FL 33606', short: 'ID-488271', loc: 'US · FL', cc: 'US', tag: 'Screening clear', screening: scr() },
  'Bianca Moreira da Silva': { gid: '30000000003261488271', dob: '1993-08-19', since: '2021-06-06', risk: 'Low', umn: 'Not enrolled', occupation: 'Unknown', phone: '+1 702 555 0115', email: 'Not provided', address: '540 Water St, Henderson, NV 89015', short: 'ID-488271', loc: 'US · NV', cc: 'US', tag: 'Screening clear', screening: scr() },
  'Paulo Teixeira': { gid: '30000000003271488271', dob: '1970-03-28', since: '2022-07-07', risk: 'Low', umn: 'Not enrolled', occupation: 'Retired', phone: '+1 702 555 0116', email: 'Not provided', address: '1100 Fremont St, Las Vegas, NV 89101', short: 'ID-488271', loc: 'US · NV', cc: 'US', tag: 'Screening clear', screening: scr() },
  'Daniel Ortega Ruiz': { gid: '30000000003281488271', dob: '2008-02-17', since: '2023-08-08', risk: 'Low', umn: 'Not enrolled', occupation: 'Unknown', phone: '+1 559 555 0117', email: 'Not provided', address: '1600 Van Ness Ave, Fresno, CA 93721', short: 'ID-488271', loc: 'US · CA', cc: 'US', tag: 'Screening clear', screening: scr() },
  'Ernesto Villamor': { gid: '3000000000299184410', dob: '1975-03-04', since: '2018-09-22', risk: 'Low', umn: 'UMN-1187730', occupation: 'Retired', phone: '+1 720 555 0100', email: 'e.villamor@example.com', address: '200 Example Ave, Denver, CO 80237', short: 'ID-184410', loc: 'US · CO', cc: 'US', tag: 'Screening clear', screening: scr() },
};

const PER_CASE = {
  C2608060764518371: {
    tier: 'Tier 2 · Advanced review', version: 'Version 12', lastSaved: 'Last saved Oct 8, 2026, 9:42 AM by Adam A.',
    keySignal: 'Prior SAR on file; 2 transfers under $3K, 4 min apart', corridor: 'US → TJ', approvedTag: 'Ready to File',
    systemFlags: ['Structuring 3K', 'Multiple consumers', 'Payout avoidance', 'Previously reported'],
    addressWarn: 'Subject has multiple addresses on file.', rowsFile: 'c1.json',
    related: [{ id: 'C2510240118735047', meta: '2025-10-24 · Closed · SAR Filed', files: [
      { title: 'Transaction Records (Oct 2025)', tag: 'Financial Records', kind: 'pdf', file: 'Transaction_Records_C2510240118735047.pdf', fmeta: 'Secure PDF Document • 4 Pages', ftype: 'PDF Document (.pdf)', size: '1.1 MB', date: 'Oct 24, 2025 · 09:41', by: 'Jordan P.', desc: '11 transactions to Tajikistan totaling $15,750, exported at case close.' },
      { title: 'Analyst Closure Memo', tag: 'Case History', kind: 'pdf', file: 'Closure_Memo_C2510240118735047.pdf', fmeta: 'Secure PDF Document • 2 Pages', ftype: 'PDF Document (.pdf)', size: '210 KB', date: 'Dec 9, 2025 · 16:05', by: 'Jordan P.', desc: 'Decision rationale and confirmed flags behind SAR 56731894.' },
      { title: 'Sender ID Scan', tag: 'KYC', kind: 'image', file: 'Sender_ID_TX_DL.jpg', fmeta: 'JPEG Image • 1600 × 1000', ftype: 'JPEG Image (.jpg)', size: '640 KB', date: 'Oct 24, 2025 · 10:02', by: 'Jordan P.', desc: 'Texas driver license captured at the send location, Oct 2025.' }] }],
    statement: 'The activity is suspicious and reportable. Prior SAR 56731894 (12/09/2025) was filed for structuring to avoid ID collection. Same sender, same corridor. Payout avoidance: MTCN 8101880246 was available 06/30 but not collected until 08/05, while 7795264018 was collected on 06/30. Sender ID, DOB, address and phone are consistent across all 5 transactions. No false data and no ID sharing on the pay side.',
  },
  C2608060764519427: {
    tier: 'Tier 3 · Senior review', version: 'Version 8', lastSaved: 'Last saved Oct 7, 2026, 4:18 PM by Adam A.',
    keySignal: '8 unrelated senders; bank and wallet payouts', corridor: 'US → CN', approvedTag: 'Ready to File',
    systemFlags: ['Structuring 3K', 'Multiple consumers', 'Multiple jurisdictions', 'High frequency (12+ in 30 days)', 'High value $10K–$14,999', 'Splitting', 'Southwest border city of concern'],
    addressWarn: 'Subject has 4 address spellings on file that describe 2 addresses.', rowsFile: 'c2.json', related: [],
    statement: 'The activity is suspicious and reportable. Eight unrelated senders paid one receiver through a bank account and a mobile wallet. Hector Villanueva sent $2,178 and $2,979 on consecutive days, each under $3,000. The 4 address spellings describe 2 real addresses, so inconsistent data is not called.',
  },
  C2608060764519583: {
    tier: 'Tier 2 · Advanced review', version: 'Version 5', lastSaved: 'Last saved Oct 6, 2026, 11:05 AM by Adam A.',
    keySignal: 'Mandatory-review rule; KYC ECDD approved', corridor: 'US → PH', approvedTag: 'Closed',
    systemFlags: ['Child exploitation typology', 'High frequency (12+ in 30 days)', 'Multiple pay agents', 'Multiple mobile numbers', 'Inconsistent data', 'KYC Approved'],
    allInCase: true, addressWarn: 'Subject has 5 address records on file, all the same Cainta address typed differently.', rowsFile: 'c3.json',
    related: [
      { id: 'R251230760906904', meta: '2025-12-30 · Closed · Approved', files: [
        { title: 'ECDD Questionnaire', tag: 'KYC', kind: 'pdf', file: 'ECDD_Questionnaire_R251230760906904.pdf', fmeta: 'Secure PDF Document • 5 Pages', ftype: 'PDF Document (.pdf)', size: '860 KB', date: 'Dec 18, 2025 · 13:20', by: 'Liza M.', desc: "Sender's answers on purpose, relationship to the receiver and source of funds." },
        { title: 'Source of Funds Letter', tag: 'KYC', kind: 'image', file: 'Source_of_Funds_Letter.jpg', fmeta: 'JPEG Image • 1240 × 1754', ftype: 'JPEG Image (.jpg)', size: '1.3 MB', date: 'Dec 18, 2025 · 13:24', by: 'Liza M.', desc: "Employer letter confirming the sender's monthly salary." }] },
      { id: 'R23053196230447', meta: '2025-02-20 · Closed · Approved', files: [
        { title: 'ECDD Review Notes', tag: 'Case History', kind: 'pdf', file: 'ECDD_Review_Notes_R23053196230447.pdf', fmeta: 'Secure PDF Document • 3 Pages', ftype: 'PDF Document (.pdf)', size: '340 KB', date: 'Feb 20, 2025 · 10:48', by: 'Liza M.', desc: 'December 2024 volume ($7,595) explained as holiday-season support.' }] },
      { id: 'C2603100119752124', meta: '2026-04-16 · Closed · No SAR', files: [
        { title: 'Philippines Team Closure Memo', tag: 'Case History', kind: 'pdf', file: 'Closure_Memo_C2603100119752124.pdf', fmeta: 'Secure PDF Document • 2 Pages', ftype: 'PDF Document (.pdf)', size: '190 KB', date: 'Apr 16, 2026 · 08:15', by: 'Ramon D.', desc: 'Review of the same receiver. Closed without filing.' },
        { title: 'Transaction Records (Mar 2026)', tag: 'Financial Records', kind: 'xlsx', file: 'Pay_Side_History_C2603100119752124.xlsx', fmeta: 'Excel Workbook • 1 Sheet', ftype: 'Excel Workbook (.xlsx)', size: '96 KB', date: 'Apr 10, 2026 · 17:02', by: 'Ramon D.', desc: "Receiver's pay-side history reviewed by the Philippines team." }] },
    ],
    statement: 'The activity is not suspicious and will be closed with no SAR. The child exploitation rule is mitigated by the approved KYC ECDD review (R251230760906904): the sender supports his daughter, who lives with and is cared for by the receiver. Address variations are the same Cainta address typed differently.',
  },
};

const FULL_COLS = ['id', 'date', 'amount', 'fee', 'status', 'attempts', 'txnStatus', 'sender', 'sId', 'sDob', 'sAddr', 'sPhone', 'sLoc', 'state', 'receiver', 'rId', 'rDob', 'rAddr', 'rPhone', 'pLoc', 'netId', 'available', 'paid', 'pickup', 'paidOut', 'product', 'purpose'];
const C3_MAP = { 'TXN ID': 'id', 'Date & Time': 'date', Amount: 'amount', Fee: 'fee', Status: 'status', 'Transaction Attempts': 'attempts', 'TXN Status': 'txnStatus', 'Send location': 'sLoc', 'Receiver ID type & number': 'rId', 'Receiver Address': 'rAddr', 'Receiver Phone': 'rPhone', 'Pay location': 'pLoc', 'Net ID': 'netId', Available: 'available', Paid: 'paid', 'Pickup wait': 'pickup', 'Paid out': 'paidOut', Product: 'product', Purpose: 'purpose', 'Sender / GID': 'sender', 'Sender ID type & number': 'sId', 'Sender DOB': 'sDob', 'Sender Address': 'sAddr', 'Sender Phone': 'sPhone', State: 'state', 'Receiver / GID': 'receiver', 'Receiver DOB': 'rDob' };
const WARN = { SID: 'sId', SDOB: 'sDob', SAddress: 'sAddr', SPhone: 'sPhone', RID: 'rId', RDOB: 'rDob', RAddress: 'rAddr', RPhone: 'rPhone' };

function loadRows(file, caseIds) {
  const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'source', file), 'utf8'));
  return j.rows.map((r) => {
    const [flag, warn, ...cells] = r;
    const o = {};
    if (j.common) {
      for (const [k, v] of Object.entries(j.common)) o[C3_MAP[k]] = v;
      j.cols.forEach((c, i) => (o[C3_MAP[c]] = cells[i]));
    } else FULL_COLS.forEach((c, i) => (o[c] = cells[i]));
    const party = (s) => { const [name, rest] = s.split('\n'); const [cc, gid] = rest.split('·').map((x) => x.trim()); return { name, cc, gid }; };
    const [d, t] = o.date.split('\n');
    return {
      ...o, date: d, time: t, sender: party(o.sender), receiver: party(o.receiver),
      amountNum: Number(o.amount.replace(/[$,]/g, '')), feeNum: Number(o.fee), attempts: Number(o.attempts),
      inCase: caseIds ? caseIds.has(o.id) : true, ruleFlagged: flag === 1, warn: warn ? warn.split(',').map((w) => WARN[w]) : [],
    };
  });
}

const cases = src.CASES.map((c) => {
  const p = PER_CASE[c.id];
  return {
    id: c.id, typology: c.typology, risk: c.risk, team: c.team, analyst: c.analyst, created: c.created, due: c.due, pe: c.pe,
    tier: p.tier, version: p.version, lastSaved: p.lastSaved, keySignal: p.keySignal, corridor: p.corridor, approvedTag: p.approvedTag,
    subject: c.subject, subjectRole: c.subjectRole, summary: c.summary, behavior: c.behavior, facts: c.facts,
    systemFlags: p.systemFlags, rules: c.rules, related: c.related,
    primary: { ...c.primary, addressWarn: p.addressWarn, screening: scr() },
    others: c.others.map((o) => ({ name: o.name, ...SUBJ[o.name] })),
    txns: loadRows(p.rowsFile, p.allInCase ? null : new Set(c.txns.map((t) => t.mtcn))),
    attachments: c.attachments, relatedFiles: p.related, log: c.log, media: c.media,
    specifics: c.specifics, priorSentence: c.priorSentence, relAlert: c.relAlert, nb: c.nb,
    flags: c.flags, autofile: c.autofile, statement: p.statement,
  };
});

const header = '// Generated by tools/build-data.js from the coded Pharos prototype and the\n// Pharos 2.0 Figma file. All names, IDs and contact details are fictional.\nimport { CaseData } from \'./models\';\n\n';

// The source data gave all 8 Case 2 senders the same GID (…488271). Give each a distinct 19-digit GID
// and use its last 6 digits as the short ID, in the subject list and on their transactions.
for (const c of cases) {
  const seen = new Map();
  c.others.forEach((o, i) => {
    if (!o.gid || o.gid.length === 19) return;
    o.gid = '3000000000324882' + (i + 1) + '71';
    o.short = 'ID-' + o.gid.slice(-6);
    seen.set(o.name, o.short);
  });
  for (const t of c.txns) {
    if (seen.has(t.sender.name)) t.sender.gid = seen.get(t.sender.name);
    if (seen.has(t.receiver.name)) t.receiver.gid = seen.get(t.receiver.name);
  }
}

fs.writeFileSync(OUT, header + 'export const CASES: CaseData[] = ' + JSON.stringify(cases, null, 1) + ';\n\nexport const FLAG_LIB: Record<string, { label: string; internal: string; score: number; sa: string[] }> = ' + JSON.stringify(src.FLAG_LIB, null, 1) + ';\n\nexport const SA_CODES = ' + JSON.stringify(src.SA_CODES, null, 1) + ';\n');
console.log('wrote', OUT, cases.map((c) => c.id + ':' + c.txns.length + ' rows, ' + c.txns.filter((t) => t.inCase).length + ' in case').join(' | '));
