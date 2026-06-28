import { Routes } from '@angular/router';
import { authGuard, managerGuard } from './core/guards';
import { LayoutComponent } from './features/layout/layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list').then((m) => m.ProductListComponent),
      },
      {
        path: 'products/new',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./features/products/product-form').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./features/products/product-form').then((m) => m.ProductFormComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/pos/checkout').then((m) => m.CheckoutComponent),
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/sales/sales-list').then((m) => m.SalesListComponent),
      },
      {
        path: 'sales/:id',
        loadComponent: () =>
          import('./features/sales/invoice').then((m) => m.InvoiceComponent),
      },
      {
        path: 'categories',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./features/categories/categories').then((m) => m.CategoriesComponent),
      },
      {
        path: 'dashboard',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
