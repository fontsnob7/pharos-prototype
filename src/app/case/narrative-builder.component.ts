import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NARRATIVES } from '../data/narratives.data';
import { CaseStore } from '../state/case-store.service';
import { ToastService } from '../shared/toast.service';
import { CaseContext } from './case-context.service';

interface NbForm {
  currency: string; scope: string; name: string; employer: string; risk: string; threshold: string; accounts: string; locations: string; aware: string;
  cp: string; rel: string; multi: string; biz: string; third: string; priorSar: string; law: string; statement: string;
}

const REPORT_TYPES = ['SAR (FinCEN)', 'No SAR (internal record)', 'STR (non-US FIU)', 'CTR (FinCEN)', 'Law enforcement request response'];
const LOCAL_CCY: Record<string, string> = { TJ: 'TJS', CN: 'CNY', PH: 'PHP' };

/** Narrative Builder drawer: Steps 1–6, then the Narrative Summary with Approve. */
@Component({
  selector: 'px-narrative-builder',
  imports: [
    FormsModule, NzAlertModule, NzButtonModule, NzCheckboxModule, NzDrawerModule, NzIconModule, NzInputModule, NzRadioModule, NzSelectModule,
    NzStepsModule, NzTagModule,
  ],
  template: `
    <nz-drawer [nzVisible]="ctx.narrativeOpen()" (nzOnClose)="close()" [nzWidth]="640" [nzTitle]="title" [nzFooter]="footer" nzWrapClassName="nb">
      <ng-template #title>
        <div class="dt">Narrative Builder</div>
      </ng-template>
      <ng-container *nzDrawerContent>
        <div class="stephead">
          <span class="eyebrow">{{ stepNames[stepIdx()] }}</span>
          <span class="of">Step {{ step() > 6 ? 6 : step() }} of 6</span>
        </div>
        <div class="bar"><span [style.width.%]="(Math.min(step(), 6) / 6) * 100"></span></div>

        @switch (step()) {
          @case (1) {
            <h2>Report Type &amp; Timeline</h2>
            <div class="f">
              <label>What action do you want to take? <span class="auto">Auto-filled</span></label>
              <nz-select nzMode="multiple" [(ngModel)]="reportType" nzPlaceHolder="Select report type" style="width:100%">
                @for (o of reportTypes; track o) { <nz-option [nzValue]="o" [nzLabel]="o" /> }
              </nz-select>
            </div>
            <div class="f"><label>Alert that triggered the case</label><input nz-input [value]="nb['alert']" readonly /></div>
            <div class="f"><label>Typology</label><input nz-input [value]="nb['typology']" readonly /></div>
            <div class="row2">
              <div class="f"><label>Start Date</label><input nz-input [value]="nb['start']" readonly /></div>
              <div class="f"><label>End Date</label><input nz-input [value]="nb['end']" readonly /></div>
            </div>
            <div class="f">
              <label>Primary currency <span class="req">*</span></label>
              <nz-radio-group [(ngModel)]="form.currency" nzButtonStyle="solid">
                <label nz-radio-button nzValue="Other">Other</label>
                <label nz-radio-button [nzValue]="localCcy">{{ localCcy }}</label>
                <label nz-radio-button nzValue="USD">USD</label>
              </nz-radio-group>
            </div>
            <div class="f">
              <label>Geographic scope</label>
              <nz-radio-group [(ngModel)]="form.scope" class="stack">
                <label nz-radio nzValue="dom">Domestic only</label>
                <label nz-radio nzValue="intl">International only</label>
                <label nz-radio nzValue="mixed">Domestic with international transfers</label>
              </nz-radio-group>
            </div>
          }
          @case (2) {
            <h2>Who is involved?</h2>
            <div class="f"><label>Full legal name <span class="req">*</span> <span class="auto">Auto-filled</span></label><input nz-input [(ngModel)]="form.name" /></div>
            <div class="row2">
              <div class="f"><label>Galactic ID</label><input nz-input [value]="nb['gid']" readonly /></div>
              <div class="f"><label>Customer since</label><input nz-input [value]="nb['since']" readonly /></div>
            </div>
            <div class="row2">
              <div class="f"><label>Date of Birth</label><input nz-input [value]="nb['dob']" readonly /></div>
              <div class="f"><label>Nationality</label><input nz-input [value]="nb['nationality']" readonly /></div>
            </div>
            <div class="f"><label>Employer</label><input nz-input [(ngModel)]="form.employer" placeholder="e.g. Self-employed" /><div class="help">Leave blank if unknown</div></div>
            <div class="f">
              <label>Internal risk</label>
              <nz-radio-group [(ngModel)]="form.risk" nzButtonStyle="solid">
                @for (r of ['Low', 'Medium', 'High', 'Critical']; track r) { <label nz-radio-button [nzValue]="r">{{ r }}</label> }
              </nz-radio-group>
            </div>
          }
          @case (3) {
            <h2>What was done?</h2>
            <div class="row2">
              <div class="f"><label>Total amount involved <span class="req">*</span> <span class="auto">Auto-filled</span></label><input nz-input [value]="nb['total']" readonly /></div>
              <div class="f"><label>Number of transactions</label><input nz-input [value]="nb['txns']" readonly /></div>
            </div>
            <div class="f">
              <label>Which reporting threshold was the customer structuring around? <span class="req">*</span></label>
              <nz-radio-group [(ngModel)]="form.threshold" class="stack">
                <label nz-radio nzValue="3000">$3,000 - Funds Transfer Record threshold</label>
                <label nz-radio nzValue="5000">$5,000 - Money Transfer threshold</label>
                <label nz-radio nzValue="10000">$10,000 - CTR reporting threshold</label>
                <label nz-radio nzValue="other">Other / Unknown</label>
              </nz-radio-group>
            </div>
            <div class="f">
              <label>Were multiple accounts used?</label>
              <nz-radio-group [(ngModel)]="form.accounts">
                <label nz-radio nzValue="yes">{{ c.id === 'C2608060764519427' ? 'Yes (bank account and mobile wallet)' : 'Yes' }}</label>
                <label nz-radio nzValue="no">No, single account</label>
              </nz-radio-group>
            </div>
            <div class="f">
              <label>Were multiple Western Union locations or channels used? <span class="req">*</span></label>
              <nz-radio-group [(ngModel)]="form.locations">
                <label nz-radio nzValue="yes">Yes</label>
                <label nz-radio nzValue="no">No, single location</label>
              </nz-radio-group>
            </div>
            <div class="f">
              <label>Is the subject aware of reporting requirements?</label>
              <nz-radio-group [(ngModel)]="form.aware">
                <label nz-radio nzValue="yes">Yes, evidence of deliberate avoidance</label>
                <label nz-radio nzValue="no">No</label>
              </nz-radio-group>
            </div>
          }
          @case (4) {
            <h2>Who else is involved?</h2>
            <nz-alert nzType="info" nzShowIcon [nzMessage]="c.relAlert" class="al" />
            <div class="row2">
              <div class="f"><label>Primary {{ cpRole }} <span class="req">*</span> <span class="auto">Auto-filled</span></label><input nz-input [(ngModel)]="form.cp" /></div>
              <div class="f"><label>{{ cpRole }} Country</label><input nz-input [value]="nb['cpCountry']" readonly /></div>
            </div>
            <div class="f">
              <label>What is the known relationship with the customer?</label>
              <nz-radio-group [(ngModel)]="form.rel" class="stack">
                <label nz-radio nzValue="family">Family member</label>
                <label nz-radio nzValue="business">Business associate</label>
                <label nz-radio nzValue="none">No stated relationship</label>
                <label nz-radio nzValue="unknown">Unknown / Unverified</label>
              </nz-radio-group>
            </div>
            @for (q of yesNo4; track q.k) {
              <div class="f">
                <label>{{ q.label }}</label>
                <nz-radio-group [(ngModel)]="form[q.k]"><label nz-radio nzValue="yes">Yes</label><label nz-radio nzValue="no">No</label></nz-radio-group>
              </div>
            }
          }
          @case (5) {
            <h2>Supporting Documents</h2>
            <div class="f">
              <label>Add attachments to narrative <span class="req">*</span> <span class="auto">Auto-filled</span></label>
              <div class="help">Items automatically identified from Attachments.</div>
              <div class="ev">
                @for (a of ctx.state.attachments(); track a.id) {
                  <label class="evi" [class.on]="evidence()[a.id]">
                    <input type="checkbox" [checked]="evidence()[a.id]" (change)="toggleEv(a.id)" />
                    <span class="nm">{{ a.name }}</span><nz-tag>{{ a.cat }}</nz-tag>
                  </label>
                }
              </div>
            </div>
            <div class="f">
              <label>Has a prior SAR been filed?</label>
              <nz-radio-group [(ngModel)]="form.priorSar">
                <label nz-radio nzValue="no">No</label><label nz-radio nzValue="yes">Yes, prior SAR exists</label><label nz-radio nzValue="unknown">Unknown</label>
              </nz-radio-group>
            </div>
            <div class="f">
              <label>Has law enforcement been notified?</label>
              <nz-radio-group [(ngModel)]="form.law" class="stack">
                <label nz-radio nzValue="yes">Yes</label><label nz-radio nzValue="no">No</label><label nz-radio nzValue="pending">Pending; notification in progress</label>
              </nz-radio-group>
            </div>
          }
          @case (6) {
            <h2>Resolve Case</h2>
            <div class="f">
              <label>Report type <span class="req">*</span></label>
              <nz-select nzMode="multiple" [(ngModel)]="reportType" style="width:100%">
                @for (o of reportTypes; track o) { <nz-option [nzValue]="o" [nzLabel]="o" /> }
              </nz-select>
            </div>
            <div class="f">
              <label>Statement of reason</label>
              <div class="help">This response will be added to the generated narrative.</div>
              <textarea nz-input [(ngModel)]="form.statement" [nzAutosize]="{ minRows: 8, maxRows: 16 }"></textarea>
            </div>
          }
          @default {
            <div class="sumhead"><h2>Narrative Summary</h2>
              @if (ctx.state.approved()) { <nz-tag nzColor="green">Approved</nz-tag> } @else { <nz-tag nzColor="blue">Ready for review</nz-tag> }
            </div>
            <div class="doc">
              <div class="kick">{{ n.heading }}</div>
              @for (p of n.paragraphs; track $index) { <p>{{ p }}</p> }
              <div class="kick">ANALYST REASONING</div>
              <p>{{ form.statement }}</p>
              <div class="kick">CASE DETAILS</div>
              <dl>
                @for (d of details(); track d[0]) { <dt>{{ d[0] }}:</dt><dd>{{ d[1] }}</dd> }
              </dl>
            </div>
          }
        }
      </ng-container>
      <ng-template #footer>
        <div class="foot">
          @if (step() > 1) { <button nz-button (click)="step.set(step() - 1)">Back</button> } @else { <span></span> }
          @if (step() < 6) { <button nz-button nzType="primary" (click)="step.set(step() + 1)">Next</button> }
          @if (step() === 6) { <button nz-button nzType="primary" [disabled]="!reportType.length" (click)="generate()"><nz-icon nzType="thunderbolt" /> Generate Narrative</button> }
          @if (step() === 7) {
            <button nz-button nzType="primary" [disabled]="ctx.state.approved()" (click)="approve()">{{ ctx.state.approved() ? 'Approved' : 'Approve' }}</button>
          }
        </div>
      </ng-template>
    </nz-drawer>
  `,
  styles: `
    .dt { font-weight: 600; font-size: 16px; }
    .stephead { display: flex; justify-content: space-between; align-items: baseline; }
    .eyebrow { color: #1677ff; font-weight: 500; }
    .of { color: rgba(0,0,0,.45); font-size: 12px; }
    .bar { height: 4px; background: #f0f0f0; border-radius: 2px; margin: 8px 0 20px; overflow: hidden; }
    .bar span { display: block; height: 100%; background: #1677ff; transition: width .2s; }
    h2 { font-size: 20px; font-weight: 500; margin: 0 0 16px; }
    .f { margin-bottom: 18px; }
    .f > label { display: block; font-weight: 500; margin-bottom: 8px; }
    .req { color: #ff4d4f; }
    .auto { font-size: 12px; font-weight: 400; color: #1677ff; background: #e6f4ff; border-radius: 4px; padding: 1px 6px; margin-left: 6px; }
    .help { color: rgba(0,0,0,.45); font-size: 12px; margin: -2px 0 8px; }
    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .stack { display: grid; gap: 8px; }
    .al { margin-bottom: 16px; }
    .ev { display: grid; gap: 8px; }
    .evi { display: flex; align-items: center; gap: 10px; border: 1px solid #f0f0f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; }
    .evi:hover { border-color: #1677ff; }
    .evi.on { background: #e6f4ff; border-color: #91caff; }
    .evi .nm { flex: 1; }
    .sumhead { display: flex; align-items: center; gap: 10px; }
    .sumhead h2 { margin: 0; }
    .doc { border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px; margin-top: 16px; background: #fafafa; }
    .doc p { line-height: 1.6; }
    .kick { font-size: 12px; letter-spacing: .04em; color: rgba(0,0,0,.45); font-weight: 600; margin: 16px 0 8px; }
    .kick:first-child { margin-top: 0; }
    dl { display: grid; grid-template-columns: 150px 1fr; gap: 6px 12px; margin: 0; }
    dt { color: rgba(0,0,0,.45); }
    dd { margin: 0; }
    .foot { display: flex; justify-content: space-between; }
  `,
})
export class NarrativeBuilderComponent {
  readonly ctx = inject(CaseContext);
  private readonly store = inject(CaseStore);
  private readonly toast = inject(ToastService);
  readonly Math = Math;
  readonly reportTypes = REPORT_TYPES;
  readonly stepNames = ['Classification', 'Subject Understanding', 'Activity', 'Relationships', 'Evidence', 'Resolution', 'Resolution'];

  readonly step = signal(1);
  readonly stepIdx = computed(() => this.step() - 1);
  readonly evidence = signal<Record<string, boolean>>({});

  reportType: string[] = [];
  form = {} as NbForm;

  constructor() {
    // Reset to step 1 each time the drawer opens; keep answers for the session.
    effect(() => {
      if (this.ctx.narrativeOpen() && !this.form['name']) this.init();
    });
  }

  get c() { return this.ctx.data; }
  get nb() { return this.c.nb; }
  get n() { return NARRATIVES[this.c.id]; }
  get localCcy() { return LOCAL_CCY[this.c.corridor.split('→')[1]?.trim()] ?? 'Local'; }
  get cpRole() { return this.c.subjectRole === 'Sender' ? 'Recipient' : 'Sender'; }
  get yesNo4() {
    const r = this.cpRole.toLowerCase();
    return <{ k: 'multi' | 'biz' | 'third'; label: string }[]>[
      { k: 'multi', label: `Is there more than one ${r}?` },
      { k: 'biz', label: 'Is a business associate involved?' },
      { k: 'third', label: 'Was a 3rd party intermediary involved?' },
    ];
  }

  private init() {
    const nb = this.nb;
    this.reportType = [nb['reportType'] === 'SAR' ? REPORT_TYPES[0] : REPORT_TYPES[1]];
    this.form = {
      currency: nb['currency'], scope: nb['scope'], name: nb['name'], employer: nb['employer'], risk: nb['risk'], threshold: nb['threshold'],
      accounts: nb['accounts'], locations: nb['locations'], aware: nb['aware'], cp: nb['cp'], rel: nb['rel'], multi: nb['multi'], biz: nb['biz'],
      third: nb['third'], priorSar: nb['priorSar'], law: nb['law'], statement: this.c.statement,
    };
    this.evidence.set(Object.fromEntries(this.ctx.state.attachments().map((a) => [a.id, a.ev])));
  }

  toggleEv(id: string) {
    this.evidence.update((e) => ({ ...e, [id]: !e[id] }));
  }

  readonly details = () => {
    const nb = this.nb;
    const n = this.n;
    const rows: [string, string][] = [
      ['Case ID', this.c.id], ['Alert reference', nb['alert']], ['Subject name', this.form['name']], ['Galactic ID', nb['gid']],
      ['Review period', `${nb['start']} – ${nb['end']}`], ['Total amount', nb['total']], ['Transactions', nb['txns']], ['Internal risk', this.form['risk']],
      ['Activity summary', n.activity],
    ];
    if (n.codes) rows.push(['FinCEN codes', n.codes]);
    if (n.instrument) rows.push(['Instrument', n.instrument]);
    rows.push(['Decision', this.reportType.includes(REPORT_TYPES[0]) ? 'File SAR (FinCEN)' : n.decision]);
    rows.push(['Status', this.ctx.state.approved() ? 'Approved' : 'Pending approval']);
    return rows;
  };

  generate() {
    this.step.set(7);
  }

  approve() {
    this.ctx.state.approved.set(true);
    this.store.addLog(this.c.id, { type: 'Narrative Approved', who: 'Adam A.', text: `Narrative approved. Decision: ${this.details().find((d) => d[0] === 'Decision')![1]}.` });
    this.toast.show('Case narrative approved');
    this.close();
  }

  close() {
    this.ctx.narrativeOpen.set(false);
    setTimeout(() => this.step.set(this.ctx.state.approved() ? 7 : 1), 300);
  }
}
