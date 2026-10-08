import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FormsModule } from '@angular/forms';
import { CaseStore, RISK_COLOR, usd } from '../state/case-store.service';

@Component({
  selector: 'px-queue',
  imports: [FormsModule, NzBadgeModule, NzBreadCrumbModule, NzSelectModule, NzTableModule, NzTagModule],
  template: `
    <div class="page">
      <nz-breadcrumb><nz-breadcrumb-item>Home</nz-breadcrumb-item><nz-breadcrumb-item>My Case Queue</nz-breadcrumb-item></nz-breadcrumb>
      <div class="ttl">
        <h1>My Case Queue</h1><span class="cnt">{{ rows().length }}</span>
      </div>
      <p class="sub">Cases assigned to Adam A. · US Advanced · North America · sorted by due date</p>

      <div class="stats">
        <div class="stat"><div class="l">Assigned to me</div><div class="v">{{ rows().length }}</div><div class="h">All in progress</div></div>
        <div class="stat"><div class="l">Due within 3 days</div><div class="v">{{ rows().length }}</div><div class="h">Next due 2026-09-25</div></div>
        <div class="stat"><div class="l">High risk</div><div class="v">{{ highRisk() }}</div><div class="h">{{ rows().length - highRisk() }} medium risk</div></div>
        <div class="stat"><div class="l">Flagged amount (USD)</div><div class="v">{{ usd(totalAmount()) }}</div><div class="h">{{ totalTxns() }} transactions across {{ rows().length }} cases</div></div>
      </div>

      <section class="card">
        <div class="card-h">
          <h3>Assigned to me <span class="cnt">{{ rows().length }}</span></h3>
          <span class="sort">Sort by:
            <nz-select [(ngModel)]="sort" nzBorderless nzSize="small" style="width:150px">
              <nz-option nzValue="due" nzLabel="Due date (Asc)" />
              <nz-option nzValue="risk" nzLabel="Case risk (High first)" />
              <nz-option nzValue="amount" nzLabel="Amount (High to Low)" />
            </nz-select>
          </span>
        </div>
        <nz-table #t [nzData]="sorted()" [nzShowPagination]="false" nzSize="middle" [nzScroll]="{ x: '1300px' }">
          <thead>
            <tr>
              <th nzWidth="180px">Case</th><th nzWidth="210px">Primary subject</th><th nzWidth="170px">Typology</th><th nzWidth="110px">Case risk</th>
              <th nzWidth="80px" nzAlign="right">Txns</th><th nzWidth="130px" nzAlign="right">Amount (USD)</th><th nzWidth="220px">Key signal</th>
              <th nzWidth="120px">Due</th><th>Last activity</th>
            </tr>
          </thead>
          <tbody>
            @for (r of t.data; track r.id) {
              <tr class="row" tabindex="0" (click)="open(r.id)" (keydown.enter)="open(r.id)">
                <td><a class="cid">{{ r.id }}</a><div class="m">Created {{ r.created }}</div></td>
                <td><div class="n">{{ r.subject }}</div><div class="m">{{ r.subjectRole }} · {{ r.corridor }}</div></td>
                <td>{{ r.typology }}</td>
                <td><nz-tag [nzColor]="riskColor[r.risk]">{{ r.risk }}</nz-tag></td>
                <td class="num" nzAlign="right">{{ r.count }}</td>
                <td class="num" nzAlign="right">{{ usd(r.amount) }}</td>
                <td>{{ r.keySignal }}</td>
                <td>{{ r.due }}<div class="soon">in 2 days</div></td>
                <td>{{ r.last }}<div class="m">{{ r.lastTs }}</div></td>
              </tr>
            }
          </tbody>
        </nz-table>
        <p class="foot">Showing {{ rows().length }} of {{ rows().length }} cases · Click a row to open the case.</p>
      </section>
    </div>
  `,
  styles: `
    .ttl { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
    .ttl h1 { margin: 0; font-size: 28px; font-weight: 500; }
    .sub { color: rgba(0,0,0,.45); margin: 4px 0 20px; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 16px; margin-bottom: 24px; }
    .stat { background: #fff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px 20px; }
    .stat .l, .stat .h { color: rgba(0,0,0,.45); font-size: 13px; }
    .stat .v { font-size: 28px; font-weight: 500; margin: 4px 0; font-variant-numeric: tabular-nums; }
    .sort { color: rgba(0,0,0,.45); display: inline-flex; align-items: center; gap: 4px; }
    .row { cursor: pointer; }
    .cid { color: #1677ff; }
    .n { font-weight: 600; }
    .m { font-size: 12px; color: rgba(0,0,0,.45); }
    .soon { font-size: 12px; color: #d46b08; }
    .foot { color: rgba(0,0,0,.45); margin: 12px 0 0; }
    @media (max-width: 1000px) { .stats { grid-template-columns: 1fr 1fr; } }
  `,
})
export class QueueComponent {
  private readonly store = inject(CaseStore);
  private readonly router = inject(Router);
  readonly usd = usd;
  readonly riskColor = RISK_COLOR;
  sort = 'due';

  private readonly LAST: Record<string, string> = {
    C2608060764518371: '2026-09-23 11:14 AM', C2608060764519427: '2026-09-23 11:38 AM', C2608060764519583: '2026-09-23 11:45 AM',
  };

  private readonly totals = new Map(this.store.cases.map((c) => [c.id, this.store.totals(c.id)]));

  readonly rows = computed(() =>
    this.store.cases.map((c) => {
      const t = this.totals.get(c.id)!();
      return { ...c, count: t.count, amount: t.amount, last: 'Note added', lastTs: this.LAST[c.id] };
    }),
  );
  readonly highRisk = computed(() => this.rows().filter((r) => r.risk === 'High').length);
  readonly totalAmount = computed(() => this.rows().reduce((a, r) => a + r.amount, 0));
  readonly totalTxns = computed(() => this.rows().reduce((a, r) => a + r.count, 0));

  sorted() {
    const r = [...this.rows()];
    if (this.sort === 'risk') r.sort((a, b) => (b.risk === 'High' ? 1 : 0) - (a.risk === 'High' ? 1 : 0));
    if (this.sort === 'amount') r.sort((a, b) => b.amount - a.amount);
    return r;
  }

  open(id: string) {
    this.router.navigate(['/case', id, 'overview']);
  }
}
