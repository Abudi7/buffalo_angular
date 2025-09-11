import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';

/**
 * Router rules:
 * - /login and /register are PUBLIC pages (blocked if already logged in).
 * - '' (root) loads the protected shell (header/menu) and its CHILD routes.
 *   If not authenticated, authGuard will redirect to /login.
 * - Inside the shell, '' redirects to /home.
 * - Any unknown path redirects to '' (so authGuard decides).
 */
export const routes: Routes = [
  // Public pages (available only if NOT logged in)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },

  // Protected shell with child pages
  {
    path: '',
    canActivate: [authGuard], // if not logged in -> redirect to /login
    loadComponent: () =>
      import('./layout/main-shell.component').then((m) => m.MainShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' }, // default landing inside shell
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.page').then((m) => m.AnalyticsPage),
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./features/teams/teams.page').then((m) => m.TeamsPage),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.page').then((m) => m.ReportsPage),
      },
    ],
  },

  // Fallback: any unknown route -> go to root (authGuard will send to /login if needed)
  { path: '**', redirectTo: '' },
];
