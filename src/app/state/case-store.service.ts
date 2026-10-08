import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { CASES } from '../data/cases.data';
import { Attachment, CaseData, LogEntry, Txn } from '../data/models';

export interface CaseState {
  data: CaseData;
  txns: WritableSignal<Txn[]>;
  log: WritableSignal<LogEntry[]>;
  attachments: WritableSignal<Attachment[]>;
  approved: WritableSignal<boolean>;
}

/** Holds a working copy of every case so edits made in the prototype persist while navigating. */
@Injectable({ providedIn: 'root' })
export class CaseStore {
  private readonly states = new Map<string, CaseState>();

  readonly cases: CaseData[] = CASES;

  constructor() {
    for (const c of CASES) {
      const copy: CaseData = structuredClone(c);
      this.states.set(c.id, {
        data: copy,
        txns: signal(copy.txns),
        log: signal(copy.log),
        attachments: signal(copy.attachments),
        approved: signal(false),
      });
    }
  }

  get(id: string): CaseState | undefined {
    return this.states.get(id);
  }

  /** Flagged amount and count for the queue and stat cards, from the attached transactions. */
  totals(id: string) {
    const s = this.states.get(id)!;
    return computed(() => {
      const t = s.txns().filter((x) => x.inCase);
      return { count: t.length, amount: t.reduce((a, x) => a + x.amountNum, 0) };
    });
  }

  addLog(id: string, entry: Omit<LogEntry, 'id' | 'ts'>) {
    const s = this.states.get(id)!;
    s.log.update((l) => [{ ...entry, id: 'n' + Date.now(), ts: nowTs() }, ...l]);
  }
}

export function nowTs(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(h)}:${p(d.getMinutes())}:${p(d.getSeconds())} ${ap}`;
}

export const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const initials = (n: string) => n.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const RISK_COLOR: Record<string, string> = { Low: 'green', Medium: 'orange', High: 'red', Critical: 'magenta' };
