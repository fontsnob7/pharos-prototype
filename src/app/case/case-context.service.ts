import { Injectable, inject, signal } from '@angular/core';
import { Attachment, OtherSubject, RelatedFile } from '../data/models';
import { CaseState, CaseStore } from '../state/case-store.service';

export type PreviewFile = { kind: 'case'; file: Attachment } | { kind: 'related'; file: RelatedFile; caseId: string };

/** Per-case UI state shared by the case header, the tabs and the overlays. Provided by CaseShellComponent. */
@Injectable()
export class CaseContext {
  private readonly store = inject(CaseStore);
  state!: CaseState;

  readonly mediaOpen = signal(false);
  readonly narrativeOpen = signal(false);
  readonly subjectsOpen = signal(false);
  readonly subject = signal<OtherSubject | null>(null);
  readonly preview = signal<PreviewFile | null>(null);

  load(id: string) {
    this.state = this.store.get(id)!;
  }

  get data() {
    return this.state.data;
  }

  openSubjects(s?: OtherSubject) {
    this.subject.set(s ?? this.data.others[0]);
    this.subjectsOpen.set(true);
  }
}
