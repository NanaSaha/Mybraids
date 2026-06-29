import { Routes } from '@angular/router';
import { authGuard, providerGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent),
  },
  {
    path: 'provider/:id',
    loadComponent: () => import('./pages/provider-profile/provider-profile.component').then(m => m.ProviderProfileComponent),
  },
  {
    path: 'book/:providerId',
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'dashboard/client',
    loadComponent: () => import('./pages/dashboard/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/provider',
    loadComponent: () => import('./pages/dashboard/provider-dashboard/provider-dashboard.component').then(m => m.ProviderDashboardComponent),
    canActivate: [providerGuard],
  },
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./pages/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
