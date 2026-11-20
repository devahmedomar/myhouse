import { HttpInterceptorFn } from '@angular/common/http';
import { TOKEN_KEY } from '../constants';

/** Adds the JWT to every request except the login call. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isLogin = request.url.includes('/auth/login');

  if (token && !isLogin) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(request);
};
