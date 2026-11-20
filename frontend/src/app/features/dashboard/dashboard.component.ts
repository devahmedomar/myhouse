import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { finalize, forkJoin } from 'rxjs';
import { CURRENCY, LABELS, MONTHS_AR } from '../../core/constants';
import { Budget } from '../../core/models/budget.model';
import { DashboardData } from '../../core/models/dashboard.model';
import { BudgetService } from '../../core/services/budget.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { LoadingComponent } from '../../shared/components/loading.component';

interface BudgetProgress {
  label: string;
  spent: number;
  budget: number;
  percent: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BaseChartDirective, LoadingComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly labels = LABELS;
  readonly months = MONTHS_AR;
  readonly currency = CURRENCY;

  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  years: number[] = [];
  data: DashboardData | null = null;
  loading = false;
  progress: BudgetProgress[] = [];

  doughnutData: ChartData = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  };
  doughnutOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  barData: ChartData = {
    labels: [],
    datasets: [{ label: LABELS.expenses, data: [], backgroundColor: '#0f766e' }],
  };
  barOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  private readonly dashboardService = inject(DashboardService);
  private readonly budgetService = inject(BudgetService);

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, index) => currentYear - index);
    this.load();
  }

  load(): void {
    this.loading = true;
    forkJoin({
      dashboard: this.dashboardService.get(this.month, this.year),
      budgets: this.budgetService.list(this.month, this.year),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ dashboard, budgets }) => {
          this.data = dashboard;
          this.buildCharts(dashboard);
          this.buildProgress(dashboard, budgets);
        },
        error: () => {
          this.data = null;
          this.progress = [];
        },
      });
  }

  shiftMonth(delta: number): void {
    let next = this.month + delta;
    let nextYear = this.year;
    if (next < 1) {
      next = 12;
      nextYear -= 1;
    } else if (next > 12) {
      next = 1;
      nextYear += 1;
    }
    this.month = next;
    this.year = nextYear;
    this.load();
  }

  progressClass(percent: number): string {
    if (percent >= 100) return 'danger';
    if (percent >= 80) return 'warning';
    return 'ok';
  }

  private buildCharts(data: DashboardData): void {
    const palette = ['#0f766e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

    this.doughnutData = {
      labels: data.byCategory.map((category) => category.name),
      datasets: [
        {
          data: data.byCategory.map((category) => category.total),
          backgroundColor: data.byCategory.map((_, index) => palette[index % palette.length]),
        },
      ],
    };

    this.barData = {
      labels: data.byDay.map((entry) => String(entry.day)),
      datasets: [
        {
          label: LABELS.expenses,
          data: data.byDay.map((entry) => entry.total),
          backgroundColor: '#0f766e',
        },
      ],
    };
  }

  private buildProgress(data: DashboardData, budgets: Budget[]): void {
    const items: BudgetProgress[] = [];

    const totalBudget = budgets.find((budget) => budget.category === null);
    if (totalBudget) {
      items.push(
        this.makeProgress(
          LABELS.totalBudget,
          data.totals.expenses,
          Number(totalBudget.amount),
        ),
      );
    }

    budgets
      .filter((budget) => budget.category !== null)
      .forEach((budget) => {
        const spent =
          data.byCategory.find((category) => category._id === budget.category?._id)?.total ?? 0;
        items.push(this.makeProgress(budget.category?.name ?? '', spent, Number(budget.amount)));
      });

    this.progress = items;
  }

  private makeProgress(label: string, spent: number, budget: number): BudgetProgress {
    return {
      label,
      spent,
      budget,
      percent: budget > 0 ? Math.round((spent / budget) * 100) : 0,
    };
  }
}
