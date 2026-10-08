import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface Notice { title: string; sub: string; ago: string; unread: boolean }

/** Pharos/App Bar: global nav shared by the queue and every case screen. */
@Component({
  selector: 'px-app-bar',
  imports: [RouterLink, NzAvatarModule, NzBadgeModule, NzButtonModule, NzDropDownModule, NzIconModule],
  template: `
    <header class="bar">
      <a class="brand" routerLink="/" aria-label="Beacon home">
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <path d="M6 30 L28 4" stroke="#E8A23B" stroke-width="3" stroke-linecap="round" />
          <circle cx="10" cy="26" r="6" fill="#E8A23B" />
          <path d="M24 6 l4 -2 l-1 4 z" fill="#F6C46A" />
        </svg>
        <span>Beacon</span>
      </a>

      <a class="switcher" nz-dropdown [nzDropdownMenu]="queueMenu" nzTrigger="click">
        My Case Queue <nz-icon nzType="caret-down" />
      </a>
      <nz-dropdown-menu #queueMenu="nzDropdownMenu">
        <ul nz-menu>
          <li nz-menu-item routerLink="/">My Case Queue</li>
          <li nz-menu-item nzDisabled>Team Queue</li>
          <li nz-menu-item nzDisabled>Unassigned</li>
        </ul>
      </nz-dropdown-menu>

      <div class="right">
        <button class="ic" aria-label="Search"><nz-icon nzType="search" /></button>
        <button class="ic" aria-label="Settings"><nz-icon nzType="setting" /></button>
        <button class="ic" aria-label="Notifications" nz-dropdown [nzDropdownMenu]="notif" nzTrigger="click" nzPlacement="bottomRight">
          <nz-badge [nzDot]="unread() > 0"><nz-icon nzType="bell" class="bell" /></nz-badge>
        </button>
        <nz-dropdown-menu #notif="nzDropdownMenu">
          <div class="notif">
            <div class="nh"><strong>Notifications</strong><button nz-button nzType="link" nzSize="small" (click)="markAll()">Mark all as read</button></div>
            @for (n of notices(); track n.title) {
              <div class="ni" [class.unread]="n.unread">
                <span class="dot"></span>
                <div><div class="nt">{{ n.title }}</div><div class="ns">{{ n.sub }}</div></div>
                <span class="na">{{ n.ago }}</span>
              </div>
            }
            <div class="nf"><button nz-button nzType="link" nzSize="small">View all notifications</button></div>
          </div>
        </nz-dropdown-menu>

        <a class="user" nz-dropdown [nzDropdownMenu]="userMenu" nzTrigger="click" nzPlacement="bottomRight">
          <nz-avatar nzText="AA" nzSize="small" class="av" /> <span class="uname">Adam A.</span>
        </a>
        <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item><nz-icon nzType="setting" /> Settings</li>
            <li nz-menu-item><nz-icon nzType="logout" /> Log Out</li>
          </ul>
        </nz-dropdown-menu>
      </div>
    </header>
  `,
  styles: `
    .bar { height: 64px; background: #1f1f1f; color: #fff; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 32px; }
    .brand { display: inline-flex; align-items: center; gap: 10px; color: #fff; font-size: 20px; font-weight: 600; width: fit-content; }
    .switcher { color: #fff; display: inline-flex; gap: 8px; align-items: center; cursor: pointer; }
    .right { display: flex; justify-content: flex-end; align-items: center; gap: 6px; }
    .ic { background: none; border: 0; color: #fff; width: 36px; height: 36px; border-radius: 6px; cursor: pointer; font-size: 17px; display: grid; place-items: center; }
    .ic:hover, .switcher:hover, .user:hover { background: rgba(255,255,255,.08); }
    .bell { color: #fff; font-size: 17px; }
    .user { display: inline-flex; align-items: center; gap: 8px; color: #fff; padding: 4px 8px; border-radius: 6px; margin-left: 6px; }
    .av { background: #ffd8bf; color: #d4380d; }
    .notif { width: 380px; background: #fff; border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,.12); padding: 8px 0; }
    .nh, .nf { display: flex; justify-content: space-between; align-items: center; padding: 6px 16px; }
    .nf { justify-content: center; border-top: 1px solid #f0f0f0; }
    .ni { display: grid; grid-template-columns: 10px 1fr auto; gap: 10px; padding: 10px 16px; cursor: pointer; }
    .ni:hover { background: #f5f5f5; }
    .dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 7px; background: transparent; }
    .ni.unread .dot { background: #1677ff; }
    .nt { font-weight: 500; }
    .ns, .na { font-size: 12px; color: rgba(0,0,0,.45); }
    @media (max-width: 760px) { .bar { grid-template-columns: auto 1fr; padding: 0 16px; } .switcher { display: none; } .uname { display: none; } }
  `,
})
export class AppBarComponent {
  readonly notices = signal<Notice[]>([
    { title: 'New case assigned: C2608060764519583', sub: 'Child exploitation rule · US Advanced', ago: '5 min ago', unread: true },
    { title: 'SLA reminder: 3 cases due within 5 days', sub: 'Earliest due date is 2026-09-25', ago: '1 hour ago', unread: true },
    { title: 'Case C2608060764518371 returned from QA', sub: 'Reviewer K. Torres left 2 comments', ago: 'Yesterday', unread: false },
    { title: 'Watchlist update: OFAC SDN list refreshed', sub: 'Screening results re-run overnight, no new matches', ago: 'Yesterday', unread: false },
    { title: 'Scheduled maintenance: Sat 2026-10-03', sub: '02:00–04:00 UTC · Pharos will be read-only', ago: '2 days ago', unread: false },
  ]);
  readonly unread = () => this.notices().filter((n) => n.unread).length;

  markAll() {
    this.notices.update((l) => l.map((n) => ({ ...n, unread: false })));
  }
}
