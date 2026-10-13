import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'cliente'] },
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'sin-acceso',
    loadComponent: () =>
      import('./pages/sin-acceso/sin-acceso.component').then((m) => m.SinAccesoComponent),
  },
  { path: '**', redirectTo: 'login' },
];
