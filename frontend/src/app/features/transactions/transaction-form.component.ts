import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { LABELS, MESSAGES, todayString } from '../../core/constants';
import { Category } from '../../core/models/category.model';
import { Transaction, TransactionPayload, TransactionType } from '../../core/models/transaction.model';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { TransactionService } from '../../core/services/transaction.service';
import { UserService } from '../../core/services/user.service';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingComponent],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss',
})
export class TransactionFormComponent implements OnInit {
  readonly labels = LABELS;
  readonly messages = MESSAGES;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly transactionService = inject(TransactionService);
  private readonly categoryService = inject(CategoryService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  id: string | null = null;
  loading = false;
  saving = false;
  categories: Category[] = [];
  users: User[] = [];

  readonly form = this.fb.nonNullable.group({
    type: ['expense' as TransactionType, [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    category: ['', [Validators.required]],
    date: [todayString(), [Validators.required]],
    note: ['', [Validators.maxLength(200)]],
    paidBy: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loading = true;

    forkJoin({
      users: this.userService.getUsers(),
      categories: this.categoryService.getCategories(),
      fetched: this.id ? this.transactionService.get(this.id) : of(null),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ users, categories, fetched }) => {
          this.users = users;
          this.categories = categories;

          const edited = fetched ?? this.editedTransaction();
          if (this.id && edited) {
            this.form.patchValue({
              type: edited.type,
              amount: Number(edited.amount),
              category: edited.category?._id ?? '',
              date: (edited.date ?? '').slice(0, 10) || todayString(),
              note: edited.note ?? '',
              paidBy: edited.paidBy?._id ?? '',
            });
          } else if (this.id) {
            this.toast.error(MESSAGES.noEditData);
            void this.router.navigate(['/transactions']);
          } else {
            // New transactions are filled with the logged-in user by default.
            this.form.controls.paidBy.setValue(this.auth.user?._id ?? users[0]?._id ?? '');
          }
        },
        error: () => {
          this.toast.error(MESSAGES.noEditData);
          void this.router.navigate(['/transactions']);
        },
      });
  }

  get categoriesForType(): Category[] {
    const type = this.form.controls.type.value;
    return this.categories.filter((category) => category.type === type);
  }

  onTypeChange(): void {
    this.form.controls.category.setValue('');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload: TransactionPayload = this.form.getRawValue();
    const request$ = this.id
      ? this.transactionService.update(this.id, payload)
      : this.transactionService.create(payload);

    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.toast.success(MESSAGES.saveSuccess);
          void this.router.navigate(['/transactions']);
        },
        error: () => this.toast.error(MESSAGES.genericError),
      });
  }

  private editedTransaction(): Transaction | null {
    const state = history.state as { transaction?: Transaction };
    return state.transaction ?? this.transactionService.selected;
  }
}
