import { Component, computed, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { MediaResult } from '../data/models';
import { CaseContext } from './case-context.service';

/** Media Query Results: result list on the left, the selected result on the right. */
@Component({
  selector: 'px-media-modal',
  imports: [NzButtonModule, NzIconModule, NzModalModule, NzProgressModule, NzTagModule],
  template: `
    <nz-modal [nzVisible]="ctx.mediaOpen()" (nzOnCancel)="ctx.mediaOpen.set(false)" [nzFooter]="null" [nzWidth]="1120" [nzTitle]="title" nzCentered>
      <ng-template #title>Media Query Results <span class="cnt">{{ items.length }}</span>
        <span class="sub">{{ ctx.data.primary.name }} and {{ ctx.data.others.length }} counterpart{{ ctx.data.others.length === 1 ? 'y' : 'ies' }} · ran just now</span>
      </ng-template>
      <ng-container *nzModalContent>
        <div class="wrap">
          <ul class="list">
            @for (m of items; track m.id) {
              <li [class.on]="sel().id === m.id" (click)="pick(m)" (keydown.enter)="pick(m)" tabindex="0">
                <div class="top"><nz-tag>{{ m.kind }}</nz-tag><span class="src">{{ m.src }}</span><span class="ago">{{ m.ago }}</span></div>
                <div class="head">{{ m.head }}</div>
                <div class="rel">Relevance <strong [style.color]="relColor(m.rel)">{{ m.rel }}%</strong></div>
              </li>
            }
          </ul>
          <article class="detail">
            <div class="top"><nz-tag>{{ sel().kind }}</nz-tag><span class="src">{{ sel().src }}</span></div>
            <h3>{{ sel().head }}</h3>
            <div class="date">{{ sel().date }}</div>
            <div class="relbox">
              <span>Relevance to case</span>
              <nz-progress [nzPercent]="sel().rel" nzSize="small" [nzStrokeColor]="relColor(sel().rel)" />
            </div>
            <h4>Summary</h4>
            <p>{{ sel().sum }}</p>
            <h4>Source</h4>
            <a [href]="sel().url" target="_blank" rel="noopener" (click)="$event.preventDefault()">{{ sel().url }} <nz-icon nzType="export" /></a>
            <p class="note">Results are simulated for the prototype; links do not open.</p>
          </article>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: `
    .sub { font-weight: 400; color: rgba(0,0,0,.45); font-size: 13px; margin-left: 10px; }
    .wrap { display: grid; grid-template-columns: 380px 1fr; gap: 20px; min-height: 420px; }
    .list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; align-content: start; max-height: 60vh; overflow: auto; }
    .list li { border: 1px solid #f0f0f0; border-radius: 8px; padding: 12px; cursor: pointer; }
    .list li:hover { border-color: #1677ff; }
    .list li.on { border-color: #1677ff; background: #e6f4ff; }
    .top { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .src { color: rgba(0,0,0,.65); }
    .ago { margin-left: auto; color: rgba(0,0,0,.45); }
    .head { font-weight: 500; margin: 6px 0 4px; }
    .rel { font-size: 12px; color: rgba(0,0,0,.45); }
    .detail { border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px; }
    .detail h3 { font-size: 18px; margin: 10px 0 4px; font-weight: 500; }
    .date { color: rgba(0,0,0,.45); font-size: 12px; }
    .relbox { margin: 16px 0; max-width: 360px; font-size: 12px; color: rgba(0,0,0,.45); }
    h4 { margin: 16px 0 6px; font-size: 14px; }
    .note { color: rgba(0,0,0,.45); font-size: 12px; margin-top: 20px; }
    @media (max-width: 900px) { .wrap { grid-template-columns: 1fr; } }
  `,
})
export class MediaModalComponent {
  readonly ctx = inject(CaseContext);
  private readonly picked = signal<MediaResult | null>(null);
  get items() { return this.ctx.data.media; }
  readonly sel = computed(() => this.picked() ?? this.items[0]);
  pick(m: MediaResult) { this.picked.set(m); }
  relColor(r: number) { return r >= 60 ? '#fa8c16' : r >= 20 ? '#1677ff' : '#8c8c8c'; }
}
