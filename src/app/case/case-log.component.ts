import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { CaseStore } from '../state/case-store.service';
import { ToastService } from '../shared/toast.service';
import { CaseContext } from './case-context.service';

const ICON: Record<string, [string, string]> = {
  'Note Added': ['edit', '#1677ff'], 'Case Created': ['plus-circle', '#52c41a'], Assignment: ['user', '#722ed1'], Review: ['eye', '#fa8c16'],
  System: ['setting', '#8c8c8c'], Transaction: ['swap', '#13c2c2'], 'Attachment Added': ['paper-clip', '#2f54eb'], 'Narrative Approved': ['check-circle', '#52c41a'],
};

@Component({
  selector: 'px-case-log',
  imports: [FormsModule, NzAvatarModule, NzButtonModule, NzIconModule, NzInputModule, NzTimelineModule],
  template: `
    <div class="cols">
      <section class="card">
        <div class="card-h"><h3>Case Log <span class="cnt">{{ ctx.state.log().length }}</span></h3></div>
        <nz-timeline>
          @for (e of ctx.state.log(); track e.id) {
            <nz-timeline-item [nzDot]="dot" [nzColor]="icon(e.type)[1]">
              <ng-template #dot><nz-icon [nzType]="icon(e.type)[0]" [style.color]="icon(e.type)[1]" /></ng-template>
              <div class="eh"><strong>{{ e.type }}</strong><span class="m">{{ e.ts }}@if (e.who) { · {{ e.who }} }</span></div>
              <p [class.note]="e.note || e.type === 'Note Added'">{{ e.text }}</p>
            </nz-timeline-item>
          }
        </nz-timeline>
      </section>

      <section class="card side">
        <div class="card-h"><h3>Case Notes</h3></div>
        <div class="who"><nz-avatar nzText="AA" nzSize="small" class="av" /> Adam A.</div>
        <label class="lbl" for="note">Note</label>
        <textarea id="note" nz-input rows="6" maxlength="500" placeholder="Add a note to the case log" [ngModel]="draft()" (ngModelChange)="draft.set($event)"></textarea>
        <div class="help">{{ draft().length }} / 500 characters</div>
        <div class="acts">
          <button nz-button (click)="draft.set('')" [disabled]="!draft()">Clear</button>
          <button nz-button nzType="primary" (click)="add()" [disabled]="!draft().trim()">Add Note</button>
        </div>
      </section>
    </div>
  `,
  styles: `
    .cols { display: grid; grid-template-columns: minmax(0, 1fr) 441px; gap: 24px; align-items: start; }
    .side { position: sticky; top: 300px; }
    .eh { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
    .m { font-size: 12px; color: rgba(0,0,0,.45); }
    p { margin: 4px 0 0; color: rgba(0,0,0,.75); }
    p.note { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; padding: 8px 12px; }
    .who { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
    .av { background: #ffd8bf; color: #d4380d; }
    .lbl { display: block; font-weight: 500; margin-bottom: 6px; }
    .help { color: rgba(0,0,0,.45); font-size: 12px; margin-top: 4px; }
    .acts { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    @media (max-width: 1100px) { .cols { grid-template-columns: 1fr; } .side { position: static; } }
  `,
})
export class CaseLogComponent {
  readonly ctx = inject(CaseContext);
  private readonly store = inject(CaseStore);
  private readonly toast = inject(ToastService);
  readonly draft = signal('');

  icon(t: string) { return ICON[t] ?? ['info-circle', '#8c8c8c']; }

  add() {
    this.store.addLog(this.ctx.data.id, { type: 'Note Added', who: 'Adam A.', note: true, text: this.draft().trim() });
    this.draft.set('');
    this.toast.show('Note added to Case Log');
  }
}
