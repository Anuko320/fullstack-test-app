import { Routes } from '@angular/router';

import { Login } from './features/auth/pages/login/login';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/pages/users-list/users-list').then((m) => m.UsersList),
    canActivate: [authGuard],
  },
];
