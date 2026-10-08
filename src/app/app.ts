import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBarComponent } from './layout/app-bar.component';
import { ToastsComponent } from './shared/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppBarComponent, ToastsComponent],
  template: `
    <px-app-bar class="appbar" />
    <router-outlet />
    <px-toasts />
  `,
  styles: `.appbar { display: block; position: sticky; top: 0; z-index: 40; }`,
})
export class App {}
