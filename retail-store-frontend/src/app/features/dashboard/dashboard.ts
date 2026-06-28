import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReportSummary } from '../../core/models';
import { ReportService } from '../../core/report.service';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-0.5">Store performance at a glance</p>
      </div>
    </div>

    @if (loading()) {
      <div class="grid gap-4 sm:grid-cols-3 mb-6">
        @for (i of [1,2,3]; track i) {
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-pulse">
            <div class="flex items-center justify-between mb-4">
              <div class="h-3 bg-slate-200 rounded w-24"></div>
              <div class="w-9 h-9 bg-slate-200 rounded-lg"></div>
            </div>
            <div class="h-8 bg-slate-200 rounded w-32"></div>
          </div>
        }
      </div>
    } @else if (error()) {
      <div class="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
        </svg>
        {{ error() }}
      </div>
    } @else if (summary(); as data) {
      <!-- KPI cards -->
      <div class="grid gap-4 sm:grid-cols-3 mb-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-medium text-slate-500">Total Revenue</p>
            <div class="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900 tabular-nums">{{ data.totalRevenue | currency }}</p>
          <p class="text-xs text-slate-400 mt-1">All time</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-medium text-slate-500">Total Sales</p>
            <div class="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900 tabular-nums">{{ data.salesCount }}</p>
          <p class="text-xs text-slate-400 mt-1">Transactions</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-medium text-slate-500">Active Products</p>
            <div class="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900 tabular-nums">{{ data.totalProducts }}</p>
          <p class="text-xs text-slate-400 mt-1">In catalog</p>
        </div>
      </div>

      <!-- Bottom panels -->
      <div class="grid gap-5 lg:grid-cols-2">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-slate-900 mb-4">Top Selling Products</h2>
          @if (data.topProducts.length === 0) {
            <div class="py-10 text-center">
              <svg class="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625Z"/>
              </svg>
              <p class="text-sm text-slate-400">No sales data yet</p>
            </div>
          } @else {
            <ul class="space-y-3">
              @for (item of data.topProducts; track item.productId; let i = $index) {
                <li>
                  <div class="flex items-center justify-between text-sm mb-1.5">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-xs font-bold text-slate-400 w-4 shrink-0">{{ i + 1 }}</span>
                      <span class="font-medium text-slate-800 truncate">{{ item.name }}</span>
                    </div>
                    <div class="text-right shrink-0 ml-3">
                      <span class="font-semibold text-slate-900 tabular-nums">{{ item.revenue | currency }}</span>
                      <span class="text-xs text-slate-400 ml-1.5">{{ item.unitsSold }} sold</span>
                    </div>
                  </div>
                  <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-1.5 bg-indigo-500 rounded-full transition-all duration-500"
                      [style.width]="barWidth(item.unitsSold) + '%'"
                    ></div>
                  </div>
                </li>
              }
            </ul>
          }
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-slate-900">Low Stock Alert</h2>
            @if (data.lowStockProducts.length > 0) {
              <span class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                {{ data.lowStockProducts.length }} item(s)
              </span>
            }
          </div>
          @if (data.lowStockProducts.length === 0) {
            <div class="py-10 text-center">
              <svg class="w-8 h-8 text-emerald-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
              <p class="text-sm text-slate-500 font-medium">All products well stocked</p>
            </div>
          } @else {
            <ul class="space-y-2">
              @for (product of data.lowStockProducts; track product.id) {
                <li class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span class="text-sm text-slate-800 font-medium truncate mr-4">{{ product.name }}</span>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0"
                    [class]="product.stockQuantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ product.stockQuantity <= 0 ? 'Out of stock' : product.stockQuantity + ' left' }}
                  </span>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    }
  `,
})
export class DashboardComponent {
  private readonly reportService = inject(ReportService);

  readonly summary = signal<ReportSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly maxSold = computed(() => {
    const top = this.summary()?.topProducts ?? [];
    return top.length > 0 ? Math.max(...top.map((p) => p.unitsSold)) : 1;
  });

  constructor() {
    this.reportService.summary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
      },
    });
  }

  barWidth(unitsSold: number): number {
    const max = this.maxSold();
    return max > 0 ? Math.round((unitsSold / max) * 100) : 0;
  }
}
