import { Component, Injectable, inject, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface Toast {
  id: number;
  text: string;
}

/** Dark, bottom-left confirmation toast used across the prototype (Pharos/Toast). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  show(text: string, ms = 2500) {
    const id = ++this.seq;
    this.toasts.update((t) => [...t, { id, text }]);
    setTimeout(() => this.toasts.update((t) => t.filter((x) => x.id !== id)), ms);
  }
}

@Component({
  selector: 'px-toasts',
  imports: [NzIconModule],
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of svc.toasts(); track t.id) {
        <div class="toast" role="status"><nz-icon nzType="check-circle" nzTheme="fill" /> {{ t.text }}</div>
      }
    </div>
  `,
  styles: `
    .toasts { position: fixed; left: 24px; bottom: 64px; display: grid; gap: 8px; z-index: 2000; }
    .toast { background: #1f1f1f; color: #fff; padding: 10px 16px; border-radius: 8px; display: flex; align-items: center; gap: 10px;
      box-shadow: 0 6px 16px rgba(0,0,0,.18); font-size: 14px; animation: in .2s ease-out; }
    .toast nz-icon { color: #52c41a; }
    @keyframes in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  `,
})
export class ToastsComponent {
  readonly svc = inject(ToastService);
}
