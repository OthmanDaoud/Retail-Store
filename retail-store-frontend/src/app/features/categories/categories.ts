import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/category.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ categories().length }} categories</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
      <h2 class="text-sm font-semibold text-slate-900 mb-3">Add new category</h2>
      <form (ngSubmit)="submit()" class="flex items-start gap-3">
        <div class="flex-1">
          <input
            type="text"
            [(ngModel)]="newName"
            name="newName"
            placeholder="Category name…"
            required
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900
                   placeholder:text-slate-400 transition-all duration-150
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
          />
          @if (formError()) {
            <p class="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
              </svg>
              {{ formError() }}
            </p>
          }
        </div>
        <button
          type="submit"
          [disabled]="saving() || !newName.trim()"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold
                 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60
                 transition-colors duration-150 shrink-0"
        >
          @if (saving()) {
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          } @else {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
          }
          {{ saving() ? 'Saving…' : 'Add' }}
        </button>
      </form>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200 text-left">
          <tr>
            <th class="px-4 py-3 font-medium text-slate-500">Name</th>
            <th class="px-4 py-3 font-medium text-slate-500 text-right">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @if (loading()) {
            @for (i of [1,2,3]; track i) {
              <tr class="animate-pulse">
                <td class="px-4 py-3.5"><div class="h-3.5 bg-slate-200 rounded w-28"></div></td>
                <td class="px-4 py-3.5 text-right"><div class="h-3.5 bg-slate-200 rounded w-24 ml-auto"></div></td>
              </tr>
            }
          } @else {
            @for (cat of categories(); track cat.id) {
              <tr class="hover:bg-slate-50 transition-colors duration-100">
                <td class="px-4 py-3.5">
                  <span class="inline-flex items-center gap-2">
                    <span class="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
                      <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V8.25A2.25 2.25 0 0 0 19.5 6h-5.69a1.5 1.5 0 0 1-1.06-.44Z"/>
                      </svg>
                    </span>
                    <span class="font-medium text-slate-900">{{ cat.name }}</span>
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right text-xs text-slate-400">
                  {{ cat.createdAt ? (cat.createdAt | date : 'MMM d, y') : '—' }}
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="2" class="px-4 py-16 text-center">
                  <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V8.25A2.25 2.25 0 0 0 19.5 6h-5.69a1.5 1.5 0 0 1-1.06-.44Z"/>
                  </svg>
                  <p class="text-slate-500 font-medium">No categories yet</p>
                  <p class="text-slate-400 text-xs mt-1">Add your first category above</p>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class CategoriesComponent {
  private readonly categoryService = inject(CategoryService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  newName = '';

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.categoryService.list().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    const name = this.newName.trim();
    if (!name) return;

    this.saving.set(true);
    this.formError.set(null);

    this.categoryService.create(name).subscribe({
      next: (cat) => {
        this.categories.update((list) => [...list, cat]);
        this.newName = '';
        this.saving.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to create category.';
        this.formError.set(msg);
        this.saving.set(false);
      },
    });
  }
}
