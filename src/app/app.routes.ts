import { Routes } from '@angular/router';
import { AttachmentsComponent } from './case/attachments.component';
import { CaseLogComponent } from './case/case-log.component';
import { CaseShellComponent } from './case/case-shell.component';
import { OverviewComponent } from './case/overview.component';
import { TransactionsComponent } from './case/transactions.component';
import { QueueComponent } from './queue/queue.component';

export const routes: Routes = [
  { path: '', component: QueueComponent, title: 'My Case Queue · Pharos' },
  {
    path: 'case/:id',
    component: CaseShellComponent,
    title: 'Case · Pharos',
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'attachments', component: AttachmentsComponent },
      { path: 'log', component: CaseLogComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
