import { Routes } from '@angular/router';
import { convexAuthGuard } from 'convex-angular';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => {
      return import('./pages/dashboard/dashboard').then((m) => m.Dashboard);
    },
    canActivate: [convexAuthGuard],
  },
  {
    path: 'character',
    loadComponent: () => {
      return import('./pages/character/character').then((m) => m.Character);
    },
    canActivate: [convexAuthGuard],
  },
  {
    path: 'milestones',
    loadComponent: () => {
      return import('./pages/milestones/milestones').then((m) => m.Milestones);
    },
    canActivate: [convexAuthGuard],
  },
  {
    path: 'campaign',
    loadComponent: () => {
      return import('./pages/campaign/campaign').then((m) => m.Campaign);
    },
    canActivate: [convexAuthGuard],
  },
  {
    path: 'auth/login',
    loadComponent: () => {
      return import('./pages/auth/login/login').then((m) => m.Login);
    },
  },
];
