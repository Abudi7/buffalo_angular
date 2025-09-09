import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Skip adding Authorization for auth endpoints (login/register)
  const isAuthEndpoint =
    req.url.startsWith(environment.API_BASE + '/api/auth/') ||
    req.url.includes('/api/auth/');

  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
