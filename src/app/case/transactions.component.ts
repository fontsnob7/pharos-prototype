import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableFilterList, NzTableModule, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Txn, WarnField } from '../data/models';
import { CaseStore, usd } from '../state/case-store.service';
import { ToastService } from '../shared/toast.service';
import { CaseContext } from './case-context.service';

interface Col {
  key: string;
  label: string;
  width: number;
  group?: 'send' | 'pay';
  get: (t: Txn) => string;
  num?: (t: Txn) => number;
  bucket?: (t: Txn) => string;
  warn?: WarnField;
  align?: 'right';
}

const WARN_WORD: Record<string, string> = { Id: 'ID', Dob: 'date of birth', Addr: 'address', Phone: 'phone number' };
const STATUS_COLOR: Record<string, string> = {
  Interdicted: '#ff4d4f', 'Review escalated': '#fa8c16', 'STARS complaint': '#fa8c16', 'Review cleared': '#52c41a', Refunded: '#1677ff', 'No action': '#bfbfbf',
};
const PALETTE = ['#1677ff', '#13c2c2', '#fa8c16', '#722ed1', '#52c41a', '#eb2f96', '#faad14', '#2f54eb'];

const amountBucket = (t: Txn) => (t.amountNum < 500 ? '< $500' : t.amountNum < 3000 ? '$500 – $2,999' : '≥ $3,000');
const monthBucket = (t: Txn) => new Date(t.date + 'T00:00:00').toLocaleString('en-US', { month: 'long', year: 'numeric' });
const pickupHours = (p: string) => {
  const n = parseFloat(p);
  return p.includes('day') ? n * 24 : p.includes('min') ? n / 60 : n;
};

const COLS: Col[] = [
  { key: 'id', label: 'TXN ID', width: 130, get: (t) => t.id },
  { key: 'date', label: 'Date & Time', width: 170, get: (t) => `${t.date} ${t.time}`, bucket: monthBucket },
  { key: 'amount', label: 'Amount', width: 120, get: (t) => t.amount, num: (t) => t.amountNum, bucket: amountBucket, align: 'right' },
  { key: 'fee', label: 'Fee', width: 90, get: (t) => t.fee, num: (t) => t.feeNum, align: 'right' },
  { key: 'status', label: 'Status', width: 110, get: (t) => t.status },
  { key: 'attempts', label: 'TXN Attempts', width: 170, get: (t) => String(t.attempts), num: (t) => t.attempts },
  { key: 'txnStatus', label: 'TXN Status', width: 180, get: (t) => t.txnStatus },
  { key: 'sender', label: 'Sender / GID', width: 210, group: 'send', get: (t) => t.sender.name },
  { key: 'sId', label: 'ID type & number', width: 250, group: 'send', get: (t) => t.sId, warn: 'sId' },
  { key: 'sDob', label: 'DOB', width: 130, group: 'send', get: (t) => t.sDob, warn: 'sDob' },
  { key: 'sAddr', label: 'Address', width: 280, group: 'send', get: (t) => t.sAddr, warn: 'sAddr' },
  { key: 'sPhone', label: 'Phone', width: 170, group: 'send', get: (t) => t.sPhone, warn: 'sPhone' },
  { key: 'sLoc', label: 'Send location', width: 200, group: 'send', get: (t) => t.sLoc },
  { key: 'state', label: 'State', width: 90, group: 'send', get: (t) => t.state },
  { key: 'receiver', label: 'Receiver / GID', width: 210, group: 'pay', get: (t) => t.receiver.name },
  { key: 'rId', label: 'ID type & number', width: 250, group: 'pay', get: (t) => t.rId, warn: 'rId' },
  { key: 'rDob', label: 'DOB', width: 130, group: 'pay', get: (t) => t.rDob, warn: 'rDob' },
  { key: 'rAddr', label: 'Address', width: 280, group: 'pay', get: (t) => t.rAddr, warn: 'rAddr' },
  { key: 'rPhone', label: 'Phone', width: 170, group: 'pay', get: (t) => t.rPhone, warn: 'rPhone' },
  { key: 'pLoc', label: 'Pay location', width: 220, group: 'pay', get: (t) => t.pLoc },
  { key: 'netId', label: 'Net ID', width: 100, group: 'pay', get: (t) => t.netId },
  { key: 'available', label: 'Available', width: 160, group: 'pay', get: (t) => t.available },
  { key: 'paid', label: 'Paid', width: 160, group: 'pay', get: (t) => t.paid },
  { key: 'pickup', label: 'Pickup wait', width: 130, group: 'pay', get: (t) => t.pickup, num: (t) => pickupHours(t.pickup), bucket: (t) => (pickupHours(t.pickup) > 24 ? 'Over 24 hours' : 'Within 24 hours') },
  { key: 'paidOut', label: 'Paid out', width: 150, group: 'pay', get: (t) => t.paidOut, align: 'right' },
  { key: 'product', label: 'Product', width: 150, get: (t) => t.product },
  { key: 'purpose', label: 'Purpose', width: 200, get: (t) => t.purpose },
];

const JUMP = [
  ['sId', 'Sender ID'], ['sDob', 'Sender DOB'], ['sAddr', 'Sender address'], ['sPhone', 'Sender phone'], ['sLoc', 'Send location'],
  ['rId', 'Receiver ID'], ['rDob', 'Receiver DOB'], ['rAddr', 'Receiver address'], ['rPhone', 'Receiver phone'], ['pLoc', 'Pay location'], ['pickup', 'Pickup wait'],
];

@Component({
  selector: 'px-transactions',
  imports: [DecimalPipe, FormsModule, NzBadgeModule, NzButtonModule, NzIconModule, NzInputModule, NzSelectModule, NzTableModule, NzTagModule, NzTooltipModule],
  template: `
    <div class="charts">
      <section class="card">
        <div class="card-h"><h3>Counter Parties</h3><span class="m">{{ cpLabel }} · by amount</span></div>
        <ul class="bars">
          @for (b of counterparties(); track b.label) {
            <li><span class="bl">{{ b.label }}</span><span class="track"><span [style.width.%]="b.pct" [style.background]="b.color"></span></span><span class="bv">{{ usd(b.value) }}</span></li>
          } @empty { <li class="m">No case transactions</li> }
        </ul>
      </section>
      <section class="card">
        <div class="card-h"><h3>Corridors</h3><span class="m">{{ attached().length }} transactions</span></div>
        <div class="donut">
          <svg viewBox="0 0 42 42" width="150" height="150" role="img" aria-label="Corridor share">
            <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f0f0f0" stroke-width="6" />
            @for (s of corridors(); track s.label) {
              <circle cx="21" cy="21" r="15.915" fill="none" [attr.stroke]="s.color" stroke-width="6"
                [attr.stroke-dasharray]="s.pct + ' ' + (100 - s.pct)" [attr.stroke-dashoffset]="25 - s.offset" />
            }
            <text x="21" y="20" text-anchor="middle" class="dn">{{ usdShort(total()) }}</text>
            <text x="21" y="25.5" text-anchor="middle" class="dl">total</text>
          </svg>
          <ul class="legend">
            @for (s of corridors(); track s.label) {
              <li><span class="sw" [style.background]="s.color"></span>{{ s.label }}<span class="lv">{{ s.pct | number: '1.0-0' }}%</span></li>
            }
          </ul>
        </div>
      </section>
      <section class="card">
        <div class="card-h"><h3>Transaction Purpose</h3><span class="m">by count</span></div>
        <ul class="bars">
          @for (b of purposes(); track b.label) {
            <li><span class="bl">{{ b.label }}</span><span class="track"><span [style.width.%]="b.pct" [style.background]="b.color"></span></span><span class="bv">{{ b.value }}</span></li>
          } @empty { <li class="m">No case transactions</li> }
        </ul>
      </section>
    </div>

    <section class="card">
      <div class="card-h">
        <h3>Transactions <span class="cnt">{{ txns().length }}</span></h3>
        <div class="tools">
          <button nz-button [disabled]="!selected().size" (click)="interdict()">Interdict</button>
          <button nz-button [disabled]="!canAdd()" (click)="setInCase(true)">Add to Case</button>
          <button nz-button [disabled]="!canRemove()" (click)="setInCase(false)">Remove From Case</button>
          <button nz-button nzType="primary" (click)="toast.show('Transaction report exported')"><nz-icon nzType="download" /> Export Report</button>
        </div>
      </div>

      <div class="filters">
        <nz-input-group [nzPrefix]="sIcon" class="search"><input nz-input placeholder="Search TXN ID, name, ID, phone…" [ngModel]="search()" (ngModelChange)="search.set($event)" /></nz-input-group>
        <ng-template #sIcon><nz-icon nzType="search" /></ng-template>
        <span class="lbl">Show</span>
        <nz-select [ngModel]="show()" (ngModelChange)="show.set($event)" style="width:200px">
          <nz-option nzValue="all" nzLabel="All transactions" />
          <nz-option nzValue="case" nzLabel="Case transactions" />
          <nz-option nzValue="history" nzLabel="Non-case history" />
        </nz-select>
        <span class="lbl">Jump to</span>
        <nz-select nzPlaceHolder="Select column" [ngModel]="null" (ngModelChange)="jump($event)" style="width:200px">
          @for (j of jumpOpts; track j[0]) { <nz-option [nzValue]="j[0]" [nzLabel]="j[1]" /> }
        </nz-select>
      </div>
      <p class="hint"><nz-icon nzType="info-circle" /> Only transactions attached to the case will be reflected in the graphs above. Adding and removing transactions will update the graphs. Scroll sideways or use Jump to for ID, DOB, address, phone and pickup columns on each side.</p>

      @if (chips().length) {
        <div class="chips">
          <span class="m">Filters:</span>
          @for (ch of chips(); track ch.key) {
            <nz-tag nzMode="closeable" (nzOnClose)="clearFilter(ch.key)">{{ ch.label }}: {{ ch.values }}</nz-tag>
          }
          <a (click)="clearAll()" tabindex="0" (keydown.enter)="clearAll()">Clear all</a>
        </div>
      }

      <div #wrap>
        <nz-table #t [nzData]="rows()" [nzPageSize]="10" nzSize="small" [nzScroll]="{ x: scrollX + 'px' }" nzShowSizeChanger="false"
          [nzShowTotal]="tot" (nzCurrentPageDataChange)="pageData.set($event)" class="txt">
          <thead>
            <tr>
              <th rowspan="2" nzLeft nzWidth="48px" [nzChecked]="allPageChecked()" [nzIndeterminate]="somePageChecked()" (nzCheckedChange)="checkPage($event)"></th>
              @for (c of headTop; track c.key) {
                @if (c.key === 'send' || c.key === 'pay') {
                  <th [attr.colspan]="c.span" class="grp" [class.pay]="c.key === 'pay'">{{ c.label }}</th>
                } @else {
                  @let cc = col(c.key);
                  <th [attr.rowspan]="2" [nzWidth]="cc.width + 'px'" [nzLeft]="cc.key === 'id'" [attr.data-col]="cc.key" [class.pay]="cc.group === 'pay'"
                    [nzSortFn]="true" [nzSortOrder]="sortKey() === cc.key ? sortOrder() : null" (nzSortOrderChange)="onSort(cc.key, $event)"
                    [nzFilters]="filterLists()[cc.key]" [nzFilterFn]="true" [nzFilterMultiple]="true" (nzFilterChange)="onFilter(cc.key, $event)">{{ cc.label }}</th>
                }
              }
            </tr>
            <tr>
              @for (c of groupCols; track c.key) {
                <th [attr.rowspan]="1" [nzWidth]="c.width + 'px'" [nzLeft]="c.key === 'id'" [attr.data-col]="c.key" [class.pay]="c.group === 'pay'"
                    [nzSortFn]="true" [nzSortOrder]="sortKey() === c.key ? sortOrder() : null" (nzSortOrderChange)="onSort(c.key, $event)"
                    [nzFilters]="filterLists()[c.key]" [nzFilterFn]="true" [nzFilterMultiple]="true" (nzFilterChange)="onFilter(c.key, $event)">{{ c.label }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (r of t.data; track r.id) {
              <tr [class.attached]="r.inCase">
                <td nzLeft [nzChecked]="selected().has(r.id)" (nzCheckedChange)="toggle(r.id, $event)"></td>
                @for (c of cols; track c.key) {
                  <td [nzLeft]="c.key === 'id'" [nzAlign]="c.align ?? 'left'" [attr.data-col]="c.key">
                    @switch (c.key) {
                      @case ('id') { <span class="tid">{{ r.id }}</span>@if (r.inCase) { <nz-icon nzType="pushpin" nzTheme="fill" class="pin" nz-tooltip nzTooltipTitle="Attached to the case" /> } }
                      @case ('date') { {{ r.date }} <span class="m">{{ r.time }}</span> }
                      @case ('status') { @if (r.status === 'Flagged') { <nz-tag nzColor="gold">Flagged</nz-tag> } @else { {{ r.status }} } }
                      @case ('txnStatus') { <nz-badge [nzColor]="statusColor[r.txnStatus]" [nzText]="r.txnStatus" /> }
                      @case ('sender') { <div class="pn">{{ r.sender.name }}</div><div class="m">{{ r.sender.gid }} · {{ r.sender.cc }}</div> }
                      @case ('receiver') { <div class="pn">{{ r.receiver.name }}</div><div class="m">{{ r.receiver.gid }} · {{ r.receiver.cc }}</div> }
                      @case ('pickup') { <span [class.late]="isLate(r)">{{ r.pickup }}</span> }
                      @default {
                        <span class="cell">{{ c.get(r) }}
                          @if (c.warn && r.warn.includes(c.warn)) {
                            <nz-icon nzType="warning" nzTheme="fill" class="warn" nz-tooltip [nzTooltipTitle]="warnText(c.warn)" nzTooltipOverlayClassName="px-tip" tabindex="0" />
                          }
                        </span>
                      }
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </nz-table>
      </div>
      <ng-template #tot let-range="range" let-total>Showing {{ range[0] }}–{{ range[1] }} of {{ total }}</ng-template>

    </section>
  `,
  styles: `
    .charts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-bottom: 24px; }
    .m { font-size: 12px; color: rgba(0,0,0,.45); }
    .bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .bars li { display: grid; grid-template-columns: 130px 1fr auto; gap: 10px; align-items: center; font-size: 13px; }
    .bl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .track { height: 10px; background: #f5f5f5; border-radius: 5px; overflow: hidden; }
    .track span { display: block; height: 100%; border-radius: 5px; transition: width .3s; }
    .bv { font-variant-numeric: tabular-nums; color: rgba(0,0,0,.65); }
    .donut { display: flex; gap: 20px; align-items: center; }
    .donut circle { transition: stroke-dasharray .3s; }
    .dn { font-size: 5px; font-weight: 600; fill: rgba(0,0,0,.88); }
    .dl { font-size: 3px; fill: rgba(0,0,0,.45); }
    .legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: 13px; flex: 1; }
    .legend li { display: flex; align-items: center; gap: 8px; }
    .sw { width: 10px; height: 10px; border-radius: 2px; }
    .lv { margin-left: auto; color: rgba(0,0,0,.45); }
    .tools { display: flex; gap: 8px; flex-wrap: wrap; }
    .filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
    .search { width: 320px; }
    .lbl { color: rgba(0,0,0,.45); margin-left: 8px; }
    .hint { color: rgba(0,0,0,.45); font-size: 13px; margin: 8px 0 12px; }
    .chips { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
    .chips a { color: #1677ff; cursor: pointer; margin-left: 4px; }
    .grp { text-align: left !important; font-weight: 600 !important; background: #f0f5ff !important; }
    .grp.pay, th.pay { background: #f6ffed; }
    tr.attached > td { background: #fffbe6; }
    tr.attached:hover > td { background: #fff1b8 !important; }
    .tid { font-variant-numeric: tabular-nums; }
    .pin { color: #faad14; margin-left: 6px; }
    .pn { font-weight: 500; }
    .late { color: #ff4d4f; font-weight: 500; }
    .warn { color: #fa8c16; margin-left: 6px; cursor: help; }
    @media (max-width: 1100px) { .charts { grid-template-columns: 1fr; } .search { width: 100%; } }
  `,
})
export class TransactionsComponent {
  readonly ctx = inject(CaseContext);
  readonly toast = inject(ToastService);
  private readonly store = inject(CaseStore);
  private readonly wrap = viewChild.required<ElementRef<HTMLElement>>('wrap');
  readonly usd = usd;
  readonly statusColor = STATUS_COLOR;
  readonly cols = COLS;
  readonly groupCols = COLS.filter((c) => c.group);
  readonly jumpOpts = JUMP;
  readonly scrollX = COLS.reduce((a, c) => a + c.width, 48);
  readonly headTop = (() => {
    const out: { key: string; label: string; span: number }[] = [];
    for (const c of COLS) {
      if (!c.group) out.push({ key: c.key, label: c.label, span: 1 });
      else if (out.at(-1)?.key === c.group) out.at(-1)!.span++;
      else out.push({ key: c.group, label: c.group === 'send' ? 'Send side' : 'Pay side', span: 1 });
    }
    return out;
  })();

  readonly txns = this.ctx.state.txns;
  readonly search = signal('');
  readonly show = signal<'all' | 'case' | 'history'>('all');
  readonly sortKey = signal<string | null>(null);
  readonly sortOrder = signal<NzTableSortOrder>(null);
  readonly filters = signal<Record<string, string[]>>({});
  readonly selected = signal<Set<string>>(new Set());
  readonly pageData = signal<readonly Txn[]>([]);

  col(key: string) { return COLS.find((c) => c.key === key)!; }
  private value(c: Col, t: Txn) { return c.bucket ? c.bucket(t) : c.get(t); }

  readonly filterLists = computed(() => {
    const f = this.filters();
    const out: Record<string, NzTableFilterList> = {};
    for (const c of COLS) {
      const vals = [...new Set(this.txns().map((t) => this.value(c, t)))];
      if (c.num && !c.bucket) vals.sort((a, b) => parseFloat(a.replace(/[^\d.]/g, '')) - parseFloat(b.replace(/[^\d.]/g, '')));
      else if (!c.bucket) vals.sort();
      out[c.key] = vals.map((v) => ({ text: v, value: v, byDefault: (f[c.key] ?? []).includes(v) }));
    }
    return out;
  });

  readonly rows = computed(() => {
    const q = this.search().trim().toLowerCase();
    const f = this.filters();
    const show = this.show();
    let r = this.txns().filter((t) => (show === 'all' ? true : show === 'case' ? t.inCase : !t.inCase));
    if (q) r = r.filter((t) => COLS.some((c) => c.get(t).toLowerCase().includes(q)) || t.sender.gid.toLowerCase().includes(q) || t.receiver.gid.toLowerCase().includes(q));
    for (const [k, vals] of Object.entries(f)) {
      if (!vals.length) continue;
      const c = this.col(k);
      r = r.filter((t) => vals.includes(this.value(c, t)));
    }
    const key = this.sortKey();
    const ord = this.sortOrder();
    if (key && ord) {
      const c = this.col(key);
      const dir = ord === 'ascend' ? 1 : -1;
      r = [...r].sort((a, b) => dir * (c.num ? c.num(a) - c.num(b) : c.get(a).localeCompare(c.get(b))));
    }
    // Transactions attached to the case stay pinned to the top.
    return [...r.filter((t) => t.inCase), ...r.filter((t) => !t.inCase)];
  });

  readonly chips = computed(() =>
    Object.entries(this.filters())
      .filter(([, v]) => v.length)
      .map(([k, v]) => {
        const c = this.col(k);
        return { key: k, label: (c.group === 'send' ? 'Sender ' : c.group === 'pay' && !['receiver', 'pLoc', 'netId', 'available', 'paid', 'pickup', 'paidOut'].includes(k) ? 'Receiver ' : '') + c.label, values: v.join(', ') };
      }),
  );

  readonly attached = computed(() => this.txns().filter((t) => t.inCase));
  readonly total = computed(() => this.attached().reduce((a, t) => a + t.amountNum, 0));
  get cpLabel() { return this.ctx.data.subjectRole === 'Sender' ? 'Receivers' : 'Senders'; }

  readonly counterparties = computed(() => {
    const isSender = this.ctx.data.subjectRole === 'Sender';
    return this.bars(this.attached(), (t) => (isSender ? t.receiver.name : t.sender.name), (t) => t.amountNum);
  });
  readonly purposes = computed(() => this.bars(this.attached(), (t) => t.purpose, () => 1));
  readonly corridors = computed(() => {
    const total = this.total() || 1;
    const m = new Map<string, number>();
    for (const t of this.attached()) m.set(`${t.sender.cc} → ${t.receiver.cc}`, (m.get(`${t.sender.cc} → ${t.receiver.cc}`) ?? 0) + t.amountNum);
    let off = 0;
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([label, v], i) => {
      const s = { label, pct: (v / total) * 100, offset: off, color: PALETTE[i % PALETTE.length] };
      off += s.pct;
      return s;
    });
  });

  private bars(list: Txn[], key: (t: Txn) => string, val: (t: Txn) => number) {
    const m = new Map<string, number>();
    for (const t of list) m.set(key(t), (m.get(key(t)) ?? 0) + val(t));
    const arr = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = arr[0]?.[1] ?? 1;
    return arr.map(([label, value], i) => ({ label, value, pct: (value / max) * 100, color: PALETTE[i % PALETTE.length] }));
  }

  usdShort(n: number) { return n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'K' : '$' + n.toFixed(0); }
  isLate(t: Txn) { return pickupHours(t.pickup) > 24; }
  warnText(w: string) { return `The same person has more than one ${WARN_WORD[w.slice(1)]}.`; }

  onSort(key: string, ord: NzTableSortOrder) {
    if (!ord && this.sortKey() !== key) return;
    this.sortKey.set(ord ? key : null);
    this.sortOrder.set(ord);
  }
  onFilter(key: string, vals: string[] | null) {
    this.filters.update((f) => ({ ...f, [key]: vals ?? [] }));
  }
  clearFilter(key: string) { this.onFilter(key, []); }
  clearAll() {
    this.filters.set({});
    this.search.set('');
    this.show.set('all');
  }

  toggle(id: string, on: boolean) {
    this.selected.update((s) => {
      const n = new Set(s);
      if (on) n.add(id); else n.delete(id);
      return n;
    });
  }
  readonly allPageChecked = computed(() => this.pageData().length > 0 && this.pageData().every((t) => this.selected().has(t.id)));
  readonly somePageChecked = computed(() => !this.allPageChecked() && this.pageData().some((t) => this.selected().has(t.id)));
  checkPage(on: boolean) {
    for (const t of this.pageData()) this.toggle(t.id, on);
  }

  private sel() { return this.txns().filter((t) => this.selected().has(t.id)); }
  readonly canAdd = computed(() => this.txns().some((t) => this.selected().has(t.id) && !t.inCase));
  readonly canRemove = computed(() => this.txns().some((t) => this.selected().has(t.id) && t.inCase));

  setInCase(on: boolean) {
    const ids = new Set(this.sel().filter((t) => t.inCase !== on).map((t) => t.id));
    this.txns.update((l) => l.map((t) => (ids.has(t.id) ? { ...t, inCase: on } : t)));
    const n = ids.size;
    const word = `${n} transaction${n === 1 ? '' : 's'}`;
    this.store.addLog(this.ctx.data.id, { type: 'Transaction', who: 'Adam A.', text: `${word} ${on ? 'added to' : 'removed from'} the case: ${[...ids].join(', ')}.` });
    this.toast.show(on ? `${word} added to case` : `${word} removed from case`);
    this.selected.set(new Set());
  }

  interdict() {
    const ids = new Set(this.sel().map((t) => t.id));
    this.txns.update((l) => l.map((t) => (ids.has(t.id) ? { ...t, txnStatus: 'Interdicted' } : t)));
    const word = `${ids.size} transaction${ids.size === 1 ? '' : 's'}`;
    this.store.addLog(this.ctx.data.id, { type: 'Transaction', who: 'Adam A.', text: `${word} interdicted: ${[...ids].join(', ')}.` });
    this.toast.show(`${word} interdicted`);
    this.selected.set(new Set());
  }

  jump(key: string | null) {
    if (!key) return;
    const root = this.wrap().nativeElement;
    const scroller = root.querySelector<HTMLElement>('.ant-table-body') ?? root.querySelector<HTMLElement>('.ant-table-content');
    const th = root.querySelector<HTMLElement>(`th[data-col="${key}"]`);
    if (!scroller || !th) return;
    const fixed = 48 + this.col('id').width;
    scroller.scrollTo({ left: Math.max(0, th.offsetLeft - fixed), behavior: 'smooth' });
    root.querySelector<HTMLElement>('.ant-table-header')?.scrollTo({ left: Math.max(0, th.offsetLeft - fixed) });
  }
}
