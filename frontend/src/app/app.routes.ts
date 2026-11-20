import { Routes } from '@angular/router';
import { LABELS } from './core/constants';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { BudgetsComponent } from './features/budgets/budgets.component';
import { SettingsComponent } from './features/settings/settings.component';
import { TransactionFormComponent } from './features/transactions/transaction-form.component';
import { TransactionListComponent } from './features/transactions/transaction-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: LABELS.login },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent, title: LABELS.dashboard },
      { path: 'transactions', component: TransactionListComponent, title: LABELS.transactions },
      {
        path: 'transactions/new',
        component: TransactionFormComponent,
        title: LABELS.newTransaction,
      },
      {
        path: 'transactions/:id/edit',
        component: TransactionFormComponent,
        title: LABELS.editTransaction,
      },
      { path: 'categories', component: CategoriesComponent, title: LABELS.categories },
      { path: 'budgets', component: BudgetsComponent, title: LABELS.budgets },
      { path: 'settings', component: SettingsComponent, title: LABELS.settings },
    ],
  },
  { path: '**', redirectTo: '' },
];
