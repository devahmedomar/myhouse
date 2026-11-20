import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly subject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.subject.asObservable();
  private nextId = 1;

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this.subject.next(this.subject.value.filter((toast) => toast.id !== id));
  }

  private show(message: string, type: ToastType, duration = 4000): void {
    const toast: Toast = { id: this.nextId++, message, type };
    this.subject.next([...this.subject.value, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }
}
