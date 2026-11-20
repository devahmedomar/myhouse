import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PAGE_SIZE } from '../constants';
import { skipErrorToast } from '../interceptors/http-context';
import {
  Transaction,
  TransactionPage,
  TransactionPayload,
  TransactionQuery,
} from '../models/transaction.model';
import { MessageResponse } from './auth.service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  // Cached row keeps the form responsive when navigating from the list.
  private readonly selectedSubject = new BehaviorSubject<Transaction | null>(null);
  readonly selected$ = this.selectedSubject.asObservable();

  constructor(private readonly api: ApiService) {}

  get selected(): Transaction | null {
    return this.selectedSubject.value;
  }

  remember(transaction: Transaction): void {
    this.selectedSubject.next(transaction);
  }

  get(id: string): Observable<Transaction> {
    return this.api.get<Transaction>(`/transactions/${id}`);
  }

  list(query: TransactionQuery): Observable<TransactionPage> {
    return this.api.get<TransactionPage>('/transactions', {
      ...query,
      limit: query.limit ?? PAGE_SIZE,
    });
  }

  create(body: TransactionPayload): Observable<Transaction> {
    return this.api.post<Transaction>('/transactions', body);
  }

  update(id: string, body: TransactionPayload): Observable<Transaction> {
    return this.api.put<Transaction>(`/transactions/${id}`, body);
  }

  delete(id: string): Observable<MessageResponse> {
    return this.api.delete<MessageResponse>(`/transactions/${id}`, skipErrorToast());
  }

  exportCsv(query: TransactionQuery): Observable<string> {
    return this.api.getText('/transactions/export', query);
  }
}
