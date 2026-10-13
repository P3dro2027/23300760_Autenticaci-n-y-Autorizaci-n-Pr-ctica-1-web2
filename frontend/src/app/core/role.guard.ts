import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from './auth.service';

/** Guardián de permisos: compara el rol de la sesión con data.roles de la ruta. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as Rol[];
  return auth.tieneRol(roles)
    ? true
    : router.createUrlTree(['/sin-acceso'], { queryParams: { motivo: 'permisos' } });
};
