import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { Attachment, RelatedFile } from '../data/models';
import { CaseStore } from '../state/case-store.service';
import { ToastService } from '../shared/toast.service';
import { CaseContext } from './case-context.service';

const TYPES: Record<string, { label: string; kind: string }> = {
  pdf: { label: 'PDF', kind: 'pdf' }, image: { label: 'Image', kind: 'image' }, xlsx: { label: 'Spreadsheet', kind: 'xlsx' }, word: { label: 'Word', kind: 'word' },
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parseUp = (s: string) => {
  const m = s.match(/(\w{3}) (\d+), (\d{4}) · (\d+):(\d+)/);
  return m ? new Date(+m[3], MONTHS.indexOf(m[1]), +m[2], +m[4], +m[5]).getTime() : 0;
};

@Component({
  selector: 'px-attachments',
  imports: [FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzRadioModule, NzSelectModule, NzTagModule, NzUploadModule],
  template: `
    <div class="cols">
      <section class="card">
        <div class="card-h">
          <h3>Case Attachments <span class="cnt">{{ ctx.state.attachments().length }}</span></h3>
          <div class="acts">
            <span class="m">Sort</span>
            <nz-select [ngModel]="sort()" (ngModelChange)="sort.set($event)" style="width:170px">
              <nz-option nzValue="new" nzLabel="Newest–Oldest" />
              <nz-option nzValue="old" nzLabel="Oldest–Newest" />
              <nz-option nzValue="name" nzLabel="Name (A–Z)" />
            </nz-select>
            <button nz-button nzType="primary" (click)="openAdd()"><nz-icon nzType="plus" /> Add Attachment</button>
          </div>
        </div>
        <ul class="files">
          @for (a of sorted(); track a.id) {
            <li tabindex="0" (click)="ctx.preview.set({ kind: 'case', file: a })" (keydown.enter)="ctx.preview.set({ kind: 'case', file: a })">
              <span class="ic" [class]="'ic ' + a.kind"><nz-icon [nzType]="icon(a.kind)" /></span>
              <div class="body">
                <div class="t"><span class="n">{{ a.name }}</span><nz-tag>{{ a.cat }}</nz-tag>@if (a.ev) { <nz-tag nzColor="blue">Evidence</nz-tag> }</div>
                <div class="d">{{ a.desc }}</div>
                <div class="m">{{ a.file }} · {{ a.size }} · Uploaded {{ a.uploaded }} by {{ a.by }}</div>
              </div>
              <nz-icon nzType="eye" class="eye" />
            </li>
          }
        </ul>
      </section>

      <section class="card side">
        <div class="card-h"><h3>Related Case Attachments <span class="cnt">{{ relatedCount }}</span></h3></div>
        @for (g of ctx.data.relatedFiles; track g.id) {
          <div class="grp">
            <div class="gh"><span class="gid">{{ g.id }}</span><span class="m">{{ g.meta }}</span></div>
            <ul class="files sm">
              @for (f of g.files; track f.file) {
                <li tabindex="0" (click)="previewRel(f, g.id)" (keydown.enter)="previewRel(f, g.id)">
                  <span [class]="'ic ' + f.kind"><nz-icon [nzType]="icon(f.kind)" /></span>
                  <div class="body"><div class="t"><span class="n">{{ f.title }}</span><nz-tag>{{ f.tag }}</nz-tag></div><div class="m">{{ f.size }} · {{ f.date }}</div></div>
                </li>
              }
            </ul>
          </div>
        } @empty {
          <p class="m">No attachments on related cases.</p>
        }
      </section>
    </div>

    <nz-modal [nzVisible]="addOpen()" (nzOnCancel)="addOpen.set(false)" [nzTitle]="'Add Attachment'" [nzFooter]="foot" [nzWidth]="560">
      <ng-container *nzModalContent>
        <nz-upload nzType="drag" [nzBeforeUpload]="beforeUpload" [nzShowUploadList]="false">
          <p class="ant-upload-drag-icon"><nz-icon nzType="inbox" /></p>
          @if (draft.file) { <p class="ant-upload-text">{{ draft.file }}</p><p class="ant-upload-hint">Click or drag to replace</p> }
          @else { <p class="ant-upload-text">Click or drag a file to this area to upload</p><p class="ant-upload-hint">PDF, image, spreadsheet or Word file. Files stay in your browser.</p> }
        </nz-upload>
        <div class="f"><label>Attachment name <span class="req">*</span></label><input nz-input [(ngModel)]="draft.name" placeholder="e.g. Receiver ID Images" /></div>
        <div class="f"><label>File type <span class="req">*</span></label>
          <nz-select [(ngModel)]="draft.type" nzPlaceHolder="Select file type" style="width:100%">
            @for (t of typeKeys; track t) { <nz-option [nzValue]="t" [nzLabel]="types[t].label" /> }
          </nz-select>
          <div class="help">The icon comes from the file type.</div>
        </div>
        <div class="f"><label>Is this evidence?</label>
          <nz-radio-group [(ngModel)]="draft.ev"><label nz-radio [nzValue]="true">Yes</label><label nz-radio [nzValue]="false">No</label></nz-radio-group>
        </div>
        <div class="f"><label>Short description</label>
          <textarea nz-input rows="3" maxlength="200" [(ngModel)]="draft.desc"></textarea>
          <div class="help right">{{ draft.desc.length }} / 200</div>
        </div>
      </ng-container>
      <ng-template #foot>
        <button nz-button (click)="addOpen.set(false)">Cancel</button>
        <button nz-button nzType="primary" [disabled]="!draft.name.trim() || !draft.type" (click)="add()">Add attachment</button>
      </ng-template>
    </nz-modal>
  `,
  styles: `
    .cols { display: grid; grid-template-columns: minmax(0, 1fr) 441px; gap: 24px; align-items: start; }
    .acts { display: flex; gap: 8px; align-items: center; }
    .m { font-size: 12px; color: rgba(0,0,0,.45); }
    .files { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
    .files li { display: flex; gap: 14px; align-items: flex-start; border: 1px solid #f0f0f0; border-radius: 8px; padding: 14px 16px; cursor: pointer; }
    .files li:hover { border-color: #1677ff; }
    .files.sm li { padding: 10px 12px; gap: 10px; }
    .ic { width: 36px; height: 36px; border-radius: 8px; display: grid; place-items: center; font-size: 18px; flex: none; background: #fff1f0; color: #cf1322; }
    .ic.image { background: #f9f0ff; color: #722ed1; }
    .ic.xlsx { background: #f6ffed; color: #389e0d; }
    .ic.word { background: #e6f4ff; color: #0958d9; }
    .body { flex: 1; min-width: 0; }
    .t { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .n { font-weight: 500; margin-right: 4px; }
    .d { margin: 4px 0; color: rgba(0,0,0,.75); }
    .eye { color: rgba(0,0,0,.25); margin-top: 10px; }
    .grp + .grp { margin-top: 16px; }
    .gh { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .gid { font-weight: 600; }
    .f { margin-top: 16px; }
    .f > label { display: block; font-weight: 500; margin-bottom: 6px; }
    .req { color: #ff4d4f; }
    .help { color: rgba(0,0,0,.45); font-size: 12px; margin-top: 4px; }
    .right { text-align: right; }
    @media (max-width: 1100px) { .cols { grid-template-columns: 1fr; } }
  `,
})
export class AttachmentsComponent {
  readonly ctx = inject(CaseContext);
  private readonly store = inject(CaseStore);
  private readonly toast = inject(ToastService);
  readonly types = TYPES;
  readonly typeKeys = Object.keys(TYPES);
  readonly sort = signal<'new' | 'old' | 'name'>('new');
  readonly addOpen = signal(false);
  draft = { file: '', size: '', name: '', type: null as string | null, ev: false, desc: '' };

  get relatedCount() { return this.ctx.data.relatedFiles.reduce((a, g) => a + g.files.length, 0); }

  readonly sorted = computed(() => {
    const l = [...this.ctx.state.attachments()];
    const s = this.sort();
    if (s === 'name') return l.sort((a, b) => a.name.localeCompare(b.name));
    return l.sort((a, b) => (s === 'new' ? -1 : 1) * (parseUp(a.uploaded) - parseUp(b.uploaded)));
  });

  icon(kind: string) {
    return kind === 'image' ? 'file-image' : kind === 'xlsx' ? 'file-excel' : kind === 'word' ? 'file-word' : 'file-pdf';
  }

  previewRel(file: RelatedFile, caseId: string) {
    this.ctx.preview.set({ kind: 'related', file, caseId });
  }

  openAdd() {
    this.draft = { file: '', size: '', name: '', type: null, ev: false, desc: '' };
    this.addOpen.set(true);
  }

  beforeUpload = (f: NzUploadFile): boolean => {
    const size = f.size ?? 0;
    this.draft.file = f.name;
    this.draft.size = size > 1e6 ? (size / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(size / 1e3)) + ' KB';
    if (!this.draft.name) this.draft.name = f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    const ext = f.name.split('.').pop()!.toLowerCase();
    this.draft.type = ext === 'pdf' ? 'pdf' : ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) ? 'image' : ['xlsx', 'xls', 'csv'].includes(ext) ? 'xlsx' : ['doc', 'docx'].includes(ext) ? 'word' : this.draft.type;
    return false;
  };

  add() {
    const d = this.draft;
    const now = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const ext = d.type === 'image' ? 'png' : d.type === 'xlsx' ? 'xlsx' : d.type === 'word' ? 'docx' : 'pdf';
    const a: Attachment = {
      id: 'u' + Date.now(), name: d.name.trim(), file: d.file || d.name.trim().replace(/\s+/g, '_') + '.' + ext, cat: d.ev ? 'Evidence' : 'Supporting',
      kind: TYPES[d.type!].kind, desc: d.desc || 'No description provided.', size: d.size || '—',
      uploaded: `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} · ${p(now.getHours())}:${p(now.getMinutes())}`, by: 'Adam A.', ev: d.ev,
    };
    this.ctx.state.attachments.update((l) => [a, ...l]);
    this.store.addLog(this.ctx.data.id, { type: 'Attachment Added', who: 'Adam A.', text: `Attachment added: ${a.name} (${a.file}).` });
    this.toast.show('Attachment added');
    this.addOpen.set(false);
  }
}
