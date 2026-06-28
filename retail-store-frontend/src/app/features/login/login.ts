import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 mb-4">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">
            Retail<span class="text-indigo-600">Store</span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="username"
                placeholder="you@example.com"
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm
                       text-slate-900 placeholder:text-slate-400 transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm
                         text-slate-900 placeholder:text-slate-400 transition-all duration-150 pr-10
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  aria-label="Toggle password visibility"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            @if (error()) {
              <div class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5" role="alert">
                <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                </svg>
                {{ error() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
                     shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60
                     transition-colors duration-150 flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing in…
              } @else {
                Sign in
              }
            </button>
          </form>

          <div class="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
            <p class="text-xs font-semibold text-slate-600 mb-2">Demo accounts</p>
            <button
              type="button"
              (click)="fillDemo('manager@retail.com')"
              class="w-full text-left text-xs text-slate-600 hover:text-indigo-600 py-1 transition-colors"
            >
              Manager — manager&#64;retail.com
            </button>
            <button
              type="button"
              (click)="fillDemo('employee@retail.com')"
              class="w-full text-left text-xs text-slate-600 hover:text-indigo-600 py-1 transition-colors"
            >
              Employee — employee&#64;retail.com
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  fillDemo(email: string): void {
    this.form.patchValue({ email, password: 'password123' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl('/products'),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Invalid email or password.');
      },
    });
  }
}
