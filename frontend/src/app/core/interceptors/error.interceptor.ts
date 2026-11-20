import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MESSAGES, TOKEN_KEY, USER_KEY } from '../constants';
import { ToastService } from '../services/toast.service';
import { SKIP_ERROR_TOAST } from './http-context';

/** Clears expired sessions and turns HTTP failures into readable Arabic toasts. */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogin = request.url.includes('/auth/login');

      if (error.status === 401 && !isLogin) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        toast.error(MESSAGES.unauthorized);
        void router.navigate(['/login']);
        return throwError(() => error);
      }

      if (!request.context.get(SKIP_ERROR_TOAST)) {
        const message =
          (error.error as { message?: string } | null)?.message ??
          (error.status === 0 ? MESSAGES.networkError : MESSAGES.genericError);
        toast.error(message);
      }

      return throwError(() => error);
    }),
  );
};
