import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LABELS } from './core/constants';
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast.component';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly labels = LABELS;
  readonly navLinks: NavLink[] = [
    { path: '/', label: LABELS.dashboard, icon: '▦', exact: true },
    { path: '/transactions', label: LABELS.transactions, icon: '↔' },
    { path: '/categories', label: LABELS.categories, icon: '◈' },
    { path: '/budgets', label: LABELS.budgets, icon: '▤' },
    { path: '/settings', label: LABELS.settings, icon: '⚙' },
  ];

  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  get isLoginPage(): boolean {
    return this.router.url.startsWith('/login');
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
