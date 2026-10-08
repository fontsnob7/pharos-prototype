import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { RISK_COLOR } from '../state/case-store.service';
import { ToastService } from '../shared/toast.service';
import { CaseContext } from './case-context.service';
import { FilePreviewModalComponent } from './file-preview-modal.component';
import { MediaModalComponent } from './media-modal.component';
import { NarrativeBuilderComponent } from './narrative-builder.component';
import { OtherSubjectsModalComponent } from './other-subjects-modal.component';

@Component({
  selector: 'px-case-shell',
  providers: [CaseContext],
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, NzAvatarModule, NzBreadCrumbModule, NzButtonModule, NzDropDownModule, NzIconModule, NzTagModule,
    MediaModalComponent, NarrativeBuilderComponent, OtherSubjectsModalComponent, FilePreviewModalComponent,
  ],
  template: `
    <div class="casehead">
      <div class="inner">
        <nz-breadcrumb>
          <nz-breadcrumb-item><a routerLink="/">My Case Queue</a></nz-breadcrumb-item>
          <nz-breadcrumb-item>Case #{{ c.id }}</nz-breadcrumb-item>
        </nz-breadcrumb>

        <div class="title-row">
          <div class="title">
            <a routerLink="/" class="back" aria-label="Back to My Case Queue"><nz-icon nzType="arrow-left" /></a>
            <h1>{{ c.id }}</h1>
            @if (ctx.state.approved()) {
              <nz-tag nzColor="green">{{ c.approvedTag }}</nz-tag>
            } @else {
              <nz-tag nzColor="blue">In Progress</nz-tag>
            }
          </div>
          <div class="acts">
            <button nz-button (click)="ctx.mediaOpen.set(true)">Run Media Query</button>
            <button nz-button (click)="ctx.narrativeOpen.set(true)">Narrative Builder</button>
            <button nz-button nzType="primary" nz-dropdown [nzDropdownMenu]="actions" nzTrigger="click" nzPlacement="bottomRight">Case Actions</button>
            <nz-dropdown-menu #actions="nzDropdownMenu">
              <ul nz-menu style="width:220px">
                @for (a of caseActions; track a) {
                  <li nz-menu-item (click)="caseAction(a)">{{ a }}</li>
                }
              </ul>
            </nz-dropdown-menu>
          </div>
        </div>

        <dl class="meta">
          <div><dt>Team · Region</dt><dd>{{ c.team }}</dd></div>
          <div><dt>Assigned Analyst</dt><dd class="analyst"><nz-avatar nzText="AA" nzSize="small" class="av" /> {{ c.analyst }}</dd></div>
          <div><dt>Tier Level</dt><dd>{{ c.tier }}</dd></div>
          <div><dt>Case Created</dt><dd>{{ c.created }}</dd></div>
          <div><dt>Case Risk</dt><dd><nz-tag [nzColor]="riskColor[c.risk]">{{ c.risk }}</nz-tag></dd></div>
          <div><dt>Due Date</dt><dd>{{ c.due }}</dd></div>
          <div><dt>PE Due</dt><dd>{{ c.pe }}</dd></div>
        </dl>

        <nav class="tabs" aria-label="Case sections">
          <a routerLink="overview" routerLinkActive="on"><nz-icon nzType="home" /> Overview</a>
          <a routerLink="transactions" routerLinkActive="on"><nz-icon nzType="swap" /> Transactions</a>
          <a routerLink="attachments" routerLinkActive="on"><nz-icon nzType="paper-clip" /> Attachments</a>
          <a routerLink="log" routerLinkActive="on"><nz-icon nzType="edit" /> Case Log <span class="cnt">{{ logCount() }}</span></a>
        </nav>
      </div>
    </div>

    <main class="page case-page"><router-outlet /></main>

    <footer class="case-footer">
      <span><span class="ver">{{ c.version }}</span> <span class="sep">·</span> <span class="saved">{{ c.lastSaved }}</span></span>
      <button nz-button nzType="link" nzSize="small">Version history</button>
    </footer>

    <px-media-modal />
    <px-narrative-builder />
    <px-other-subjects-modal />
    <px-file-preview-modal />
  `,
  styles: `
    :host { display: block; }
    .casehead { background: #fff; border-bottom: 1px solid #f0f0f0; position: sticky; top: 64px; z-index: 20; box-shadow: 0 2px 6px rgba(0,0,0,.04); }
    .inner { max-width: 1440px; margin: 0 auto; padding: 16px 32px 0; }
    .title-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 12px; flex-wrap: wrap; }
    .title { display: flex; align-items: center; gap: 14px; }
    .title h1 { margin: 0; font-size: 26px; font-weight: 500; font-variant-numeric: tabular-nums; }
    .back { color: rgba(0,0,0,.88); font-size: 20px; display: inline-flex; }
    .acts { display: flex; gap: 8px; }
    .meta { display: flex; gap: 48px; flex-wrap: wrap; margin: 16px 0 4px; }
    .meta dt { font-size: 12px; color: rgba(0,0,0,.45); }
    .meta dd { margin: 4px 0 0; }
    .analyst { display: flex; align-items: center; gap: 8px; }
    .av { background: #ffd8bf; color: #d4380d; }
    .tabs { display: flex; gap: 32px; margin-top: 12px; }
    .tabs a { padding: 12px 0; color: rgba(0,0,0,.88); border-bottom: 2px solid transparent; display: inline-flex; align-items: center; gap: 8px; }
    .tabs a:hover { color: #1677ff; }
    .tabs a.on { color: #1677ff; border-bottom-color: #1677ff; }
    .case-page { padding-bottom: 72px; }
    .case-footer { position: fixed; left: 0; right: 0; bottom: 0; height: 40px; background: #fff; border-top: 1px solid #f0f0f0; display: flex;
      justify-content: space-between; align-items: center; padding: 0 32px; z-index: 30; }
    .ver { color: rgba(0,0,0,.88); }
    .sep, .saved { color: rgba(0,0,0,.45); font-size: 12px; }
    .sep { margin: 0 6px; }
    @media (max-width: 760px) { .casehead { position: static; } .inner { padding: 12px 16px 0; } .meta { gap: 18px; } .title h1 { font-size: 20px; } .tabs { gap: 18px; overflow-x: auto; } }
  `,
})
export class CaseShellComponent {
  readonly ctx = inject(CaseContext);
  private readonly toast = inject(ToastService);
  readonly riskColor = RISK_COLOR;
  readonly caseActions = ['Pend Case', 'Merge Case', 'Reassign Case', 'Refer Case', 'Interdict', 'Flag Case for Review', 'Request Missing Info'];

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
    this.ctx.load(id);
    if (!this.ctx.state) inject(Router).navigate(['/']);
  }

  get c() {
    return this.ctx.data;
  }

  readonly logCount = computed(() => this.ctx.state.log().length);

  caseAction(a: string) {
    this.toast.show(`${a} isn't part of this prototype yet`);
  }
}
