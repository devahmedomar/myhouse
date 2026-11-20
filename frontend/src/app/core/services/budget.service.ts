import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Budget, BudgetPayload } from '../models/budget.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  constructor(private readonly api: ApiService) {}

  list(month: number, year: number): Observable<Budget[]> {
    return this.api.get<Budget[]>('/budgets', { month, year });
  }

  save(body: BudgetPayload): Observable<Budget> {
    return this.api.put<Budget>('/budgets', body);
  }
}
