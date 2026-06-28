import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Sale } from '../../core/models';
import { SaleService } from '../../core/sale.service';

@Component({
  selector: 'app-invoice',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto">
      <!-- Toolbar -->
      <div class="flex items-center justify-between mb-5 no-print">
        <a
          routerLink="/sales"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600
                 hover:text-slate-900 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 19.5 8.25 12l7.5-7.5"/>
          </svg>
          Back to sales
        </a>
        @if (sale()) {
          <button
            type="button"
            (click)="print()"
            class="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold
                   text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 transition-colors duration-150"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"/>
            </svg>
            Print
          </button>
        }
      </div>

      @if (loading()) {
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 animate-pulse">
          <div class="flex justify-between mb-6">
            <div>
              <div class="h-7 bg-slate-200 rounded w-24 mb-2"></div>
              <div class="h-4 bg-slate-200 rounded w-16"></div>
            </div>
            <div class="text-right">
              <div class="h-5 bg-slate-200 rounded w-28 mb-2"></div>
              <div class="h-4 bg-slate-200 rounded w-36"></div>
            </div>
          </div>
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="h-4 bg-slate-200 rounded w-full"></div>
            }
          </div>
        </div>
      } @else if (error()) {
        <div class="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
          </svg>
          {{ error() }}
        </div>
      } @else if (sale(); as inv) {
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <!-- Invoice header -->
          <div class="p-7 border-b border-slate-100">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <span class="font-bold text-slate-900">RetailStore</span>
                </div>
                <p class="text-xs text-slate-400 mt-1">Invoice</p>
              </div>
              <div class="text-right">
                <p class="font-mono font-bold text-2xl text-slate-900">#{{ inv.id }}</p>
                <p class="text-xs text-slate-500 mt-1">{{ inv.createdAt | date: 'MMMM d, y · h:mm a' }}</p>
                @if (inv.cashier) {
                  <p class="text-xs text-slate-500">Cashier: {{ inv.cashier.name }}</p>
                }
              </div>
            </div>
          </div>

          <!-- Line items -->
          <div class="px-7 py-5">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-xs font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th class="pb-2 text-left font-medium">Product</th>
                  <th class="pb-2 text-right font-medium">Unit price</th>
                  <th class="pb-2 text-right font-medium">Qty</th>
                  <th class="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of inv.items; track item.id) {
                  <tr>
                    <td class="py-3 font-medium text-slate-800">
                      {{ item.product?.name ?? 'Product #' + item.productId }}
                    </td>
                    <td class="py-3 text-right text-slate-500 tabular-nums">{{ item.unitPrice | currency }}</td>
                    <td class="py-3 text-right text-slate-500 tabular-nums">{{ item.quantity }}</td>
                    <td class="py-3 text-right font-medium text-slate-900 tabular-nums">{{ item.lineTotal | currency }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div class="px-7 py-5 bg-slate-50 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">Total amount</span>
              <span class="text-2xl font-bold text-slate-900 tabular-nums">{{ inv.total | currency }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class InvoiceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly saleService = inject(SaleService);

  readonly sale = signal<Sale | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.get(id).subscribe({
      next: (sale) => {
        this.sale.set(sale);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load invoice.');
        this.loading.set(false);
      },
    });
  }

  print(): void {
    window.print();
  }
}
