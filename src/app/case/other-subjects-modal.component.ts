import { Component, inject } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { initials } from '../state/case-store.service';
import { ScreeningComponent } from '../shared/screening.component';
import { CaseContext } from './case-context.service';

/** Other Subjects: every counterparty in a list, with the selected profile beside it. */
@Component({
  selector: 'px-other-subjects-modal',
  imports: [NzAvatarModule, NzIconModule, NzModalModule, NzTagModule, NzTooltipModule, ScreeningComponent],
  template: `
    <nz-modal [nzVisible]="ctx.subjectsOpen()" (nzOnCancel)="ctx.subjectsOpen.set(false)" [nzFooter]="null" [nzWidth]="1120" nzCentered [nzTitle]="title">
      <ng-template #title>Other Subjects <span class="cnt">{{ ctx.data.others.length }}</span></ng-template>
      <ng-container *nzModalContent>
        @if (ctx.subject(); as s) {
          <div class="wrap">
            <ul class="list">
              @for (o of ctx.data.others; track o.gid) {
                <li [class.on]="o.gid === s.gid" tabindex="0" (click)="ctx.subject.set(o)" (keydown.enter)="ctx.subject.set(o)">
                  <nz-avatar [nzText]="ini(o.name)" class="av" />
                  <div><div class="n">{{ o.name }}</div><div class="m">{{ o.short }} · {{ o.loc }}</div></div>
                </li>
              }
            </ul>
            <section class="detail">
              <div class="who">
                <nz-avatar [nzText]="ini(s.name)" nzSize="large" class="av" />
                <div><h3>{{ s.name }}</h3><div class="m">GID {{ s.gid }} · {{ s.cc }}</div></div>
              </div>
              <h5>Profile</h5>
              <dl class="grid">
                <div><dt>Date of birth</dt><dd>{{ s.dob }}</dd></div>
                <div><dt>Customer since</dt><dd>{{ s.since }}</dd></div>
                <div><dt>UMN</dt><dd>{{ s.umn }}</dd></div>
                <div><dt>Occupation</dt><dd>{{ s.occupation }}</dd></div>
                <div><dt>Phone</dt><dd>{{ s.phone }}</dd></div>
                <div><dt>Email</dt><dd>{{ s.email }}</dd></div>
              </dl>
              <h5>Address</h5>
              <div class="addr">
                {{ s.address }}
                @if (s.addressWarn) {
                  <nz-icon nzType="warning" nzTheme="fill" class="warn" nz-tooltip [nzTooltipTitle]="s.addressWarn" nzTooltipOverlayClassName="px-tip" tabindex="0" />
                }
              </div>
              <px-screening [data]="s.screening" />
            </section>
          </div>
        }
      </ng-container>
    </nz-modal>
  `,
  styles: `
    .wrap { display: grid; grid-template-columns: 300px 1fr; gap: 20px; min-height: 420px; }
    .list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; align-content: start; max-height: 62vh; overflow: auto; }
    .list li { display: flex; gap: 10px; align-items: center; border: 1px solid #f0f0f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; }
    .list li:hover { border-color: #1677ff; }
    .list li.on { border-color: #1677ff; background: #e6f4ff; }
    .av { background: #e6f4ff; color: #1677ff; flex: none; }
    .n { font-weight: 500; }
    .m { font-size: 12px; color: rgba(0,0,0,.45); }
    .detail { border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px 24px; }
    .who { display: flex; gap: 12px; align-items: center; }
    .who h3 { margin: 0; font-size: 18px; font-weight: 500; }
    h5 { font-size: 14px; font-weight: 600; margin: 20px 0 8px; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 24px; margin: 0; }
    dt { color: rgba(0,0,0,.45); font-size: 12px; }
    dd { margin: 2px 0 0; }
    .addr { display: flex; gap: 8px; align-items: center; }
    .warn { color: #fa8c16; cursor: help; }
    @media (max-width: 900px) { .wrap { grid-template-columns: 1fr; } .grid { grid-template-columns: 1fr 1fr; } }
  `,
})
export class OtherSubjectsModalComponent {
  readonly ctx = inject(CaseContext);
  readonly ini = initials;
}
