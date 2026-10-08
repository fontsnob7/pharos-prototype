import { Component, input } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ScreeningResult } from '../data/models';

/** Screening block (Sanctions, PEP, Interdiction, Adverse media) with grey default tags. */
@Component({
  selector: 'px-screening',
  imports: [NzTagModule],
  template: `
    <h5>Screening</h5>
    <dl class="scr">
      @for (r of rows(); track r[0]) {
        <div>
          <dt>{{ r[0] }}</dt>
          <dd><nz-tag>{{ r[1][0] }}</nz-tag><span class="d">{{ r[1][1] }}</span></dd>
        </div>
      }
    </dl>
  `,
  styles: `
    h5 { font-size: 14px; font-weight: 600; margin: 16px 0 8px; }
    .scr { display: grid; gap: 8px; margin: 0; }
    .scr > div { display: grid; grid-template-columns: 120px 1fr; gap: 12px; align-items: baseline; }
    dt { color: rgba(0,0,0,.45); }
    dd { margin: 0; display: flex; gap: 4px; align-items: baseline; flex-wrap: wrap; }
    .d { color: rgba(0,0,0,.65); font-size: 13px; }
  `,
})
export class ScreeningComponent {
  readonly data = input.required<ScreeningResult>();
  rows(): [string, [string, string]][] {
    const s = this.data();
    return [['Sanctions', s.sanctions], ['PEP', s.pep], ['Interdiction', s.interdiction], ['Adverse media', s.media]];
  }
}
