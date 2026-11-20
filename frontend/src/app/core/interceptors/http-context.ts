import { HttpContext, HttpContextToken } from '@angular/common/http';

// Requests with this flag do not show the interceptor's generic toast.
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export function skipErrorToast(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_TOAST, true);
}
