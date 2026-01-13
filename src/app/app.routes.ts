import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => {
      return import('./pages/dashboard/dashboard').then((m) => m.Dashboard);
    },
  },
  {
    path: 'character',
    loadComponent: () => {
      return import('./pages/character/character').then((m) => m.Character);
    },
  },
  {
    path: 'milestones',
    loadComponent: () => {
      return import('./pages/milestones/milestones').then((m) => m.Milestones);
    },
  },
  {
    path: 'campaign',
    loadComponent: () => {
      return import('./pages/campaign/campaign').then((m) => m.Campaign);
    },
  },
  {
    path: 'auth/login',
    loadComponent: () => {
      return import('./pages/auth/login/login').then((m) => m.Login);
    },
  },
];
