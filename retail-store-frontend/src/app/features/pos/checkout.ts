import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { SaleService } from '../../core/sale.service';
import { StockService } from '../../core/stock.service';

interface CartLine {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">New Sale</h1>
        <p class="text-sm text-slate-500 mt-0.5">
          {{ cart().length === 0 ? 'Add products to get started' : cart().length + ' item(s) in cart' }}
        </p>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-5">
      <!-- Product browser -->
      <div class="lg:col-span-3 flex flex-col gap-4">
        <div class="relative">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
          </svg>
          <input
            type="search"
            placeholder="Search products…"
            [value]="search()"
            (input)="search.set($any($event.target).value)"
            class="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm
                   text-slate-900 placeholder:text-slate-400 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        @if (loading()) {
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-white rounded-xl border border-slate-200 p-3.5 animate-pulse">
                <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div class="flex justify-between items-center">
                  <div class="h-4 bg-slate-200 rounded w-14"></div>
                  <div class="h-8 w-8 bg-slate-200 rounded-lg"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
            @for (product of filteredProducts(); track product.id) {
              <button
                type="button"
                (click)="addToCart(product)"
                [disabled]="product.stockQuantity === 0"
                class="bg-white rounded-xl border text-left p-3.5 transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-md hover:border-indigo-300 active:scale-[0.98]"
                [class]="isInCart(product.id)
                  ? 'border-indigo-400 ring-1 ring-indigo-400 shadow-sm'
                  : 'border-slate-200 shadow-sm'"
              >
                <p class="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 mb-1">
                  {{ product.name }}
                </p>
                <p class="text-xs text-slate-500 mb-3 truncate">{{ product.category?.name }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-900">{{ product.price | currency }}</span>
                  <div class="flex items-center gap-1.5">
                    <span
                      class="text-xs font-medium rounded-full px-1.5 py-0.5"
                      [class]="product.stockQuantity <= 0
                        ? 'bg-red-100 text-red-600'
                        : product.stockQuantity <= 10
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'"
                    >{{ product.stockQuantity === 0 ? 'Out' : product.stockQuantity }}</span>
                    @if (cartQty(product.id) > 0) {
                      <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        {{ cartQty(product.id) }}
                      </span>
                    } @else {
                      <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-lg font-light flex items-center justify-center">
                        +
                      </span>
                    }
                  </div>
                </div>
              </button>
            } @empty {
              <div class="col-span-3 py-16 text-center">
                <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
                </svg>
                <p class="text-slate-500 font-medium">No products found</p>
                <p class="text-slate-400 text-xs mt-1">Try a different search term</p>
              </div>
            }
          </div>
        }
      </div>

      <!-- Cart panel -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-20 flex flex-col">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-semibold text-slate-900">Cart</h2>
            @if (cart().length > 0) {
              <button
                type="button"
                (click)="clearCart()"
                class="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >Clear all</button>
            }
          </div>

          @if (cart().length === 0) {
            <div class="px-5 py-16 text-center">
              <svg class="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
              </svg>
              <p class="text-slate-400 text-sm">Tap a product to add it</p>
            </div>
          } @else {
            <div class="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              @for (line of cart(); track line.product.id) {
                <div class="flex items-center gap-3 px-5 py-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 truncate">{{ line.product.name }}</p>
                    <p class="text-xs text-slate-500">{{ line.product.price | currency }} each</p>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      (click)="changeQty(line, -1)"
                      aria-label="Decrease quantity"
                      class="w-7 h-7 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100
                             flex items-center justify-center transition-colors text-base font-medium"
                    >−</button>
                    <span class="w-7 text-center text-sm font-semibold tabular-nums">{{ line.quantity }}</span>
                    <button
                      type="button"
                      (click)="changeQty(line, 1)"
                      [disabled]="line.quantity >= line.product.stockQuantity"
                      aria-label="Increase quantity"
                      class="w-7 h-7 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100
                             flex items-center justify-center transition-colors text-base font-medium
                             disabled:opacity-40 disabled:cursor-not-allowed"
                    >+</button>
                  </div>
                  <span class="w-16 text-right text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                    {{ line.product.price * line.quantity | currency }}
                  </span>
                </div>
              }
            </div>

            <div class="px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-slate-600">{{ itemCount() }} item(s)</span>
                <span class="text-2xl font-bold text-slate-900 tabular-nums">{{ total() | currency }}</span>
              </div>

              @if (error()) {
                <div class="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3" role="alert">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                  </svg>
                  {{ error() }}
                </div>
              }

              <button
                type="button"
                (click)="checkout()"
                [disabled]="submitting()"
                class="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white
                       shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60
                       transition-colors duration-150 flex items-center justify-center gap-2 mt-2"
              >
                @if (submitting()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Processing…
                } @else {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                  Complete Sale
                }
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly saleService = inject(SaleService);
  private readonly stockService = inject(StockService);
  private readonly router = inject(Router);
  private readonly stockSub: Subscription;

  private readonly allProducts = signal<Product[]>([]);
  readonly search = signal('');
  readonly cart = signal<CartLine[]>([]);
  readonly submitting = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly filteredProducts = computed(() => {
    const term = this.search().toLowerCase().trim();
    const list = this.allProducts();
    return term ? list.filter((p) => p.name.toLowerCase().includes(term)) : list;
  });

  readonly total = computed(() =>
    this.cart().reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  );

  readonly itemCount = computed(() =>
    this.cart().reduce((sum, line) => sum + line.quantity, 0),
  );

  constructor() {
    this.productService
      .list({ limit: 100, sortBy: 'name', sortOrder: 'ASC' })
      .subscribe((result) => {
        this.allProducts.set(result.items);
        this.loading.set(false);
      });

    this.stockSub = this.stockService.onStockUpdated().subscribe(({ productId, newStock }) => {
      this.allProducts.update((list) =>
        list.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock } : p)),
      );
      this.cart.update((lines) =>
        lines.map((line) =>
          line.product.id === productId
            ? {
                ...line,
                product: { ...line.product, stockQuantity: newStock },
                quantity: Math.min(line.quantity, newStock),
              }
            : line,
        ).filter((line) => line.quantity > 0),
      );
    });
  }

  ngOnDestroy(): void {
    this.stockSub.unsubscribe();
  }

  isInCart(productId: number): boolean {
    return this.cart().some((line) => line.product.id === productId);
  }

  cartQty(productId: number): number {
    return this.cart().find((line) => line.product.id === productId)?.quantity ?? 0;
  }

  addToCart(product: Product): void {
    if (product.stockQuantity === 0) return;
    const existing = this.cart().find((line) => line.product.id === product.id);
    if (existing) {
      this.changeQty(existing, 1);
      return;
    }
    this.cart.update((lines) => [...lines, { product, quantity: 1 }]);
  }

  changeQty(line: CartLine, delta: number): void {
    this.cart.update((lines) =>
      lines
        .map((current) =>
          current.product.id === line.product.id
            ? { ...current, quantity: Math.min(current.product.stockQuantity, current.quantity + delta) }
            : current,
        )
        .filter((current) => current.quantity > 0),
    );
  }

  clearCart(): void {
    this.cart.set([]);
  }

  checkout(): void {
    if (this.cart().length === 0) return;
    this.submitting.set(true);
    this.error.set(null);

    const items = this.cart().map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
    }));

    this.saleService.create(items).subscribe({
      next: (sale) => this.router.navigate(['/sales', sale.id]),
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Failed to complete sale.');
      },
    });
  }
}
