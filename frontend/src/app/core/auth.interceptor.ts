import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL, AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  const peticion =
    token && req.url.startsWith(API_URL)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      // Token vencido o inválido en una ruta protegida: se cierra la sesión
      if (err.status === 401 && token && !req.url.endsWith('/login')) {
        auth.cerrarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
