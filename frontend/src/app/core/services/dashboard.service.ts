import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  get(month: number, year: number): Observable<DashboardData> {
    return this.api.get<DashboardData>('/dashboard', { month, year });
  }
}
