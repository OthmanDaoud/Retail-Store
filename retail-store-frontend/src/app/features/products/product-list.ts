import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { CategoryService } from '../../core/category.service';
import { Category, Product, ProductQuery } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { StockService } from '../../core/stock.service';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ total() }} items total</p>
      </div>
      @if (isManager()) {
        <a
          routerLink="/products/new"
          class="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold
                 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 transition-colors duration-150"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Add product
        </a>
      }
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div class="lg:col-span-2">
        <label for="search" class="block text-xs font-medium text-slate-500 mb-1.5">Search</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
          </svg>
          <input
            id="search"
            type="search"
            placeholder="Search by name…"
            [value]="search()"
            (input)="onSearch($any($event.target).value)"
            class="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900
                   placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500
                   focus:border-transparent transition-all duration-150"
          />
        </div>
      </div>

      <div>
        <label for="category" class="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
        <select
          id="category"
          [value]="categoryId()"
          (change)="onCategory($any($event.target).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 transition-all duration-150"
        >
          <option value="">All categories</option>
          @for (cat of categories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
      </div>

      <div>
        <label for="minPrice" class="block text-xs font-medium text-slate-500 mb-1.5">Min price</label>
        <input
          id="minPrice"
          type="number"
          min="0"
          placeholder="0"
          [value]="minPrice()"
          (input)="onMinPrice($any($event.target).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900
                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500
                 focus:border-transparent transition-all duration-150"
        />
      </div>

      <div>
        <label for="maxPrice" class="block text-xs font-medium text-slate-500 mb-1.5">Max price</label>
        <input
          id="maxPrice"
          type="number"
          min="0"
          placeholder="Any"
          [value]="maxPrice()"
          (input)="onMaxPrice($any($event.target).value)"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900
                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500
                 focus:border-transparent transition-all duration-150"
        />
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-500 text-left border-b border-slate-200">
          <tr>
            <th class="px-4 py-3 font-medium">
              <button type="button" (click)="toggleSort('name')"
                class="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
                Name
                <span class="text-slate-400">{{ sortIndicator('name') }}</span>
              </button>
            </th>
            <th class="px-4 py-3 font-medium">Category</th>
            <th class="px-4 py-3 font-medium text-right">
              <button type="button" (click)="toggleSort('price')"
                class="inline-flex items-center gap-1 hover:text-slate-900 transition-colors ml-auto">
                Price
                <span class="text-slate-400">{{ sortIndicator('price') }}</span>
              </button>
            </th>
            <th class="px-4 py-3 font-medium text-right">
              <button type="button" (click)="toggleSort('stockQuantity')"
                class="inline-flex items-center gap-1 hover:text-slate-900 transition-colors ml-auto">
                Stock
                <span class="text-slate-400">{{ sortIndicator('stockQuantity') }}</span>
              </button>
            </th>
            @if (isManager()) {
              <th class="px-4 py-3 font-medium text-right">Actions</th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @if (loading()) {
            @for (i of skeletonRows; track i) {
              <tr class="animate-pulse">
                <td class="px-4 py-3.5"><div class="h-3.5 bg-slate-200 rounded w-36"></div></td>
                <td class="px-4 py-3.5"><div class="h-3.5 bg-slate-200 rounded w-20"></div></td>
                <td class="px-4 py-3.5 text-right"><div class="h-3.5 bg-slate-200 rounded w-14 ml-auto"></div></td>
                <td class="px-4 py-3.5 text-right"><div class="h-5 bg-slate-200 rounded-full w-12 ml-auto"></div></td>
                @if (isManager()) {
                  <td class="px-4 py-3.5 text-right"><div class="h-3.5 bg-slate-200 rounded w-16 ml-auto"></div></td>
                }
              </tr>
            }
          } @else {
            @for (product of products(); track product.id) {
              <tr class="hover:bg-slate-50 transition-colors duration-100">
                <td class="px-4 py-3.5 font-medium text-slate-900">{{ product.name }}</td>
                <td class="px-4 py-3.5">
                  <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {{ product.category?.name }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right font-medium text-slate-900 tabular-nums">
                  {{ product.price | currency }}
                </td>
                <td class="px-4 py-3.5 text-right">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
                    [class]="stockClass(product.stockQuantity)"
                  >
                    {{ product.stockQuantity }}
                  </span>
                </td>
                @if (isManager()) {
                  <td class="px-4 py-3.5 text-right space-x-3 whitespace-nowrap">
                    <a
                      [routerLink]="['/products', product.id, 'edit']"
                      class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >Edit</a>
                    <button
                      type="button"
                      (click)="remove(product)"
                      class="text-red-500 hover:text-red-700 font-medium transition-colors"
                    >Delete</button>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="isManager() ? 5 : 4" class="px-4 py-16 text-center">
                  <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/>
                  </svg>
                  <p class="text-slate-500 font-medium">No products found</p>
                  <p class="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
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
export class ProductListComponent implements OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly auth = inject(AuthService);
  private readonly stockService = inject(StockService);
  private readonly stockSub: Subscription;

  readonly isManager = this.auth.isManager;
  readonly categories = signal<Category[]>([]);
  readonly skeletonRows = [1, 2, 3, 4, 5];

  readonly search = signal('');
  readonly categoryId = signal<string>('');
  readonly minPrice = signal<string>('');
  readonly maxPrice = signal<string>('');
  readonly sortBy = signal<'name' | 'price' | 'stockQuantity' | 'createdAt'>('createdAt');
  readonly sortOrder = signal<'ASC' | 'DESC'>('DESC');
  readonly page = signal(1);
  private readonly limit = 10;

  readonly products = signal<Product[]>([]);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.categoryService.list().subscribe((categories) => this.categories.set(categories));
    this.loadProducts();

    this.stockSub = this.stockService.onStockUpdated().subscribe(({ productId, newStock }) => {
      this.products.update((list) =>
        list.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock } : p)),
      );
    });
  }

  ngOnDestroy(): void {
    this.stockSub.unsubscribe();
  }

  stockClass(qty: number): string {
    if (qty <= 0) return 'bg-red-100 text-red-700';
    if (qty <= 10) return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  sortIndicator(col: string): string {
    if (this.sortBy() !== col) return '';
    return this.sortOrder() === 'ASC' ? '↑' : '↓';
  }

  private buildQuery(): ProductQuery {
    return {
      search: this.search() || undefined,
      categoryId: this.categoryId() === '' ? undefined : Number(this.categoryId()),
      minPrice: this.minPrice() === '' ? undefined : Number(this.minPrice()),
      maxPrice: this.maxPrice() === '' ? undefined : Number(this.maxPrice()),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      page: this.page(),
      limit: this.limit,
    };
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.list(this.buildQuery()).subscribe({
      next: (result) => {
        this.products.set(result.items);
        this.total.set(result.total);
        this.totalPages.set(Math.max(1, result.totalPages));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.loading.set(false);
      },
    });
  }

  private resetPageAndLoad(): void {
    this.page.set(1);
    this.loadProducts();
  }

  onSearch(value: string): void { this.search.set(value); this.resetPageAndLoad(); }
  onCategory(value: string): void { this.categoryId.set(value); this.resetPageAndLoad(); }
  onMinPrice(value: string): void { this.minPrice.set(value); this.resetPageAndLoad(); }
  onMaxPrice(value: string): void { this.maxPrice.set(value); this.resetPageAndLoad(); }

  toggleSort(column: 'name' | 'price' | 'stockQuantity'): void {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('ASC');
    }
    this.resetPageAndLoad();
  }

  prevPage(): void {
    if (this.page() > 1) { this.page.update((p) => p - 1); this.loadProducts(); }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) { this.page.update((p) => p + 1); this.loadProducts(); }
  }

  remove(product: Product): void {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    this.productService.remove(product.id).subscribe({
      next: () => this.loadProducts(),
      error: () => this.error.set('Failed to delete product.'),
    });
  }
}
