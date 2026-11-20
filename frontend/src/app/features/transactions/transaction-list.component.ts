import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { CURRENCY, LABELS, MESSAGES, MONTHS_AR, PAGE_SIZE } from '../../core/constants';
import { Category } from '../../core/models/category.model';
import { Transaction, TransactionQuery, TransactionType } from '../../core/models/transaction.model';
import { User } from '../../core/models/user.model';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { TransactionService } from '../../core/services/transaction.service';
import { UserService } from '../../core/services/user.service';
import { ConfirmComponent } from '../../shared/components/confirm.component';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingComponent, ConfirmComponent],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
})
export class TransactionListComponent implements OnInit {
  readonly labels = LABELS;
  readonly months = MONTHS_AR;
  readonly currency = CURRENCY;

  month: number | '' = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  type: TransactionType | '' = '';
  categoryId = '';
  paidBy = '';
  q = '';

  years: number[] = [];
  categories: Category[] = [];
  users: User[] = [];
  items: Transaction[] = [];
  total = 0;
  page = 1;
  loading = false;

  confirmVisible = false;
  pendingDelete: Transaction | null = null;

  private readonly transactionService = inject(TransactionService);
  private readonly categoryService = inject(CategoryService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const current = new Date().getFullYear();
    this.years = Array.from({ length: 6 }, (_, index) => current - index);

    forkJoin({
      categories: this.categoryService.getCategories(),
      users: this.userService.getUsers(),
    }).subscribe({
      next: ({ categories, users }) => {
        this.categories = categories;
        this.users = users;
      },
    });

    this.load(true);
  }

  get canLoadMore(): boolean {
    return this.items.length < this.total;
  }

  get filteredCategories(): Category[] {
    return this.type ? this.categories.filter((category) => category.type === this.type) : this.categories;
  }

  applyFilters(): void {
    this.load(true);
  }

  loadMore(): void {
    if (!this.canLoadMore || this.loading) return;
    this.page += 1;
    this.load(false);
  }

  edit(transaction: Transaction): void {
    this.transactionService.remember(transaction);
    void this.router.navigate(['/transactions', transaction._id, 'edit'], {
      state: { transaction },
    });
  }

  requestDelete(transaction: Transaction): void {
    this.pendingDelete = transaction;
    this.confirmVisible = true;
  }

  confirmDelete(): void {
    const target = this.pendingDelete;
    this.confirmVisible = false;
    this.pendingDelete = null;
    if (!target) return;

    this.transactionService.delete(target._id).subscribe({
      next: () => {
        this.items = this.items.filter((item) => item._id !== target._id);
        this.total = Math.max(0, this.total - 1);
        this.toast.success(MESSAGES.deleteSuccess);
      },
      error: () => this.toast.error(MESSAGES.deleteFailed),
    });
  }

  exportCsv(): void {
    const query = this.buildQuery();
    this.transactionService.exportCsv(query).subscribe({
      next: (csv) => {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-${this.year}-${this.month || 'all'}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  private load(reset: boolean): void {
    if (reset) {
      this.page = 1;
      this.items = [];
    }

    this.loading = true;
    this.transactionService
      .list(this.buildQuery())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result) => {
          this.items = reset ? result.items : [...this.items, ...result.items];
          this.total = result.total;
        },
        error: () => {
          this.items = [];
          this.total = 0;
        },
      });
  }

  private buildQuery(): TransactionQuery {
    return {
      month: this.month === '' ? null : this.month,
      year: this.year,
      type: this.type || null,
      category: this.categoryId || null,
      paidBy: this.paidBy || null,
      q: this.q || null,
      page: this.page,
      limit: PAGE_SIZE,
    };
  }
}
