import { Component, computed, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ToastService } from '../shared/toast.service';
import { CaseContext } from './case-context.service';

interface View { title: string; tag: string; kind: string; file: string; fmeta: string; ftype: string; size: string; date: string; by: string; desc: string; ev?: boolean; from?: string }

/** File Preview for case attachments and related case attachments. Documents are placeholders. */
@Component({
  selector: 'px-file-preview-modal',
  imports: [NzButtonModule, NzIconModule, NzModalModule, NzTagModule],
  template: `
    <nz-modal [nzVisible]="!!v()" (nzOnCancel)="ctx.preview.set(null)" [nzWidth]="1000" nzCentered [nzTitle]="'File Preview'" [nzFooter]="foot">
      <ng-container *nzModalContent>
        @if (v(); as f) {
          <div class="wrap">
            <div class="doc" [class.img]="f.kind === 'image'">
              <nz-icon [nzType]="icon(f.kind)" class="big" />
              <div class="fn">{{ f.file }}</div>
              <div class="fm">{{ f.fmeta }}</div>
              @if (f.kind !== 'image') {
                <div class="lines">@for (i of [1,2,3,4,5,6,7,8]; track i) { <span [style.width.%]="60 + (i * 37) % 40"></span> }</div>
              }
              <div class="ph">Preview placeholder</div>
            </div>
            <aside>
              <h3>{{ f.title }}</h3>
              <div class="tags"><nz-tag>{{ f.tag }}</nz-tag>@if (f.ev) { <nz-tag nzColor="blue">Evidence</nz-tag> }</div>
              <dl>
                @if (f.from) { <dt>Related case</dt><dd>{{ f.from }}</dd> }
                <dt>File name</dt><dd>{{ f.file }}</dd>
                <dt>File type</dt><dd>{{ f.ftype }}</dd>
                <dt>Size</dt><dd>{{ f.size }}</dd>
                <dt>Uploaded</dt><dd>{{ f.date }}</dd>
                <dt>Uploaded by</dt><dd>{{ f.by }}</dd>
              </dl>
              <h5>Description</h5>
              <p>{{ f.desc }}</p>
            </aside>
          </div>
        }
      </ng-container>
      <ng-template #foot>
        <button nz-button (click)="ctx.preview.set(null)">Close</button>
        <button nz-button nzType="primary" (click)="download()"><nz-icon nzType="download" /> Download</button>
      </ng-template>
    </nz-modal>
  `,
  styles: `
    .wrap { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
    .doc { background: #f5f5f5; border-radius: 8px; min-height: 440px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 24px; }
    .doc.img { background: repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 12px, #efefef 12px, #efefef 24px); }
    .big { font-size: 48px; color: #1677ff; }
    .fn { font-weight: 500; }
    .fm, .ph { color: rgba(0,0,0,.45); font-size: 12px; }
    .lines { width: 70%; display: grid; gap: 8px; margin: 18px 0; }
    .lines span { height: 8px; background: #e0e0e0; border-radius: 4px; }
    aside h3 { margin: 0 0 8px; font-size: 18px; font-weight: 500; }
    .tags { margin-bottom: 12px; }
    dl { display: grid; grid-template-columns: 110px 1fr; gap: 8px; margin: 0; }
    dt { color: rgba(0,0,0,.45); }
    dd { margin: 0; word-break: break-all; }
    h5 { font-size: 14px; font-weight: 600; margin: 16px 0 6px; }
    @media (max-width: 900px) { .wrap { grid-template-columns: 1fr; } }
  `,
})
export class FilePreviewModalComponent {
  readonly ctx = inject(CaseContext);
  private readonly toast = inject(ToastService);

  readonly v = computed<View | null>(() => {
    const p = this.ctx.preview();
    if (!p) return null;
    if (p.kind === 'related') return { ...p.file, from: p.caseId };
    const a = p.file;
    const ext = a.file.split('.').pop()!.toUpperCase();
    const ftype = a.kind === 'image' ? `${ext === 'JPG' ? 'JPEG' : ext} Image (.${ext.toLowerCase()})` : a.kind === 'xlsx' ? `Spreadsheet (.${ext.toLowerCase()})` : `${ext} Document (.${ext.toLowerCase()})`;
    return {
      title: a.name, tag: a.cat, kind: a.kind, file: a.file, ftype, size: a.size, date: a.uploaded, by: a.by, desc: a.desc, ev: a.ev,
      fmeta: a.pages ? `Secure PDF Document • ${a.pages} Page${a.pages === 1 ? '' : 's'}` : ftype,
    };
  });

  icon(kind: string) {
    return kind === 'image' ? 'file-image' : kind === 'xlsx' ? 'file-excel' : kind === 'word' ? 'file-word' : 'file-pdf';
  }

  download() {
    this.toast.show(`${this.v()!.file} downloaded`);
  }
}
