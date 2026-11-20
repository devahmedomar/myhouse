import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LABELS, MESSAGES } from '../../core/constants';
import { Category } from '../../core/models/category.model';
import { TransactionType } from '../../core/models/user.model';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmComponent } from '../../shared/components/confirm.component';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, LoadingComponent, ConfirmComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);

  readonly labels = LABELS;
  readonly messages = MESSAGES;

  typeFilter: TransactionType | '' = '';
  categories: Category[] = [];
  loading = false;
  formVisible = false;
  editingId: string | null = null;
  confirmVisible = false;
  pendingDelete: Category | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    icon: ['📦', [Validators.required]],
    type: ['expense' as TransactionType, [Validators.required]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService
      .getCategories(this.typeFilter || null)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (categories) => (this.categories = categories),
        error: () => (this.categories = []),
      });
  }

  openAdd(): void {
    this.editingId = null;
    this.form.reset({ name: '', icon: '📦', type: this.typeFilter || 'expense' });
    this.formVisible = true;
  }

  openEdit(category: Category): void {
    this.editingId = category._id;
    this.form.setValue({ name: category.name, icon: category.icon ?? '', type: category.type });
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingId = null;
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, icon, type } = this.form.getRawValue();
    const request$ = this.editingId
      ? this.categoryService.update(this.editingId, { name, icon })
      : this.categoryService.create({ name, icon, type });

    request$.subscribe({
      next: () => {
        this.toast.success(MESSAGES.saveSuccess);
        this.closeForm();
        this.load();
      },
      error: () => this.toast.error(MESSAGES.genericError),
    });
  }

  requestDelete(category: Category): void {
    this.pendingDelete = category;
    this.confirmVisible = true;
  }

  confirmDelete(): void {
    const target = this.pendingDelete;
    this.confirmVisible = false;
    this.pendingDelete = null;
    if (!target) return;

    this.categoryService.delete(target._id).subscribe({
      next: () => {
        this.toast.success(MESSAGES.deleteSuccess);
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        const used = error.status === 400 || error.status === 409;
        this.toast.error(used ? MESSAGES.categoryInUse : MESSAGES.deleteFailed);
      },
    });
  }
}
