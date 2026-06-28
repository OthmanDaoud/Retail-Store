import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-dvh flex flex-col bg-slate-50">
      <header class="bg-white border-b border-slate-200 sticky top-0 z-40 no-print">
        <nav class="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-1 h-14">
          <a routerLink="/products" class="flex items-center gap-2 font-bold text-slate-900 mr-4 shrink-0">
            <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span class="hidden sm:inline">Retail<span class="text-indigo-600">Store</span></span>
          </a>

          <div class="flex items-center gap-0.5 flex-1">
            @for (link of navLinks; track link.path) {
              @if (!link.managerOnly || isManager()) {
                <a
                  [routerLink]="link.path"
                  routerLinkActive="text-indigo-600 bg-indigo-50"
                  [routerLinkActiveOptions]="{ exact: false }"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600
                         hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                      [attr.d]="link.icon"/>
                  </svg>
                  <span class="hidden md:inline">{{ link.label }}</span>
                </a>
              }
            }
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <div class="hidden sm:flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                {{ userInitial() }}
              </div>
              <div class="hidden lg:block text-right">
                <p class="text-xs font-medium text-slate-900 leading-none">{{ user()?.name }}</p>
                <p class="text-xs text-slate-500 capitalize mt-0.5">{{ user()?.role }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="logout()"
              aria-label="Logout"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600
                     border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/>
              </svg>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      </header>

      <main class="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">
        <router-outlet />
      </main>

      @if (toast()) {
        <div
          role="alert"
          aria-live="polite"
          class="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm
                 font-medium shadow-lg no-print animate-in"
          [class]="toast()!.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-emerald-600 text-white'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            @if (toast()!.type === 'error') {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            }
          </svg>
          {{ toast()!.message }}
        </div>
      }
    </div>
  `,
})
export class LayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly user = this.auth.user;
  readonly isManager = this.auth.isManager;
  readonly toast = this.toastService.toast;

  readonly userInitial = () => this.user()?.name?.charAt(0).toUpperCase() ?? '?';

  readonly navLinks = [
    {
      path: '/products',
      label: 'Products',
      managerOnly: false,
      icon: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z',
    },
    {
      path: '/checkout',
      label: 'New Sale',
      managerOnly: false,
      icon: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
    },
    {
      path: '/sales',
      label: 'Sales',
      managerOnly: false,
      icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z',
    },
    {
      path: '/categories',
      label: 'Categories',
      managerOnly: true,
      icon: 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V8.25A2.25 2.25 0 0 0 19.5 6h-5.69a1.5 1.5 0 0 1-1.06-.44Z',
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      managerOnly: true,
      icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
    },
  ];

  logout(): void {
    this.auth.logout();
  }
}
