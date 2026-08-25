/** Signal-based dashboard store: dataset, filters, derived metrics. */
import { computed, signal } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';
import type {
  ChartDataPoint,
  FilterState,
  MetricsSummary,
  Transaction,
} from './models';

const DEFAULT_FILTERS: FilterState = { search: '', status: 'all', category: 'all' };

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly data = inject(DataService);

  readonly transactions = signal<Transaction[]>([]);
  readonly filters = signal<FilterState>(DEFAULT_FILTERS);
  readonly isLoading = signal(false);

  /** Memoized filtering — recomputes only when inputs change. */
  readonly filtered = computed<Transaction[]>(() => {
    const items = this.transactions();
    const f = this.filters();
    const q = f.search.trim().toLowerCase();
    if (q === '' && f.status === 'all' && f.category === 'all') return items;
    return items.filter(
      (t) =>
        (q === '' ||
          t.customer.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)) &&
        (f.status === 'all' || t.status === f.status) &&
        (f.category === 'all' || t.category === f.category),
    );
  });

  readonly metrics = computed<MetricsSummary>(() => {
    const items = this.filtered();
    const completed = items.filter((t) => t.status === 'completed');
    const totalRevenue = completed.reduce((s, t) => s + t.amount, 0);
    return {
      totalRevenue,
      totalTransactions: items.length,
      averageTransaction: completed.length ? totalRevenue / completed.length : 0,
      successRate: items.length ? (completed.length / items.length) * 100 : 0,
    };
  });

  /** Revenue + transaction count per day, for the line chart. */
  readonly chartData = computed<ChartDataPoint[]>(() => {
    const byDay = new Map<string, ChartDataPoint>();
    for (const t of this.filtered()) {
      const point = byDay.get(t.date) ?? { date: t.date, revenue: 0, transactions: 0 };
      if (t.status === 'completed') point.revenue += t.amount;
      point.transactions++;
      byDay.set(t.date, point);
    }
    return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly categoryShare = computed<{ category: string; count: number }[]>(() => {
    const byCategory = new Map<string, number>();
    for (const t of this.filtered()) {
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + 1);
    }
    return [...byCategory.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  });

  load(size: number): void {
    this.isLoading.set(true);
    // defer to the next macro-task so the loading state paints before the (heavy) generation
    setTimeout(() => {
      this.transactions.set(this.data.generate(size));
      this.isLoading.set(false);
    }, 30);
  }

  setFilters(filters: FilterState): void {
    this.filters.set(filters);
  }
}
