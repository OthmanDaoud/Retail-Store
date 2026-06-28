import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Sale } from '../../core/models';
import { SaleService } from '../../core/sale.service';

@Component({
  selector: 'app-sales-list',
  imports: [CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Sales</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ total() }} transaction(s)</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200 text-left">
          <tr>
            <th class="px-4 py-3 font-medium text-slate-500">Invoice</th>
            <th class="px-4 py-3 font-medium text-slate-500">Date</th>
            <th class="px-4 py-3 font-medium text-slate-500">Cashier</th>
            <th class="px-4 py-3 font-medium text-slate-500 text-center">Items</th>
            <th class="px-4 py-3 font-medium text-slate-500 text-right">Total</th>
            <th class="px-4 py-3 font-medium text-slate-500 text-right sr-only">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @if (loading()) {
            @for (i of [1,2,3,4,5]; track i) {
              <tr class="animate-pulse">
                <td class="px-4 py-3.5"><div class="h-3.5 bg-slate-200 rounded w-10"></div></td>
                <td class="px-4 py-3.5"><div class="h-3.5 bg-slate-200 rounded w-32"></div></td>
                <td class="px-4 py-3.5"><div class="h-3.5 bg-slate-200 rounded w-20"></div></td>
                <td class="px-4 py-3.5 text-center"><div class="h-5 bg-slate-200 rounded-full w-6 mx-auto"></div></td>
                <td class="px-4 py-3.5 text-right"><div class="h-3.5 bg-slate-200 rounded w-16 ml-auto"></div></td>
                <td class="px-4 py-3.5 text-right"><div class="h-3.5 bg-slate-200 rounded w-8 ml-auto"></div></td>
              </tr>
            }
          } @else {
            @for (sale of sales(); track sale.id) {
              <tr
                class="hover:bg-slate-50 cursor-pointer transition-colors duration-100"
                (click)="viewSale(sale.id)"
                role="button"
                [attr.aria-label]="'View sale #' + sale.id"
              >
                <td class="px-4 py-3.5">
                  <span class="font-mono font-semibold text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded-md">
                    #{{ sale.id }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-slate-600">{{ sale.createdAt | date: 'MMM d, y · h:mm a' }}</td>
                <td class="px-4 py-3.5">
                  @if (sale.cashier?.name) {
                    <span class="inline-flex items-center gap-1.5 text-slate-700">
                      <span class="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {{ sale.cashier!.name.charAt(0).toUpperCase() }}
                      </span>
                      {{ sale.cashier!.name }}
                    </span>
                  } @else {
                    <span class="text-slate-400">—</span>
                  }
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span class="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold w-6 h-6">
                    {{ sale.items.length }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                  {{ sale.total | currency }}
                </td>
                <td class="px-4 py-3.5 text-right">
                  <svg class="w-4 h-4 text-slate-400 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                  </svg>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-16 text-center">
                  <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/>
                  </svg>
                  <p class="text-slate-500 font-medium">No sales yet</p>
                  <p class="text-slate-400 text-xs mt-1">Completed sales will appear here</p>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>

      @if (error()) {
        <p class="px-4 py-3 text-sm text-red-600 border-t border-slate-100" role="alert">{{ error() }}</p>
      }
    </div>

    <div class="flex items-center justify-between mt-4 text-sm text-slate-600">
      <span class="text-slate-500">
        Page {{ page() }} of {{ totalPages() }}
      </span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="prevPage()"
          [disabled]="page() <= 1"
          class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm
                 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-colors duration-150"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 19.5 8.25 12l7.5-7.5"/>
          </svg>
          Prev
        </button>
        <button
          type="button"
          (click)="nextPage()"
          [disabled]="page() >= totalPages()"
          class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm
                 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-colors duration-150"
        >
          Next
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class SalesListComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);

  readonly page = signal(1);
  private readonly limit = 10;

  readonly sales = signal<Sale[]>([]);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadSales();
  }

  private loadSales(): void {
    this.loading.set(true);
    this.error.set(null);

    this.saleService.list({ page: this.page(), limit: this.limit }).subscribe({
      next: (result) => {
        this.sales.set(result.items);
        this.total.set(result.total);
        this.totalPages.set(Math.max(1, result.totalPages));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load sales.');
        this.loading.set(false);
      },
    });
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.loadSales();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.loadSales();
    }
  }

  viewSale(id: number): void {
    this.router.navigate(['/sales', id]);
  }
}
