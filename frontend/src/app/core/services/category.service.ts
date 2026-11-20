import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { skipErrorToast } from '../interceptors/http-context';
import { Category } from '../models/category.model';
import { TransactionType } from '../models/user.model';
import { MessageResponse } from './auth.service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly api: ApiService) {}

  getCategories(type?: TransactionType | null): Observable<Category[]> {
    return this.api.get<Category[]>('/categories', { type: type ?? undefined });
  }

  create(body: { name: string; icon: string; type: TransactionType }): Observable<Category> {
    return this.api.post<Category>('/categories', body);
  }

  update(id: string, body: { name: string; icon: string }): Observable<Category> {
    return this.api.put<Category>(`/categories/${id}`, body);
  }

  // The component maps 400/409 to a friendly Arabic "category in use" message.
  delete(id: string): Observable<MessageResponse> {
    return this.api.delete<MessageResponse>(`/categories/${id}`, skipErrorToast());
  }
}
