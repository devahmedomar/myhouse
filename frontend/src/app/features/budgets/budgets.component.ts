import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { CURRENCY, LABELS, MESSAGES, MONTHS_AR } from '../../core/constants';
import { Budget, BudgetPayload } from '../../core/models/budget.model';
import { Category } from '../../core/models/category.model';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingComponent],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss',
})
export class BudgetsComponent implements OnInit {
  readonly labels = LABELS;
  readonly months = MONTHS_AR;
  readonly currency = CURRENCY;

  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  years: number[] = [];
  categories: Category[] = [];
  totalBudget: number | null = null;
  categoryBudgets: Record<string, number | null> = {};
  loading = false;
  saving = false;

  private readonly budgetService = inject(BudgetService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);

  ngOnInit(): void {
    const current = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, index) => current - index);
    this.load();
  }

  load(): void {
    this.loading = true;
    forkJoin({
      budgets: this.budgetService.list(this.month, this.year),
      categories: this.categoryService.getCategories('expense'),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ budgets, categories }) => {
          this.categories = categories;
          this.totalBudget = this.findAmount(budgets, null);
          this.categoryBudgets = {};
          categories.forEach((category) => {
            this.categoryBudgets[category._id] = this.findAmount(budgets, category._id);
          });
        },
        error: () => {
          this.categories = [];
          this.categoryBudgets = {};
          this.totalBudget = null;
        },
      });
  }

  save(): void {
    // Only send budgets the user actually entered (amount must be > 0).
    const payloads: BudgetPayload[] = [];
    if (this.totalBudget !== null && this.totalBudget > 0) {
      payloads.push({
        month: this.month,
        year: this.year,
        category: null,
        amount: Number(this.totalBudget),
      });
    }

    this.categories.forEach((category) => {
      const value = this.categoryBudgets[category._id];
      if (value !== null && value !== undefined && value > 0) {
        payloads.push({
          month: this.month,
          year: this.year,
          category: category._id,
          amount: Number(value),
        });
      }
    });

    if (!payloads.length) {
      this.toast.error(MESSAGES.enterBudget);
      return;
    }

    this.saving = true;
    forkJoin(payloads.map((payload) => this.budgetService.save(payload)))
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.toast.success(MESSAGES.saveSuccess);
          this.load();
        },
        error: () => this.toast.error(MESSAGES.genericError),
      });
  }

  private findAmount(budgets: Budget[], categoryId: string | null): number | null {
    const match = budgets.find((budget) =>
      categoryId === null ? budget.category === null : budget.category?._id === categoryId,
    );
    return match ? Number(match.amount) : null;
  }
}
