import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../core/category.service';
import { Category } from '../../core/models';
import { ProductService } from '../../core/product.service';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl">
      <div class="flex items-center gap-3 mb-6">
        <a
          routerLink="/products"
          class="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600
                 hover:bg-slate-100 transition-colors duration-150"
          aria-label="Back to products"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 19.5 8.25 12l7.5-7.5"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">
            {{ editingId() ? 'Edit product' : 'Add product' }}
          </h1>

        </div>
      </div>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5"
      >
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700 mb-1.5">
            Product name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            formControlName="name"
            placeholder="e.g. Wireless Headphones"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900
                   placeholder:text-slate-400 transition-all duration-150
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            [class.border-red-400]="invalid('name')"
            [class.focus:ring-red-400]="invalid('name')"
          />
          @if (invalid('name')) {
            <p class="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
              </svg>
              Product name is required.
            </p>
          }
        </div>

        <div>
          <label for="categoryId" class="block text-sm font-medium text-slate-700 mb-1.5">
            Category <span class="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            formControlName="categoryId"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900
                   transition-all duration-150
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
            [class.border-red-400]="invalid('categoryId')"
          >
            <option [ngValue]="null" disabled>Select a category…</option>
            @for (cat of categories(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }}</option>
            }
          </select>
          @if (invalid('categoryId')) {
            <p class="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
              </svg>
              Please select a category.
            </p>
          }
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="price" class="block text-sm font-medium text-slate-700 mb-1.5">
              Price <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">$</span>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                formControlName="price"
                placeholder="0.00"
                class="w-full rounded-lg border border-slate-300 bg-slate-50 pl-7 pr-3.5 py-2.5 text-sm text-slate-900
                       placeholder:text-slate-400 transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
                [class.border-red-400]="invalid('price')"
              />
            </div>
            @if (invalid('price')) {
              <p class="text-xs text-red-600 mt-1.5">Enter a valid price (≥ 0).</p>
            }
          </div>

          <div>
            <label for="stockQuantity" class="block text-sm font-medium text-slate-700 mb-1.5">
              Stock quantity <span class="text-red-500">*</span>
            </label>
            <input
              id="stockQuantity"
              type="number"
              min="0"
              formControlName="stockQuantity"
              placeholder="0"
              class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900
                     placeholder:text-slate-400 transition-all duration-150
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
              [class.border-red-400]="invalid('stockQuantity')"
            />
            @if (invalid('stockQuantity')) {
              <p class="text-xs text-red-600 mt-1.5">Enter a valid stock quantity (≥ 0).</p>
            }
          </div>
        </div>

        @if (error()) {
          <div class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5" role="alert">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            </svg>
            {{ error() }}
          </div>
        }

        <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <a
            routerLink="/products"
            class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700
                   hover:bg-slate-100 transition-colors duration-150"
          >Cancel</a>
          <button
            type="submit"
            [disabled]="saving()"
            class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold
                   text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60
                   transition-colors duration-150"
          >
            @if (saving()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving…
            } @else {
              {{ editingId() ? 'Save changes' : 'Add product' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = signal<Category[]>([]);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    categoryId: [null as number | null, Validators.required],
  });

  constructor() {
    this.categoryService.list().subscribe((categories) => this.categories.set(categories));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editingId.set(id);
      this.productService.get(id).subscribe((product) => {
        this.form.patchValue({
          name: product.name,
          price: product.price,
          stockQuantity: product.stockQuantity,
          categoryId: product.categoryId,
        });
      });
    }
  }

  invalid(control: string): boolean {
    const ctrl = this.form.get(control);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    const value = this.form.getRawValue();
    const input = {
      name: value.name,
      price: Number(value.price),
      stockQuantity: Number(value.stockQuantity),
      categoryId: Number(value.categoryId),
    };

    const id = this.editingId();
    const request$ = id
      ? this.productService.update(id, input)
      : this.productService.create(input);

    request$.subscribe({
      next: () => this.router.navigateByUrl('/products'),
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Failed to save product.');
      },
    });
  }
}
