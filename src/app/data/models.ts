export type Risk = 'Low' | 'Medium' | 'High' | 'Critical' | string;

export interface ScreeningResult {
  sanctions: [string, string];
  pep: [string, string];
  interdiction: [string, string];
  media: [string, string];
}

export interface Party {
  name: string;
  cc: string;
  gid: string;
}

export type WarnField = 'sId' | 'sDob' | 'sAddr' | 'sPhone' | 'rId' | 'rDob' | 'rAddr' | 'rPhone';

export interface Txn {
  id: string;
  date: string;
  time: string;
  amount: string;
  amountNum: number;
  fee: string;
  feeNum: number;
  status: string;
  attempts: number;
  txnStatus: string;
  sender: Party;
  sId: string;
  sDob: string;
  sAddr: string;
  sPhone: string;
  sLoc: string;
  state: string;
  receiver: Party;
  rId: string;
  rDob: string;
  rAddr: string;
  rPhone: string;
  pLoc: string;
  netId: string;
  available: string;
  paid: string;
  pickup: string;
  paidOut: string;
  product: string;
  purpose: string;
  inCase: boolean;
  ruleFlagged: boolean;
  warn: WarnField[];
}

export interface Rule {
  k: string;
  name: string;
  code: string;
  text: string;
}

export interface RelatedCase {
  id: string;
  date: string;
  text: string;
  status: string;
  outcome: string;
  kyc?: boolean;
  detail?: { team: string; analyst: string; notes: string[]; docs?: string[] };
}

export interface PrimarySubject {
  name: string;
  gid: string;
  dob: string;
  since: string;
  globalRisk: Risk;
  umn: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  addressWarn?: string;
  gidWarn?: string;
  ids?: { type: string; no: string; iss: string }[];
  phones?: string[];
  addrs?: string[];
  screening: ScreeningResult;
}

export interface OtherSubject {
  name: string;
  gid: string;
  dob: string;
  since: string;
  risk: Risk;
  umn: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  addressWarn?: string;
  short: string;
  loc: string;
  cc: string;
  tag: string;
  screening: ScreeningResult;
}

export interface Attachment {
  id: string;
  name: string;
  file: string;
  cat: string;
  kind: string;
  desc: string;
  size: string;
  pages?: number;
  uploaded: string;
  by: string;
  ev: boolean;
}

export interface RelatedFile {
  title: string;
  tag: string;
  kind: string;
  file: string;
  fmeta: string;
  ftype: string;
  size: string;
  date: string;
  by: string;
  desc: string;
}

export interface RelatedFileGroup {
  id: string;
  meta: string;
  files: RelatedFile[];
}

export interface LogEntry {
  id: string;
  type: string;
  ts: string;
  who?: string;
  note?: boolean;
  text: string;
}

export interface MediaResult {
  id: string;
  src: string;
  kind: string;
  ago: string;
  head: string;
  date: string;
  rel: number;
  sum: string;
  url: string;
}

export interface CaseFlag {
  id: string;
  kind: string;
  evidence: string[];
  why: string;
}

export interface CaseData {
  id: string;
  typology: string;
  risk: Risk;
  team: string;
  analyst: string;
  created: string;
  due: string;
  pe: string;
  tier: string;
  version: string;
  lastSaved: string;
  keySignal: string;
  corridor: string;
  approvedTag: string;
  subject: string;
  subjectRole: string;
  summary: string;
  behavior: string[];
  facts: { amount: number; txns: number; corridors: string[]; txnId: string; products: string; subjects: number; agent: string; path: string };
  systemFlags: string[];
  rules: Rule[];
  related: RelatedCase[];
  primary: PrimarySubject;
  others: OtherSubject[];
  txns: Txn[];
  attachments: Attachment[];
  relatedFiles: RelatedFileGroup[];
  log: LogEntry[];
  media: MediaResult[];
  specifics: string;
  priorSentence: string;
  relAlert: string;
  nb: Record<string, string>;
  flags: CaseFlag[];
  autofile: { id: string; label: string; result: string; detail: string }[];
  statement: string;
}
